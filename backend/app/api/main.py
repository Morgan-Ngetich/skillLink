from fastapi import APIRouter
from app.api.routes import (
  users,
  login,
  profile,
  goals,
)

from app.api.routes import admin
api_router = APIRouter()

api_router.include_router(login.router, tags=["login"] )
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])