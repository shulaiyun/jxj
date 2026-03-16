from sqlalchemy import Column, Integer, String, Boolean, Float, BIGINT, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)

    # NOTE: 三种周期定价，管理员可以只填月付，其余留空表示不提供
    price_monthly = Column(Float, default=9.9)
    price_quarterly = Column(Float, nullable=True)
    price_yearly = Column(Float, nullable=True)

    # Traffic in GB (方便展示)
    traffic_gb = Column(Integer, default=100)
    speed_mbps = Column(Integer, nullable=True)  # None 表示不限速
    max_devices = Column(Integer, default=3)

    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
