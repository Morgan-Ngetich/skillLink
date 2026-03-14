from fastapi import APIRouter
from app.api.routes.public import explore, featured, people_also_viewed

router = APIRouter()

router.include_router(explore.router, tags=["public"])
router.include_router(featured.router, tags=["public"])
router.include_router(people_also_viewed.router, tags=["public"])
