from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Text
from sqlalchemy.sql import func
from app.db.base_class import Base

class Node(Base):
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    host = Column(String(255), nullable=False)
    port = Column(Integer, default=443)
    protocol = Column(String(50), default="vless")  # vless | hysteria2 | tuic | trojan
    country = Column(String(100), nullable=True)
    flag_emoji = Column(String(10), nullable=True)
    traffic_multiplier = Column(Float, default=1.0)

    # NOTE: VLESS-Reality 专属字段
    reality_dest = Column(String(255), nullable=True)
    reality_server_names = Column(String(500), nullable=True)
    reality_public_key = Column(String(255), nullable=True)
    reality_short_id = Column(String(64), nullable=True)

    # NOTE: Hysteria2 专属字段
    hysteria_up_mbps = Column(Integer, nullable=True)
    hysteria_down_mbps = Column(Integer, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
