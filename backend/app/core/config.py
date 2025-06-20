from pydantic_settings import BaseSettings
from functools import lru_cache
import secrets

class Settings(BaseSettings):
  PROJECT_NAME: str = "SkillLink"
  API_V1_STR: str = "/api/v1"
  DATABASE_PUBLIC_URL: str
  DATABASE_URL: str
  SECRET_KEY: str = secrets.token_urlsafe(32)
  ALGORITHM: str = "HS256"
  DOMAIN: str = "localhost"
  
  class Config:
    env_file = ".env"

@lru_cache
def get_settings():
  return Settings()

settings = get_settings()