from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from datetime import datetime

from app.db.session import get_db
from app.models.order import Order
from app.models.plan import Plan
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────────

class OrderOut(BaseModel):
    id: int
    trade_no: str
    plan_id: int
    amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    plan_id: int
    period: str = "monthly"  # monthly | quarterly | yearly

# ── User Endpoints ────────────────────────────────────────────────────────────

@router.get("", response_model=List[OrderOut])
async def list_my_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取当前用户的订单列表"""
    result = await db.execute(
        select(Order).where(Order.user_id == current_user.id).order_by(Order.created_at.desc())
    )
    return result.scalars().all()

@router.post("/checkout", response_model=dict)
async def checkout(
    order_in: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    用户下单：
    1. 查询套餐价格
    2. 生成订单记录
    3. 返回支付跳转 URL (EPay)
    """
    # 查询套餐
    result = await db.execute(select(Plan).where(Plan.id == order_in.plan_id, Plan.is_active == True))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    # 根据周期取价格
    price_map = {
        "monthly": plan.price_monthly,
        "quarterly": plan.price_quarterly,
        "yearly": plan.price_yearly,
    }
    amount = price_map.get(order_in.period)
    if amount is None:
        raise HTTPException(status_code=400, detail="Invalid order period")

    # 生成唯一订单号
    import uuid, time
    trade_no = f"NG{int(time.time())}{uuid.uuid4().hex[:6].upper()}"

    # 保存订单（状态：pending）
    order = Order(
        trade_no=trade_no,
        user_id=current_user.id,
        plan_id=plan.id,
        amount=float(amount),
        status="pending",
        period=order_in.period,
    )
    db.add(order)
    await db.commit()

    # NOTE: 此处应生成 EPay 跳转链接，第 3 阶段实现
    # 现在返回订单信息给前端，前端显示"等待对接支付"
    return {
        "trade_no": trade_no,
        "amount": float(amount),
        "status": "pending",
        "message": "Order created. Payment gateway integration in Phase 3.",
    }

# ── Admin Endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[OrderOut], dependencies=[Depends(get_current_admin_user)])
async def admin_list_orders(db: AsyncSession = Depends(get_db)):
    """管理员：查看所有订单"""
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()
