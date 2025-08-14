import inspect
import re
import json
from fastapi import Request, HTTPException
from functools import wraps
from app.utils.logger_config import llm_logger
from typing import Callable, TypeVar, ParamSpec, Optional, Union
from app.core.db import get_session
from sqlmodel import Session
from datetime import datetime
from pydantic import BaseModel

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

def is_valid(field):
    """Check if a field (str, list, or other) is non-empty and valid."""
    if isinstance(field, list):
        return bool(field) and all(bool(item) for item in field)
    if isinstance(field, str):
        return bool(field.strip())
    return bool(field)


# def _get_role_priority():
#     from app.models.users import RoleName  # local import
#     return {
#         RoleName.SUPERUSER: 3,
#         RoleName.MENTOR: 2,
#         RoleName.MENTEE: 1,
#     }

# def _has_required_role(user_role, required_role, exact: bool = False) -> bool:
#     ROLE_PRIORITY = _get_role_priority()
#     if exact:
#         return user_role == required_role
#     return ROLE_PRIORITY.get(user_role, 0) >= ROLE_PRIORITY.get(required_role, 0)

# def require_role(required_role, exact: bool = False, log_attempts: bool = True):
#     """
#     Decorator that checks if the user has the required role.

#     :param required_role: Required role (e.g., RoleName.MENTOR)
#     :param exact: If True, role must match exactly. If False, allow higher-priority roles.
#     :param log_attempts: Log failed attempts (optional).
#     Injects current_user into the route using get_current_user.
#     """
#     def decorator(func: Callable[..., Union[R, Awaitable[R]]]) -> Callable[..., Union[R, Awaitable[R]]]:
#         from app.api.deps import get_current_user  # late import

#         @wraps(func)
#         async def async_wrapper(*args, **kwargs):
#             request: Request = kwargs.get("request") or next((a for a in args if isinstance(a, Request)), None)
#             if request is None:
#                 raise HTTPException(status_code=400, detail="Missing Request object to resolve current user.")

#             current_user = await get_current_user(request)
#             if not _has_required_role(current_user.role, required_role, exact):
#                 if log_attempts:
#                     print(f"[{datetime.now()}] Unauthorized async access: {current_user.email} (role={current_user.role}) attempted {func.__name__} requiring {required_role}")
#                 raise HTTPException(status_code=403, detail=f"{required_role.value.capitalize()} role required")

#             kwargs["current_user"] = current_user
#             return await func(*args, **kwargs)

#         @wraps(func)
#         def sync_wrapper(*args, **kwargs):
#             request: Request = kwargs.get("request") or next((a for a in args if isinstance(a, Request)), None)
#             if request is None:
#                 raise HTTPException(status_code=400, detail="Missing Request object to resolve current user.")

#             current_user = get_current_user(request)  # assuming sync function (see note below)
#             if not _has_required_role(current_user.role, required_role, exact):
#                 if log_attempts:
#                     print(f"[{datetime.now()}] Unauthorized sync access: {current_user.email} (role={current_user.role}) attempted {func.__name__} requiring {required_role}")
#                 raise HTTPException(status_code=403, detail=f"{required_role.value.capitalize()} role required")

#             kwargs["current_user"] = current_user
#             return func(*args, **kwargs)

#         return async_wrapper if inspect.iscoroutinefunction(func) else sync_wrapper

#     return decorator



def validate_enum(value, enum_class, default=None):
    try:
        return enum_class(value).value
    except ValueError:
        llm_logger.warning(
            f"Invalid {enum_class.__name__} value: {value}, using default",
            extra={"valid_options": [e.value for e in enum_class]}
        )
        return default.value if default else value
    
def validate_goal(goal_data: Union[dict, BaseModel]) -> dict:
    from app.models.users import GoalDifficulty 
    """Validate goal data, handling both dicts and Pydantic models"""
    # Convert to dict if it's a model
    if hasattr(goal_data, 'model_dump'):
        goal_data = goal_data.model_dump()
    
    validated = goal_data.copy()
    
    if "difficulty" in validated:
        try:
            validated["difficulty"] = GoalDifficulty(validated["difficulty"]).value
        except ValueError:
            validated["difficulty"] = GoalDifficulty.EASY.value
            
    return validated

def validate_roadmap(roadmap_data: Union[dict, BaseModel]) -> dict:
    """Validate roadmap data, handling both dicts and Pydantic models"""
    # Convert to dict if it's a model
    if hasattr(roadmap_data, 'model_dump'):
        roadmap_data = roadmap_data.model_dump()
    
    validated = roadmap_data.copy()
    
    if "timeline" in validated:
        for phase in validated["timeline"]:
            phase["duration"] = max(1, int(phase.get("duration", 1)))
            
    return validated

def validate_card(card_data: Union[dict, BaseModel]) -> dict:
    """Validate card data, handling both dicts and Pydantic models"""
    # Convert to dict if it's a model
    if hasattr(card_data, 'model_dump'):
        card_data = card_data.model_dump()
    
    validated = card_data.copy()
    validated["status"] = validated.get("status", "todo")
    
    if "due_date" in validated:
        try:
            datetime.strptime(validated["due_date"], "%Y-%m-%d")
        except ValueError:
            validated["due_date"] = None
            
    return validated

def extract_json_from_markdown(content: str) -> Optional[dict]:
    """Handle common LLM JSON response patterns"""
    patterns = [
        r"```json\n(.*?)\n```",  # ```json\n{...}\n```
        r"```(.*?)```",            # ```{...}```
        r"\{.*\}"                  # Raw JSON
    ]
    for pattern in patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                continue
    return None
