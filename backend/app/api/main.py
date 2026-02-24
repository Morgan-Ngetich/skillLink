from fastapi import APIRouter
from app.api.routes import (
    auth_router,
    users_router,
    profiles_router,
    mentors_router,
    og_router,
    goals_router,
    boards_router,
    public_router,
    admin_router,
)

api_router = APIRouter()


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

api_router.include_router(
    og_router    
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