"""Public response models (DTOs) - Central export point

IMPORTANT: model_rebuild() is called from app/models/__init__.py AFTER all ORM models are imported.
DO NOT call model_rebuild() here to avoid forward reference errors.
"""

# Import all public models in dependency order
from .user_public import (
    UserMinimal,
    UserProfilePublic,
    UserPublic,
    UsersPublic,
    BookingPublic,
)

from .mentor_public import (
    MentorServicePublic,
    MentorSessionPublic,
    MentorSettingsPublic,
    MentorProfilePublic,
    MentorStatsPublic,
    MentorExplorePublic,
)

from .roadmap_public import (
    RoadmapPublic,
    GoalPublic,
    GoalWithSubgoals,
    RoadmapDisplay,
)

from .board_public import (
    CardPublic,
    ListWithCards,
    BoardWithLists,
)

from .llm_public import (
    LLMGenerationResponse,
    TaskStatus,
)

__all__ = [
    # User
    "UserPublic",
    "UsersPublic",
    "UserMinimal",
    "UserProfilePublic",
    "BookingPublic",
    # Mentor
    "MentorProfilePublic",
    "MentorSessionPublic",
    "MentorServicePublic",
    "MentorSettingsPublic",
    "MentorStatsPublic",
    "MentorExplorePublic",
    # Roadmap
    "RoadmapPublic",
    "GoalPublic",
    "GoalWithSubgoals",
    "RoadmapDisplay",
    # Board
    "CardPublic",
    "ListWithCards",
    "BoardWithLists",
    # LLM
    "LLMGenerationResponse",
    "TaskStatus",
]