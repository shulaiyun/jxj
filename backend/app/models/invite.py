from sqlalchemy import Column, Integer, String, Float, DateTime, BIGINT
from sqlalchemy.sql import func
from app.db.base_class import Base

class InviteRecord(Base):
    __tablename__ = "invite_records"

    id = Column(Integer, primary_key=True, index=True)
    inviter_id = Column(Integer, index=True, nullable=False)
    invitee_id = Column(Integer, unique=True, index=True, nullable=False)
    order_id = Column(Integer, nullable=True) # Linked to the purchase that triggered the reward
    
    # Affiliate system rules tracking
    reward_type = Column(String(50), nullable=False) # 'cash', 'days', 'traffic'
    reward_amount = Column(Float, default=0.0) # Cash amount, or Traffic Bytes, or Days
    
    # Status: 'pending', 'issued', 'rejected'
    status = Column(String(50), default='pending')
    
    created_at = Column(DateTime, server_default=func.now())
