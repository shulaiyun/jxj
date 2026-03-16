from fastapi import APIRouter, Depends, HTTPException, Request, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.order import Order
from app.models.plan import Plan
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import User
from app.core.config import settings
from app.services.payment_service import EPayGateway

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
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    用户下单：
    1. 查询套餐价格
    2. 生成订单记录
    3. 返回支付跳转 URL (EPay)
    """
    if not settings.EPAY_API_URL or not settings.EPAY_PID or not settings.EPAY_KEY:
        raise HTTPException(status_code=500, detail="支付网关未配置，请联系管理员")

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
    if amount is None or amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid order period or price")

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

    # Domain for callbacks
    domain = settings.PANEL_DOMAIN
    if not domain.startswith("http"):
        domain = f"http://{domain}"

    # 生成易支付链接
    epay = EPayGateway(settings.EPAY_API_URL, settings.EPAY_PID, settings.EPAY_KEY)
    
    pay_url = epay.build_payment_link(
        trade_no=trade_no,
        amount=float(amount),
        name=f"NextGen Subscription - {plan.name} ({order_in.period})",
        notify_url=f"{domain}/api/v1/orders/notify",
        return_url=f"{domain}/dashboard"
    )

    return {
        "trade_no": trade_no,
        "amount": float(amount),
        "status": "pending",
        "redirect_url": pay_url
    }

@router.api_route("/notify", methods=["GET", "POST"])
async def epay_notify(request: Request, db: AsyncSession = Depends(get_db)):
    """
    易支付异步回调通知接口
    """
    if request.method == "POST":
        content_type = request.headers.get("content-type", "")
        if "application/x-www-form-urlencoded" in content_type:
            form = await request.form()
            params = dict(form)
        else:
            params = dict(request.query_params)
    else:
        params = dict(request.query_params)

    if not params:
        return "fail"

    # 验证签名
    epay = EPayGateway(settings.EPAY_API_URL, settings.EPAY_PID, settings.EPAY_KEY)
    if not epay.verify_callback(params):
        return "error sign"

    # 验证交易状态
    trade_status = params.get("trade_status")
    if trade_status != "TRADE_SUCCESS":
        return "fail"

    trade_no = params.get("out_trade_no")
    
    # 查找订单
    result = await db.execute(select(Order).where(Order.trade_no == trade_no))
    order = result.scalar_one_or_none()
    
    if not order:
        return "order not found"
        
    if order.status == "paid":
        return "success" # 已经处理过了

    # 标记订单为已支付
    order.status = "paid"
    
    # 获取用户和套餐
    result_user = await db.execute(select(User).where(User.id == order.user_id))
    user = result_user.scalar_one_or_none()
    
    result_plan = await db.execute(select(Plan).where(Plan.id == order.plan_id))
    plan = result_plan.scalar_one_or_none()

    if user and plan:
        # 添加流量
        user.traffic_total_bytes = plan.traffic_gb * 1024 * 1024 * 1024
        user.traffic_used_bytes = 0 # 重置已用
        
        # 计算过期时间
        now = datetime.utcnow()
        if user.expire_at and user.expire_at > now:
            start_date = user.expire_at
        else:
            start_date = now
            
        if order.period == "monthly":
            user.expire_at = start_date + timedelta(days=31)
        elif order.period == "quarterly":
            user.expire_at = start_date + timedelta(days=93)
        elif order.period == "yearly":
            user.expire_at = start_date + timedelta(days=365)
            
        user.plan_id = plan.id

    await db.commit()
    return "success"


# ── Admin Endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[OrderOut], dependencies=[Depends(get_current_admin_user)])
async def admin_list_orders(db: AsyncSession = Depends(get_db)):
    """管理员：查看所有订单"""
    result = await db.execute(select(Order).order_by(Order.created_at.desc()))
    return result.scalars().all()
