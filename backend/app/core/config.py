from pydantic import computed_field, model_validator
from functools import lru_cache
from pydantic_settings import BaseSettings
import secrets
import base64
from typing import Optional


class Settings(BaseSettings):
    DOMAIN: str = "localhost"
    API_V1_STR: str = "/api/v1"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # min * hours * days

    FIRST_SUPERUSER: str
    FIRST_SUPERUSER_PASSWORD: str

    SECRET_KEY: str = secrets.token_urlsafe(32)
    SUPABASE_PROJECT_ID: Optional[str] = None
    SUPABASE_JWT_SECRET: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None

    ALGORITHM: str = "HS256"

    ENVIRONMENT: str = "local"

    PROJECT_NAME: Optional[str] = None
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None

    DATABASE_URL: Optional[str] = None
    
    # Default values:
    DEFAULT_AVATAR_URL: str = "https://cdn.skilllink.dev/default-avatar.png"

    @computed_field
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.ENVIRONMENT == "production" and self.DATABASE_URL:
            return self.DATABASE_URL
        # Use local config if in local env or DATABASE_URL is missing
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def SUPABASE_JWT_SECRET_DECODED(self) -> Optional[bytes]:
        if self.SUPABASE_JWT_SECRET:
            return base64.b64decode(self.SUPABASE_JWT_SECRET)
        return None

    @model_validator(mode="after")
    def check_required_fields(cls, values):
        env = values.ENVIRONMENT
        if env == "local":
            required = {
                "PROJECT_NAME",
                "POSTGRES_SERVER",
                "POSTGRES_USER",
                "POSTGRES_PASSWORD",
                "POSTGRES_DB",
                "SUPABASE_PROJECT_ID",
                "SUPABASE_JWT_SECRET",
                "SUPABASE_ANON_KEY",
            }
            missing = {field for field in required if not getattr(values, field, None)}
            if missing:
                raise ValueError(f"Missing required environment variables in local env: {missing}")
        elif env == "production":
            if not values.DATABASE_URL:
                raise ValueError("DATABASE_URL must be set in production environment")
        return values

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
