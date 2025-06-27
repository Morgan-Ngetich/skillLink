from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.proxy_headers import ProxyHeadersMiddleware  # Added for correct client IP & scheme detection
from app.api.main import api_router
from app.core.config import settings

app = FastAPI(    
    title=settings.PROJECT_NAME,
    docs_url=f"{settings.API_V1_STR}/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",    
)

# This middleware helps FastAPI correctly detect real client IP and scheme
# when behind proxies/load balancers (like Railway)
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts="*")

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
