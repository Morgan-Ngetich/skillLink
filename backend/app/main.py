from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.main import api_router
from app.core.config import settings

app = FastAPI(    
    title=settings.PROJECT_NAME,
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",    
)

# Allow CORS for all origins (change in production for security!)
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Replace ["*"] with a list of allowed domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"status": "ok"}