from pydantic import computed_field, model_validator, ConfigDict
from functools import lru_cache
from pydantic_settings import BaseSettings
import secrets
import base64
import binascii  # For base64 error handling
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
    TEST_DATABASE_URL: Optional[str] = "postgresql://testuser:testpass@db_test:5432/testdb"
    
    # Default values:
    DEFAULT_AVATAR_URL: str = "https://cdn.skilllink.dev/default-avatar.png"
    DEFAULT_COVER_IMAGE_URL: str = "https://i.pinimg.com/736x/23/d5/9a/23d59a2591395108fa1a431d48d4c734.jpg"
    
    TIMEZONE: str = "UTC"
    RABBITMQ_DEFAULT_USER: str
    RABBITMQ_DEFAULT_PASS : str
    RABBITMQ_PORT: str
    RABBITMQ_HOST: str
    
    LOG_LEVEL: str = "INFO"
    
    # llms
    HUGGINGFACE_API_KEY: Optional[str] = None
    HUGGINGFACE_LLAMA_MODEL: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    
    LLM_TIMEOUT: int = 360000000
    LLAMA2_TIMEOUT: int = 45
    
    LOGODEV_PUBLIC_TOKEN: Optional[str] = None

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
        if not self.SUPABASE_JWT_SECRET:
            return None
        
        try:
            # Ensure proper base64 padding
            secret_b64 = self.SUPABASE_JWT_SECRET.replace(' ', '+')
            # Add padding if needed
            padding = len(secret_b64) % 4
            if padding:
                secret_b64 += '=' * (4 - padding)
            
            return base64.b64decode(secret_b64)
        except (ValueError, binascii.Error) as e:
            # Fallback: use as string if base64 decode fails
            print(f"Base64 decode failed, using as string: {e}")
            return self.SUPABASE_JWT_SECRET.encode('utf-8')

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

    model_config = ConfigDict(
        env_file = ".env",
        extra = "ignore"
    )


@lru_cache
def get_settings():
    return Settings()


settings = get_settings()
