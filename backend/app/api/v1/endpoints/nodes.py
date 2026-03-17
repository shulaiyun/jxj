from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel

from app.db.session import get_db
from app.models.node import Node
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────────

class NodeOut(BaseModel):
    id: int
    name: str
    host: str
    port: int
    protocol: str
    country: str | None
    flag_emoji: str | None
    traffic_multiplier: float
    is_active: bool
    reality_public_key: str | None = None
    reality_server_names: str | None = None
    reality_short_id: str | None = None

    class Config:
        from_attributes = True

class NodeCreate(BaseModel):
    name: str
    host: str
    port: int = 443
    protocol: str = "vless"
    country: str | None = None
    flag_emoji: str | None = None
    traffic_multiplier: float = 1.0
    # Reality specific
    reality_dest: str | None = None
    reality_server_names: str | None = None
    reality_public_key: str | None = None
    reality_short_id: str | None = None
    # Hysteria2 specific
    hysteria_up_mbps: int | None = None
    hysteria_down_mbps: int | None = None

# ── User Endpoints ────────────────────────────────────────────────────────────

@router.get("", response_model=List[NodeOut])
async def list_nodes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取对当前用户开放的节点列表（需要有效订阅）"""
    # NOTE: 后续需要根据用户订阅状态过滤
    result = await db.execute(select(Node).where(Node.is_active == True))
    return result.scalars().all()

# ── Admin Endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[NodeOut], dependencies=[Depends(get_current_admin_user)])
async def admin_list_nodes(db: AsyncSession = Depends(get_db)):
    """管理员：获取所有节点（含停用节点）"""
    result = await db.execute(select(Node))
    return result.scalars().all()

@router.post("", response_model=NodeOut, dependencies=[Depends(get_current_admin_user)])
async def create_node(node_in: NodeCreate, db: AsyncSession = Depends(get_db)):
    """管理员：创建新节点"""
    node = Node(**node_in.model_dump())
    db.add(node)
    await db.commit()
    await db.refresh(node)
    return node

@router.put("/{node_id}", response_model=NodeOut, dependencies=[Depends(get_current_admin_user)])
async def update_node(node_id: int, node_in: NodeCreate, db: AsyncSession = Depends(get_db)):
    """管理员：更新节点配置"""
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    for k, v in node_in.model_dump(exclude_unset=True).items():
        setattr(node, k, v)
    await db.commit()
    await db.refresh(node)
    return node

@router.delete("/{node_id}", dependencies=[Depends(get_current_admin_user)])
async def delete_node(node_id: int, db: AsyncSession = Depends(get_db)):
    """管理员：停用节点"""
    result = await db.execute(select(Node).where(Node.id == node_id))
    node = result.scalar_one_or_none()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    node.is_active = False
    await db.commit()
    return {"message": "Node deactivated"}
