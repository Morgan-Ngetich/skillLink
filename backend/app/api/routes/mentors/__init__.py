from fastapi import APIRouter
from app.api.routes.mentors import (
    profile,
    sessions,
    bookings,
    services,
    settings,
    stats,
)

router = APIRouter()

# Order matters - most specific first
router.include_router(profile.router, tags=["mentors"])
router.include_router(stats.router, tags=["mentors"])
router.include_router(settings.router, tags=["mentors"])
router.include_router(services.router, tags=["mentors"])
router.include_router(bookings.router, tags=["mentors"])
router.include_router(sessions.router, tags=["mentors"])