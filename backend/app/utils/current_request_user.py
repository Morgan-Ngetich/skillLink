from contextvars import ContextVar
from typing import Optional

# Context variable for the current request user
_current_request_user: ContextVar[Optional[int]] = ContextVar('current_request_user', default=None)

class RequestContext:
    """Manages request-scoped user context"""
    
    @staticmethod
    def set_user(user_id: Optional[int]):
        _current_request_user.set(user_id)
        print("Current User set", user_id)
        print("Current_user.get", _current_request_user.get())
    
    @staticmethod
    def get_user() -> Optional[int]:
        return _current_request_user.get()
    
    @staticmethod
    def clear_user():
        _current_request_user.set(None)