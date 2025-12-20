from fastapi import APIRouter
from app.api.routes.public import explore, featured

router = APIRouter()

router.include_router(explore.router, tags=["public"])
router.include_router(featured.router, tags=["public"])