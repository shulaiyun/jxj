from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    trade_no = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # 针对哪一个具体的订阅进行的动作
    subscription_id = Column(Integer, ForeignKey("subscriptions.id"), nullable=True, index=True)
    # 此订单买的是什么套餐（或者升级到什么套餐）
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    
    # 订单行为 (new | renew | reset_traffic | upgrade)
    action = Column(String(20), default="new", index=True)
    
    amount = Column(Float, nullable=False)
    period = Column(String(20), default="monthly")  # monthly | quarterly | yearly
    # pending → paid → completed | cancelled
    status = Column(String(20), default="pending", index=True)

    created_at = Column(DateTime, server_default=func.now())
    paid_at = Column(DateTime, nullable=True)
