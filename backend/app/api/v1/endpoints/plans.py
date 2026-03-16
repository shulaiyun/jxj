from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from decimal import Decimal

from app.db.session import get_db
from app.models.plan import Plan
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────────

class PlanOut(BaseModel):
    id: int
    name: str
    description: str | None
    price_monthly: float
    price_quarterly: float | None
    price_yearly: float | None
    traffic_gb: int
    speed_mbps: int | None
    max_devices: int
    is_active: bool

    class Config:
        from_attributes = True

class PlanCreate(BaseModel):
    name: str
    description: str | None = None
    price_monthly: float
    price_quarterly: float | None = None
    price_yearly: float | None = None
    traffic_gb: int
    speed_mbps: int | None = None
    max_devices: int = 3

# ── Public Endpoints ──────────────────────────────────────────────────────────

@router.get("", response_model=List[PlanOut])
async def list_plans(db: AsyncSession = Depends(get_db)):
    """获取所有上架的套餐列表（前端商店页面使用）"""
    result = await db.execute(select(Plan).where(Plan.is_active == True))
    return result.scalars().all()

# ── Admin Endpoints ───────────────────────────────────────────────────────────

@router.post("", response_model=PlanOut, dependencies=[Depends(get_current_admin_user)])
async def create_plan(plan_in: PlanCreate, db: AsyncSession = Depends(get_db)):
    """管理员：创建新套餐"""
    plan = Plan(**plan_in.model_dump())
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan

@router.put("/{plan_id}", response_model=PlanOut, dependencies=[Depends(get_current_admin_user)])
async def update_plan(plan_id: int, plan_in: PlanCreate, db: AsyncSession = Depends(get_db)):
    """管理员：更新套餐"""
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    for field, value in plan_in.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)
    await db.commit()
    await db.refresh(plan)
    return plan

@router.delete("/{plan_id}", dependencies=[Depends(get_current_admin_user)])
async def delete_plan(plan_id: int, db: AsyncSession = Depends(get_db)):
    """管理员：删除套餐（软删除，设为 inactive）"""
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan.is_active = False
    await db.commit()
    return {"message": "Plan deactivated"}
