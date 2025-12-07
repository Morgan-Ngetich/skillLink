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
    from app.models import GoalDifficulty, GoalType
    """Validate goal data, handling both dicts and Pydantic models"""
    # Convert to dict if it's a model
    if hasattr(goal_data, 'model_dump'):
        goal_data = goal_data.model_dump()
    
    validated = goal_data.copy()
    
    # Ensure required fields
    if not validated.get("title"):
        raise ValueError("Goal missing title")

    # Set defaults
    validated.setdefault("type", "skill")
    validated.setdefault("difficulty", "easy")
    validated.setdefault("importance", 1)
    
    # Convert string enums to proper enum values if needed
    if isinstance(validated.get("type"), str):
        try:
            validated["type"] = GoalType(validated["type"].lower())
        except ValueError:
            validated["type"] = GoalType.SKILL
    
    if isinstance(validated.get("difficulty"), str):
        try:
            validated["difficulty"] = GoalDifficulty(validated["difficulty"].lower())
        except ValueError:
            validated["difficulty"] = GoalDifficulty.EASY
    
    # Convert date strings to datetime objects
    for date_field in ["start_date", "target_date"]:
        if isinstance(validated.get(date_field), str):
            try:
                validated[date_field] = datetime.fromisoformat(validated[date_field].replace('Z', '+00:00'))
            except (ValueError, TypeError):
                validated[date_field] = None
    
    return validated


def validate_roadmap(roadmap_data: Union[dict, BaseModel]) -> dict:
    """Validate roadmap data, handling both dicts and Pydantic models"""
    from app.models import RoadmapVisibility, RoadmapStatus
    # Convert to dict if it's a model
    if hasattr(roadmap_data, 'model_dump'):
        roadmap_data = roadmap_data.model_dump()
    
    validated = roadmap_data.copy()
    
    # Ensure required fields
    if not validated.get("title"):
        raise ValueError("Roadmap missing title")
    
    # Set defaults
    validated.setdefault("visibility", "private")
    validated.setdefault("status", "draft")
    
    # Convert string enums to proper enum values if needed
    if isinstance(validated.get("visibility"), str):
        try:
            validated["visibility"] = RoadmapVisibility(validated["visibility"].lower())
        except ValueError:
            validated["visibility"] = RoadmapVisibility.PRIVATE
    
    if isinstance(validated.get("status"), str):
        try:
            validated["status"] = RoadmapStatus(validated["status"].lower())
        except ValueError:
            validated["status"] = RoadmapStatus.DRAFT
    
    # Convert date strings to datetime objects
    for date_field in ["start_date", "target_date"]:
        if isinstance(validated.get(date_field), str):
            try:
                validated[date_field] = datetime.fromisoformat(validated[date_field].replace('Z', '+00:00'))
            except (ValueError, TypeError):
                validated[date_field] = None
    
    return validated


def validate_card(card_data: Union[dict, BaseModel]) -> dict:
    """Validate card data, handling both dicts and Pydantic models"""
    from app.models import CardStatus, CardPriority
    # Convert to dict if it's a model
    if hasattr(card_data, 'model_dump'):
        card_data = card_data.model_dump()
    
    validated = card_data.copy()
    if not validated.get("title"):
        raise ValueError("Card missing title")
    
    # set defaults
    validated.setdefault("status", "backlog")
    validated.setdefault("priority", "medium")
    validated.setdefault("position", 0)
    
    # Convert string enums to proper enum values if needed
    if isinstance(validated.get("status"), str):
        try:
            validated["status"] = CardStatus(validated["status"].lower())
        except ValueError:
            validated["status"] = CardStatus.BACKLOG
    
    if isinstance(validated.get("priority"), str):
        try:
            validated["priority"] = CardPriority(validated["priority"].lower())
        except ValueError:
            validated["priority"] = CardPriority.MEDIUM
    
    # Convert date strings to datetime objects
    if isinstance(validated.get("due_date"), str):
        try:
            validated["due_date"] = datetime.fromisoformat(validated["due_date"].replace('Z', '+00:00'))
        except (ValueError, TypeError):
            validated["due_date"] = None
    
    return validated


def clean_malformed_json(content: str) -> str:
    """Attempt to clean malformed JSON content"""
    try:
        # Remove common issues from the log
        content = content.strip()
        
        # Remove any markdown code block markers
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
            
        # Remove trailing commas before closing brackets/braces
        import re
        content = re.sub(r',(\s*[}\]])', r'\1', content)
        
        # Fix common quote issues
        content = re.sub(r'([{\[,]\s*)"([^"]*)":\s*"([^"]*),([^"]*)"', r'\1"\2": "\3\4"', content)
        
        # Remove any trailing characters after the last }
        if content.rfind('}') != -1:
            content = content[:content.rfind('}') + 1]
            
        return content
        
    except Exception as e:
        print(f"JSON cleaning failed: {e}")
        return None


def extract_json_from_markdown(content: str) -> dict:
    """Simple but effective JSON extraction"""
    try:
        # Remove markdown code blocks
        content = re.sub(r'```(?:json)?', '', content)
        content = content.strip()
        
        # Find the first { and last }
        start_idx = content.find('{')
        end_idx = content.rfind('}')
        
        if start_idx == -1 or end_idx == -1 or end_idx <= start_idx:
            return None
            
        json_str = content[start_idx:end_idx + 1]
        
        # Clean common issues
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)  # trailing commas
        json_str = re.sub(r'([{\[,]\s*)(\w+)(\s*:\s*)', r'\1"\2"\3', json_str)  # unquoted keys
        
        return json.loads(json_str)
        
    except Exception as e:
        print(f"Simple JSON extraction failed: {e}")
        return None