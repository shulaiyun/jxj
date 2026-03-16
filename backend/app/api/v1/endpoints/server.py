from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.node import Node
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

def verify_mu_key(
    request: Request,
    authorization: str | None = Header(None)
):
    """验证后端节点通信密钥 ( MU_KEY )"""
    expected_key = getattr(settings, "MU_KEY", "NextGenPanel123")
    
    # Check query param first
    token_query = request.query_params.get("token")
    if token_query and token_query.strip() == expected_key:
        return True
        
    # Then check header
    if authorization:
        token_header = authorization.replace("Bearer", "").replace("Token", "").strip()
        if token_header == expected_key:
            return True
            
    raise HTTPException(status_code=401, detail="Invalid or Missing Node API Key")

@router.get("/UniProxy/user")
async def get_node_users(
    node_id: int, 
    db: AsyncSession = Depends(get_db),
    _auth=Depends(verify_mu_key)
):
    """
    XrayR 等后端面板获取用户列表接口
    返回拥有有效订阅且流量未耗尽的用户。
    """
    # 验证节点存在并且激活
    result_node = await db.execute(select(Node).where(Node.id == node_id, Node.is_active == True))
    node = result_node.scalar_one_or_none()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found or disabled")

    # 查询所有有效用户
    now = datetime.utcnow()
    result_users = await db.execute(
        select(User).where(
            User.is_active == True,
            User.expire_at > now,
            User.traffic_used_bytes < User.traffic_total_bytes
        )
    )
    users = result_users.scalars().all()

    # 组装适配常见后端 (如 XrayR) 的响应格式
    data = []
    for u in users:
        data.append({
            "id": u.id,
            "uuid": u.uuid,
            "speed_limit": 0, # 这里可以根据套餐设限
            "enable": 1
        })

    return {
        "msg": "ok",
        "data": data
    }

@router.get("/UniProxy/config")
async def get_node_config(
    node_id: int, 
    db: AsyncSession = Depends(get_db),
    _auth=Depends(verify_mu_key)
):
    """
    XrayR 获取节点配置接口
    """
    result_node = await db.execute(select(Node).where(Node.id == node_id, Node.is_active == True))
    node = result_node.scalar_one_or_none()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found or disabled")

    # XrayR / V2board format expects an array of configurations under data
    return {
        "msg": "ok",
        "data": [{
            "id": node.id,
            "name": node.name,
            "type": "vless" if node.protocol == "vless" else node.protocol,
            "server": node.host,
            "host": node.host,
            "port": node.port, 
            "server_port": node.port, # Some versions of XrayR look for server_port
            "network": "tcp",
            "tls": 1,
            "tls_servername": node.reality_server_names.split(',')[0] if node.reality_server_names else node.host,
            "reality_public_key": node.reality_public_key or "",
            "reality_short_id": node.reality_short_id or ""
        }]
    }


@router.post("/UniProxy/push")
async def submit_node_traffic(
    node_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
    _auth = Depends(verify_mu_key)
):
    """
    XrayR 等后端面板上报流量接口
    接收格式通常为 Array: [{"user_id": 1, "u": 1024, "d": 2048}]
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    if not isinstance(payload, list):
        payload = [payload]

    # TODO: 节点倍率计算 (获取节点的 traffic_multiplier)
    result_node = await db.execute(select(Node).where(Node.id == node_id))
    node = result_node.scalar_one_or_none()
    multiplier = node.traffic_multiplier if node else 1.0

    # 批量更新流量
    for item in payload:
        uid = item.get("user_id")
        up = int(item.get("u", 0))
        down = int(item.get("d", 0))
        
        if uid is None or (up == 0 and down == 0):
            continue

        total_usage = int((up + down) * multiplier)

        result_user = await db.execute(select(User).where(User.id == uid))
        user = result_user.scalar_one_or_none()
        
        if user:
            # 累加流量
            user.traffic_used_bytes += total_usage

    await db.commit()

    return {
        "msg": "ok",
        "data": "success"
    }
