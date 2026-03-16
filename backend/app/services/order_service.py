import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.models.plan import Plan
from app.models.order import Order

class OrderService:
    @staticmethod
    async def create_order(db: AsyncSession, user_id: int, plan_id: int) -> Order | None:
        """Create a new pending order for a specific plan."""
        result = await db.execute(select(Plan).where(Plan.id == plan_id))
        plan = result.scalar_one_or_none()
        
        if not plan or not plan.is_active:
            return None
            
        trade_no = "ORD_" + str(uuid.uuid4()).replace("-", "")[:16].upper()
        
        order = Order(
            trade_no=trade_no,
            user_id=user_id,
            plan_id=plan_id,
            amount=plan.price,
            status="pending"
        )
        db.add(order)
        await db.commit()
        await db.refresh(order)
        return order

    @staticmethod
    async def fulfill_order(db: AsyncSession, trade_no: str) -> bool:
        """Mark order as paid and apply subscription limits to user account."""
        result = await db.execute(select(Order).where(Order.trade_no == trade_no))
        order = result.scalar_one_or_none()
        
        if not order or order.status != "pending":
            return False
            
        order.status = "paid"
        order.paid_at = datetime.utcnow()
        
        # Apply the Plan to the User
        plan_result = await db.execute(select(Plan).where(Plan.id == order.plan_id))
        plan = plan_result.scalar_one()
        
        user_result = await db.execute(select(User).where(User.id == order.user_id))
        user = user_result.scalar_one()
        
        user.plan_id = plan.id
        
        # Add traffic limit (plan.transfer_enable is absolute traffic reset for the month usually)
        # But if they are just extending, maybe we add it, depending on business rules.
        # Let's assume absolute reset for simplicity, a Next-Gen panel might reset traffic on new purchase.
        user.transfer_enable = plan.transfer_enable
        # Reset usage on new plan
        user.u = 0
        user.d = 0
        
        # Calculate new expiry date
        now = datetime.utcnow()
        if user.expired_at and user.expired_at > now:
            user.expired_at = user.expired_at + timedelta(days=plan.duration_days)
        else:
            user.expired_at = now + timedelta(days=plan.duration_days)
            
        await db.commit()
        
        # NOTE: Here we should ideally trigger Affiliate rules asynchronously
        
        return True
