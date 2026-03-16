from fastapi import APIRouter
from app.api.v1.endpoints import auth, plans, nodes, tickets, orders, users, sub, server

api_router = APIRouter()

# NOTE: 所有路由注册在此处，prefix 对应 REST 规范
api_router.include_router(auth.router,    prefix="/auth",    tags=["认证"])
api_router.include_router(users.router,   prefix="/users",   tags=["用户"])
api_router.include_router(plans.router,   prefix="/plans",   tags=["套餐"])
api_router.include_router(nodes.router,   prefix="/nodes",   tags=["节点"])
api_router.include_router(tickets.router, prefix="/tickets", tags=["工单"])
api_router.include_router(orders.router,  prefix="/orders",  tags=["订单"])
api_router.include_router(sub.router,     prefix="/sub",     tags=["订阅"])
api_router.include_router(server.router,  prefix="/server",  tags=["后端节点通信API"])
