from sqlalchemy import Column, Integer, String, Boolean, DateTime, BIGINT, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, index=True)
    
    # 核心生命周期与状态控制
    status = Column(String(20), default="active", index=True) # active | expired | suspended
    expire_at = Column(DateTime, nullable=True)
    
    # 订阅专属额度控制（脱离套餐后，基于此实例计算）
    traffic_total_bytes = Column(BIGINT, default=0)
    traffic_used_bytes = Column(BIGINT, default=0)
    
    # 最近一次重置流量的时间
    last_reset_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
