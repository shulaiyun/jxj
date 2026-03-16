from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
import asyncio
import logging

logger = logging.getLogger("uvicorn.error")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

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
    NOTE: MariaDB 容器启动后还需要几秒才能接受连接，
    这里加入重试逻辑，最多等待 60 秒，每隔 3 秒重试一次
    """
    from app.db.session import engine
    from app.db.base_class import Base
    # 导入所有 model 确保注册到 Base.metadata
    from app.models import user, plan, node, order, ticket, invite, ai_config  # noqa

    for attempt in range(20):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("✅ Database tables created/verified successfully")
            return
        except Exception as e:
            logger.warning(f"⏳ DB not ready yet (attempt {attempt + 1}/20): {e}")
            await asyncio.sleep(3)

    logger.error("❌ Could not connect to database after 60 seconds. Exiting.")
    raise RuntimeError("Database connection failed after all retries")

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
