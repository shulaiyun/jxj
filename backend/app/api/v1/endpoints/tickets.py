from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

from app.db.session import get_db
from app.models.ticket import Ticket, TicketMessage
from app.api.deps import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter()

# ── Schemas ──────────────────────────────────────────────────────────────────

class TicketStatus(str, Enum):
    open = "open"
    pending = "pending"
    resolved = "resolved"
    closed = "closed"

class TicketMessageOut(BaseModel):
    id: int
    content: str
    is_from_user: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TicketOut(BaseModel):
    id: int
    subject: str
    status: str
    created_at: datetime
    messages: List[TicketMessageOut] = []

    class Config:
        from_attributes = True

class TicketCreate(BaseModel):
    subject: str
    message: str  # 第一条消息内容

class ReplyCreate(BaseModel):
    content: str

# ── User Endpoints ────────────────────────────────────────────────────────────

@router.get("", response_model=List[TicketOut])
async def list_my_tickets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取当前用户的所有工单"""
    result = await db.execute(
        select(Ticket).where(Ticket.user_id == current_user.id).order_by(Ticket.created_at.desc())
    )
    return result.scalars().all()

@router.post("", response_model=TicketOut, status_code=201)
async def create_ticket(
    ticket_in: TicketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """用户提交新工单"""
    ticket = Ticket(subject=ticket_in.subject, user_id=current_user.id, status="open")
    db.add(ticket)
    await db.flush()  # 先 flush 以获取 ticket.id

    # 添加第一条消息
    msg = TicketMessage(ticket_id=ticket.id, content=ticket_in.message, is_from_user=True)
    db.add(msg)
    await db.commit()
    await db.refresh(ticket)
    return ticket

@router.post("/{ticket_id}/reply", response_model=TicketMessageOut)
async def reply_to_ticket(
    ticket_id: int,
    reply: ReplyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """用户回复工单"""
    result = await db.execute(
        select(Ticket).where(Ticket.id == ticket_id, Ticket.user_id == current_user.id)
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    msg = TicketMessage(ticket_id=ticket.id, content=reply.content, is_from_user=True)
    db.add(msg)
    ticket.status = "open"  # 用户回复后重新开启
    await db.commit()
    await db.refresh(msg)
    return msg

# ── Admin Endpoints ───────────────────────────────────────────────────────────

@router.get("/admin/all", response_model=List[TicketOut], dependencies=[Depends(get_current_admin_user)])
async def admin_list_tickets(db: AsyncSession = Depends(get_db)):
    """管理员：获取所有工单"""
    result = await db.execute(select(Ticket).order_by(Ticket.created_at.desc()))
    return result.scalars().all()

@router.post("/admin/{ticket_id}/reply", dependencies=[Depends(get_current_admin_user)])
async def admin_reply_ticket(
    ticket_id: int,
    reply: ReplyCreate,
    db: AsyncSession = Depends(get_db)
):
    """管理员：回复工单"""
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    msg = TicketMessage(ticket_id=ticket.id, content=reply.content, is_from_user=False)
    db.add(msg)
    ticket.status = "pending"  # 等待用户确认
    await db.commit()
    await db.refresh(msg)
    return msg
