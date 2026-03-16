from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema
from app.api.deps import get_current_active_user, get_current_admin_user

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────────

class UserMe(BaseModel):
    id: int
    email: str
    uuid: str
    traffic_used_bytes: int
    traffic_total_bytes: int
    expire_at: datetime | None
    balance: float
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AdminUserOut(BaseModel):
    id: int
    email: str
    traffic_used_bytes: int
    traffic_total_bytes: int
    expire_at: datetime | None
    balance: float
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AdminUserUpdate(BaseModel):
    traffic_total_bytes: int | None = None
    expire_at: datetime | None = None
    balance: float | None = None
    is_active: bool | None = None

# ── User Endpoints ────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserMe)
async def read_user_me(current_user: User = Depends(get_current_active_user)):
    """获取当前登录用户的信息（Dashboard 首页数据来源）"""
    return current_user

# ── Admin Endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[AdminUserOut], dependencies=[Depends(get_current_admin_user)])
async def admin_list_users(db: AsyncSession = Depends(get_db)):
    """管理员：获取所有用户"""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()

@router.patch("/admin/{user_id}", response_model=AdminUserOut, dependencies=[Depends(get_current_admin_user)])
async def admin_update_user(
    user_id: int,
    update: AdminUserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """管理员：修改用户余额、流量、到期时间等"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for k, v in update.model_dump(exclude_none=True).items():
        setattr(user, k, v)
    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/admin/{user_id}", dependencies=[Depends(get_current_admin_user)])
async def admin_ban_user(user_id: int, db: AsyncSession = Depends(get_db)):
    """管理员：封禁用户"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await db.commit()
    return {"message": "User banned"}
