from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.models.invite import InviteRecord

class AffiliateService:
    @staticmethod
    async def process_invite_reward(db: AsyncSession, new_user_id: int, order_amount: float = 0.0):
        """
        Called when a new user registers or pays for the first time.
        Distributes configured rewards (Cash, Time, Traffic).
        """
        user_result = await db.execute(select(User).where(User.id == new_user_id))
        user = user_result.scalar_one_or_none()
        
        if not user or not user.invited_by:
            return
            
        inviter_result = await db.execute(select(User).where(User.id == user.invited_by))
        inviter = inviter_result.scalar_one_or_none()
        
        if not inviter:
            return
            
        # Example Business Strategy: 
        # 1. Registration Reward: Inviter gets +3 Days extra on their subscription
        time_reward_days = 3
        # 2. Purchase Reward: Inviter gets 20% commission
        commission_rate = 0.20
        
        if order_amount > 0:
            # Grant Cash Commission
            commission_amount = order_amount * commission_rate
            inviter.commission_balance += commission_amount
            
            record = InviteRecord(
                inviter_id=inviter.id,
                invitee_id=user.id,
                reward_type="cash",
                reward_amount=commission_amount,
                status="issued"
            )
            db.add(record)
        else:
            # Grant Time Reward for registration
            if inviter.expired_at:
                inviter.expired_at += timedelta(days=time_reward_days)
            
            record = InviteRecord(
                inviter_id=inviter.id,
                invitee_id=user.id,
                reward_type="days",
                reward_amount=time_reward_days,
                status="issued"
            )
            db.add(record)
            
        await db.commit()
