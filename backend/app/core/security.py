import os
import bcrypt
from fastapi.security import OAuth2PasswordBearer, HTTPBearer
from fastapi.security import HTTPAuthorizationCredentials
from jose import jwt, JWTError
from jose.exceptions import ExpiredSignatureError
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
import requests
from functools import lru_cache
from typing import Any
from app.core.config import settings

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Only works for manually created Users. Does not affect supaBase created users. TokenDep will still be fine
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login/access-token")

# For Swagger / Bearer auth
bearer_scheme = HTTPBearer(auto_error=False)

# Optional versions for endpoints that can be accessed without authentication
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/login/access-token", auto_error=False)
bearer_scheme_optional = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"  # For internal tokens and Supabase Tokens

def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Truncate password if it's too long (bcrypt has 72-byte limit)
    password_bytes = password.encode('utf-8')
    if len(password_bytes) > 72:
        password_bytes = password_bytes[:72]
    hashed_bytes = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_bytes = plain_password.encode('utf-8')
    if len(plain_bytes) > 72:
        plain_bytes = plain_bytes[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_bytes, hashed_bytes)

@lru_cache(maxsize=1)
def get_supabase_jwks():
    url = f"https://{settings.SUPABASE_PROJECT_ID}.supabase.co/auth/v1/keys"
    headers = {
        "apikey": settings.SUPABASE_ANON_KEY 
    }
    response = requests.get(url, headers=headers)
    return response.json()


def decode_supabase_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            key=settings.SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM],
            audience="authenticated",  # Optional: only if you enforce it
        )
        return payload
    except ExpiredSignatureError:
        raise ValueError("Token expired")
    except JWTError as e:
        try:
            payload = jwt.decode(
                token,
                key=settings.SUPABASE_JWT_SECRET_DECODED,
                algorithms=[ALGORITHM],
                audience="authenticated",
            )
            return payload
        except JWTError as e:
            raise ValueError(f"Invalid token: {e}")


def decode_token(token: str) -> dict[str, Any]:
    try:
        print("🔍 Attempting Supabase token decode...")
        return decode_supabase_token(token)
    except ValueError as e:
        print(f"❌ Supabase decode failed: {e}, trying internal token...")
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        except ExpiredSignatureError:
            raise ValueError("Token expired")
        except JWTError as e:
            raise ValueError(f"Invalid token: {e}")
