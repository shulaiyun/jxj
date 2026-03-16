from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# NOTE: CORS 允许前端跨域请求，生产中替换 * 为具体域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def on_startup():
    """
    应用启动时自动创建所有数据库表
    NOTE: 生产环境建议使用 Alembic migrate 替代 create_all
    """
    from app.db.session import engine
    from app.db.base_class import Base
    # 导入所有 model 确保它们被注册到 Base.metadata
    from app.models import user, plan, node, order, ticket, invite, ai_config  # noqa
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": "/docs",
        "version": settings.VERSION
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
