from functools import wraps
from typing import Callable, TypeVar, Any, ParamSpec
from app.core.db import get_session
from sqlmodel import Session

P = ParamSpec("P")
R = TypeVar("R")

def with_session(func: Callable[P, R]) -> Callable[P, R]:
    """
    Celery-friendly decorator to provide DB session to tasks.
    Automatically opens/closes the session and injects it into the task.
    """
    
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        session: Session = next(get_session())
        try:
            return func(*args, session=session, **kwargs)
        finally:
            session.close()

    return wrapper