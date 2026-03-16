from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base_class import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    trade_no = Column(String(64), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    amount = Column(Float, nullable=False)
    period = Column(String(20), default="monthly")  # monthly | quarterly | yearly
    # NOTE: pending → paid → completed | cancelled
    status = Column(String(20), default="pending", index=True)

    created_at = Column(DateTime, server_default=func.now())
    paid_at = Column(DateTime, nullable=True)
