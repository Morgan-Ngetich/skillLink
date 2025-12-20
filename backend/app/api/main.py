from fastapi import APIRouter
from app.api.routes import (
    auth_router,
    users_router,
    profiles_router,
    mentors_router,
    goals_router,
    boards_router,
    public_router,
    admin_router,
)
from app.api.routes.crackmode import og


api_router = APIRouter()

api_router.include_router(og.router, tags=["crackmode"])

# Auth (no prefix conflict)
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["auth"]
)

# Users
api_router.include_router(
    users_router,
    prefix="/users",
    tags=["users"]
)

# Profiles
api_router.include_router(
    profiles_router,
    prefix="/profiles",
    tags=["profiles"]
)

# Mentors
api_router.include_router(
    mentors_router,
    prefix="/mentors",
    tags=["mentors"]
)

# Goals & Roadmaps
api_router.include_router(
    goals_router,
    prefix="/goals",
    tags=["goals"]
)

# Boards
api_router.include_router(
    boards_router,
    prefix="/boards",
    tags=["boards"]
)

# Public/Discovery
api_router.include_router(
    public_router,
    prefix="/public",
    tags=["public"]
)

# Admin
api_router.include_router(
    admin_router,
    prefix="/admin",
    tags=["admin"]
)