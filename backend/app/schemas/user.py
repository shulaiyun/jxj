from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str
    invite_code: Optional[str] = None

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: int
    balance: float
    commission_balance: float
    u: int
    d: int
    transfer_enable: int
    uuid: str
    invite_code: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Additional properties to return via API
class User(UserInDBBase):
    pass
