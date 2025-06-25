from datetime import datetime, timedelta
from typing import Any
from jose import jwt, JWTError
from jose import jwk
from jose.utils import base64url_decode
from jose.exceptions import ExpiredSignatureError
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
import requests
from functools import lru_cache

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Only works for manually created Users. Does not affect supaBase created users. TokenDep will still be fine
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login/access-token")

ALGORITHM = "HS256"  # For internal tokens and Supabase Tokens

def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.utcnow() + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

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
        raise ValueError(f"Invalid token: {e}")

    except ExpiredSignatureError:
        raise ValueError("Token expired")
    except JWTError as e:
        raise ValueError(f"Invalid token: {e}")


def decode_token(token: str) -> dict[str, Any]:
    try:
        return decode_supabase_token(token)
    except ValueError as e:
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        except ExpiredSignatureError:
            raise ValueError("Token expired")
        except JWTError as e:
            raise ValueError("Invalid token")
