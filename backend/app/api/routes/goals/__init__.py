from fastapi import APIRouter
from app.api.routes.goals import goals, roadmaps, generation

router = APIRouter()

router.include_router(generation.router, tags=["goals"])
router.include_router(roadmaps.router, tags=["goals"])
router.include_router(goals.router, tags=["goals"])