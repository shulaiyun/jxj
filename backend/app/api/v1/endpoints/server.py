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
        "users": data
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

    # XrayR / V2board format expects fields at the root of the JSON response
    # It parses them via `serverConfig` struct in newV2board/model.go
    return {
        "server_port": node.port, 
        "tls": 1 if node.protocol != "vless" else (2 if node.reality_public_key else 1),
        "network": "tcp",
        "network_settings": {
            "path": "/",
            "host": node.host
        },
        "tls_settings": {
            "server_port": str(node.port),
            "dest": node.host,
            "xver": 0,
            "server_name": node.reality_server_names.split(',')[0] if node.reality_server_names else node.host,
            "private_key": node.reality_public_key or "",
            "short_id": node.reality_short_id or ""
        }
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
    接收格式 (newV2board): {"uid1": [u, d], "uid2": [u, d]}
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    # TODO: 节点倍率计算 (获取节点的 traffic_multiplier)
    result_node = await db.execute(select(Node).where(Node.id == node_id))
    node = result_node.scalar_one_or_none()
    multiplier = node.traffic_multiplier if node else 1.0

    # 批量更新流量
    if isinstance(payload, dict):
        for uid_str, traffic in payload.items():
            if not isinstance(traffic, list) or len(traffic) < 2:
                continue
            
            try:
                uid = int(uid_str)
            except ValueError:
                continue
                
            up = int(traffic[0])
            down = int(traffic[1])
        
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
