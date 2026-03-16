from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, BIGINT
from sqlalchemy.sql import func
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # NOTE: 余额字段，float 精度足够本场景
    balance = Column(Float, default=0.00)
    commission_balance = Column(Float, default=0.00)

    # NOTE: 流量字段使用 BIGINT 存储字节数，前端负责转换 GB/TB 展示
    traffic_used_bytes = Column(BIGINT, default=0)
    traffic_total_bytes = Column(BIGINT, default=0)

    # 协议认证
    uuid = Column(String(36), unique=True, index=True, nullable=False)

    # 订阅信息
    plan_id = Column(Integer, nullable=True)
    expire_at = Column(DateTime, nullable=True)

    # 邀请返佣
    invite_code = Column(String(32), unique=True, index=True, nullable=True)
    invited_by = Column(Integer, nullable=True)

    # 用户状态
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
