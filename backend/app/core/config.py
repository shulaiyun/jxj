import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Next-Gen Panel API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # NOTE: 从环境变量读取，Docker Compose 通过 environment 块注入
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "mysql+aiomysql://root:@127.0.0.1:3306/nextgen_panel"
    )

    # JWT Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_REPLACE_ME_IN_PRODUCTION")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://127.0.0.1:6379/0")

    # Panel Settings (editable by admin via API later)
    PANEL_NAME: str = os.getenv("PANEL_NAME", "NextGen Panel")
    PANEL_DOMAIN: str = os.getenv("PANEL_DOMAIN", "localhost")

    # EPay Payment Gateway
    EPAY_API_URL: str = os.getenv("EPAY_API_URL", "")
    EPAY_PID: str = os.getenv("EPAY_PID", "")
    EPAY_KEY: str = os.getenv("EPAY_KEY", "")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()
