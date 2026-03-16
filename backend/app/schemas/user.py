from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ── 注册/创建用户入参 ────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    invite_code: Optional[str] = None

# ── 修改用户入参 ─────────────────────────────────────────────────────────────

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None

# ── API 返回模型（注册/查询用户时的响应体）────────────────────────────────────

class UserOut(BaseModel):
    """
    NOTE: 字段名必须与 User 数据库模型完全匹配，否则序列化时会抛 ValidationError
    """
    id: int
    email: str
    uuid: str
    balance: float
    traffic_used_bytes: int
    traffic_total_bytes: int
    expire_at: Optional[datetime] = None
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

# 保持向后兼容的别名
User = UserOut
