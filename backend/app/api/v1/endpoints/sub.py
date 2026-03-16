import base64
import json
import yaml
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.responses import PlainTextResponse
from typing import Optional
from datetime import datetime

from app.db.session import get_db
from app.models.user import User
from app.models.node import Node
from app.api.deps import get_current_active_user
from app.core.security import verify_token
from app.core.config import settings

router = APIRouter()

def build_vless_uri(node: Node, user: User) -> str:
    """Build VLESS share link"""
    # vless://user_uuid@host:port?encryption=none&security=reality&sni=dest_override&pbk=public_key&sid=short_id&type=tcp#NodeName
    # Using dummy uuid if none exists? The db has uuid for user
    params = []
    params.append("encryption=none")
    if getattr(node, "protocol", "vless") == "vless":
        params.append("security=reality")
        if node.reality_server_names:
            sni = node.reality_server_names.split(',')[0]
            params.append(f"sni={sni}")
        if node.reality_public_key:
            params.append(f"pbk={node.reality_public_key}")
        if node.reality_short_id:
            params.append(f"sid={node.reality_short_id}")
        params.append("type=tcp")
        
    query = "&".join(params)
    import urllib.parse
    name = urllib.parse.quote(node.name)
    return f"vless://{user.uuid}@{node.host}:{node.port}?{query}#{name}"

def build_hysteria2_uri(node: Node, user: User) -> str:
    """Build Hysteria2 share link"""
    # hysteria2://uuid@host:port?sni=hostname&up=mbps&down=mbps#NodeName
    params = []
    # For Hysteria2, password is often the user UUID
    if getattr(node, "reality_server_names", None):
        sni = node.reality_server_names.split(',')[0]
        params.append(f"sni={sni}")
        
    if getattr(node, "hysteria_up_mbps", None):
        params.append(f"up={node.hysteria_up_mbps}mbps")
    if getattr(node, "hysteria_down_mbps", None):
        params.append(f"down={node.hysteria_down_mbps}mbps")
        
    query = "&".join(params)
    import urllib.parse
    name = urllib.parse.quote(node.name)
    uri = f"hysteria2://{user.uuid}@{node.host}:{node.port}?{query}#{name}"
    return uri


def generate_base64_sub(nodes: list[Node], user: User) -> str:
    """Generate V2rayN / v2rayNG compatible base64 subscription"""
    links = []
    for n in nodes:
        if n.protocol == "vless":
            links.append(build_vless_uri(n, user))
        elif n.protocol == "hysteria2":
            links.append(build_hysteria2_uri(n, user))
            
    raw_text = "\n".join(links)
    return base64.b64encode(raw_text.encode("utf-8")).decode("utf-8")


def generate_clash_sub(nodes: list[Node], user: User) -> str:
    """Generate Clash Meta / Mihomo compatible YAML subscription"""
    proxies = []
    proxy_names = []
    
    for n in nodes:
        proxy_names.append(n.name)
        if n.protocol == "vless":
            proxy = {
                "name": n.name,
                "type": "vless",
                "server": n.host,
                "port": n.port,
                "uuid": user.uuid,
                "network": "tcp",
                "udp": True,
                "tls": True,
                "client-fingerprint": "chrome",
                "servername": n.reality_server_names.split(',')[0] if n.reality_server_names else n.host,
                "reality-opts": {
                    "public-key": n.reality_public_key or "",
                    "short-id": n.reality_short_id or ""
                }
            }
            proxies.append(proxy)
        elif n.protocol == "hysteria2":
            proxy = {
                "name": n.name,
                "type": "hysteria2",
                "server": n.host,
                "port": n.port,
                "password": user.uuid,
                "sni": n.reality_server_names.split(',')[0] if hasattr(n, 'reality_server_names') and n.reality_server_names else n.host,
                "skip-cert-verify": False,
            }
            if n.hysteria_up_mbps: proxy["up"] = f"{n.hysteria_up_mbps} Mbps"
            if n.hysteria_down_mbps: proxy["down"] = f"{n.hysteria_down_mbps} Mbps"
            proxies.append(proxy)
            
    config = {
        "port": 7890,
        "socks-port": 7891,
        "allow-lan": True,
        "mode": "rule",
        "log-level": "info",
        "ipv6": False,
        "external-controller": "127.0.0.1:9090",
        "proxies": proxies,
        "proxy-groups": [
            {
                "name": "PROXY",
                "type": "select",
                "proxies": ["AUTO"] + proxy_names
            },
            {
                "name": "AUTO",
                "type": "url-test",
                "url": "http://www.gstatic.com/generate_204",
                "interval": 300,
                "tolerance": 50,
                "proxies": proxy_names
            }
        ],
        "rules": [
            "MATCH,PROXY"
        ]
    }
    
    return yaml.dump(config, allow_unicode=True, default_flow_style=False)


@router.get("/{token}")
async def get_subscription(
    token: str, 
    user_agent: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db)
):
    """
    根据 Token 获取订阅链接。
    支持自动识别客户端 User-Agent 下发不同格式。
    也可以通过 url ?flag=clash 强制格式。
    """
    # 1. 验证 token 提取用户
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired subscription token")
        
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or banned")
        
    # 2. 检查用户是否拥有有效订阅
    now = datetime.utcnow()
    if not user.expire_at or user.expire_at < now:
        # 订阅过期，返回空或者提示节点
        return PlainTextResponse(base64.b64encode(b"vless://00000000-0000-0000-0000-000000000000@127.0.0.1:80?encryption=none&security=none&type=tcp#Subscription Expired").decode('utf-8'))
        
    # 流量耗尽检查
    if user.traffic_used_bytes >= user.traffic_total_bytes:
        return PlainTextResponse(base64.b64encode(b"vless://00000000-0000-0000-0000-000000000000@127.0.0.1:80?encryption=none&security=none&type=tcp#Traffic Exhausted").decode('utf-8'))
        
    # 3. 提取所有有效节点
    node_res = await db.execute(select(Node).where(Node.is_active == True))
    nodes = node_res.scalars().all()
    
    if not nodes:
        return PlainTextResponse("")
        
    ua = (user_agent or "").lower()
    
    # 4. 路由客户端格式
    if "clash" in ua or "meta" in ua or "mihomo" in ua:
        content = generate_clash_sub(nodes, user)
        headers = {
            "Content-Type": "text/yaml; charset=utf-8",
            "Subscription-Userinfo": f"upload=0; download={user.traffic_used_bytes}; total={user.traffic_total_bytes}; expire={int(user.expire_at.timestamp())}"
        }
        return PlainTextResponse(content, headers=headers)
        
    # 默认 fallback 为 Base64 (V2rayN / V2rayNG)
    content = generate_base64_sub(nodes, user)
    headers = {
        "Content-Type": "text/plain; charset=utf-8",
        "Subscription-Userinfo": f"upload=0; download={user.traffic_used_bytes}; total={user.traffic_total_bytes}; expire={int(user.expire_at.timestamp())}"
    }
    return PlainTextResponse(content, headers=headers)
