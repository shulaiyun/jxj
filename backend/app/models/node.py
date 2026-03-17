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

    # 协议扩展配置 (VLESS-Reality, Hysteria2, Trojan 等专属配置全部放在此处编解码)
    # JSON 类型适合长期扩展而不需要频繁化库表结构
    protocol_config = Column(Text, nullable=True)

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
