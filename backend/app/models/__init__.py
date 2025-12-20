"""
Central export point for all models.
Import everything here and re-export for easy access.
"""

# Step 1: Import enums and base classes (no dependencies)
from .enums import (
    ExperienceLevel,
    MentorType,
    SessionType,
    LocationType,
    BookingStatus,
    RoleName,
    RoadmapVisibility,
    RoadmapStatus,
    GoalType,
    GoalStatus,
    GoalDifficulty,
    CardStatus,
    CardPriority,
    TaskStatusEnum,
    SafetyViolationType,
    LLMTargetEntity,
    LLMActionType,
)

from .base import CleanStrFieldsMixin, Education, Experience, PreparationMaterial

# Step 2: Import ORM models (database tables)
from .users import (
    User,
    UserProfile,
    UserCreate,
    UserUpdate,
    UserSyncIn,
    UserProfileCreate,
    UserProfileUpdate,
    Role,
    Permission,
    RolePermission,
    UserRole,
    RoleAssignRequest,
)

from .mentor import (
    MentorProfile,
    MentorSession,
    MentorService,
    MentorSettings,
    MentorSessionBooking,
    MentorProfileCreate,
    MentorProfileUpdate,
    MentorSessionCreate,
    MentorSessionUpdate,
    MentorServiceCreate,
    MentorServiceUpdate,
    MentorSettingsCreate,
    MentorSettingsUpdate,
    BookingCreateRequest,
    BookingStatusUpdate,
)

from .roadmap import (
    Roadmap,
    Goal,
    RoadCreate,
    RoadmapUpdate,
    GoalCreate,
    GoalCreationRequest,
    GoalUpdate,
)

from .board import (
    Board,
    BoardList,
    Card,
    CardComment,
    CardChecklist,
    CardChecklistItem,
    BoardCreate,
    BoardUpdate,
    BoardListCreate,
    BoardListUpdate,
    CardCreate,
    CardUpdate,
    CardCommentCreate,
    CardCommentUpdate,
    CardChecklistCreate,
    CardChecklistUpdate,
    CardChecklistItemCreate,
    CardChecklistItemUpdate,
)

from .llm import (
    SafetyViolation,
    SafetyReport,
    ProgressiveUpdateProposal,
    LLMGenerationRequest,
    LLMStructuredOutput,
)

# Step 3: Import public models (DTOs) - AFTER all ORM models
from .public import (
    UserPublic,
    UsersPublic,
    UserMinimal,
    UserProfilePublic,
    MentorProfilePublic,
    MentorSessionPublic,
    MentorServicePublic,
    MentorSettingsPublic,
    MentorStatsPublic,
    MentorExplorePublic,
    BookingPublic,
    RoadmapPublic,
    GoalPublic,
    CardPublic,
    GoalWithSubgoals,
    BoardWithLists,
    ListWithCards,
    RoadmapDisplay,
    LLMGenerationResponse,
    TaskStatus,
)

# Step 4: Rebuild all public models to resolve forward references
# This MUST happen AFTER all ORM models are imported
UserMinimal.model_rebuild()
UserProfilePublic.model_rebuild()
UserPublic.model_rebuild()
UsersPublic.model_rebuild()
BookingPublic.model_rebuild()

MentorServicePublic.model_rebuild()
MentorSessionPublic.model_rebuild()
MentorSettingsPublic.model_rebuild()
MentorProfilePublic.model_rebuild()
MentorStatsPublic.model_rebuild()

RoadmapPublic.model_rebuild()
GoalPublic.model_rebuild()
GoalWithSubgoals.model_rebuild()
RoadmapDisplay.model_rebuild()

CardPublic.model_rebuild()
ListWithCards.model_rebuild()
BoardWithLists.model_rebuild()

LLMGenerationResponse.model_rebuild()
LLMStructuredOutput.model_rebuild()
TaskStatus.model_rebuild()

__all__ = [
    # Enums
    "ExperienceLevel",
    "MentorType",
    "SessionType",
    "LocationType",
    "BookingStatus",
    "RoleName",
    "RoadmapVisibility",
    "RoadmapStatus",
    "GoalType",
    "GoalStatus",
    "GoalDifficulty",
    "CardStatus",
    "CardPriority",
    "TaskStatusEnum",
    "SafetyViolationType",
    "LLMTargetEntity",
    "LLMActionType",
    # Base
    "CleanStrFieldsMixin",
    "Education",
    "Experience",
    "PreparationMaterial",
    # Users
    "User",
    "UserProfile",
    "UserCreate",
    "UserUpdate",
    "UserSyncIn",
    "UserProfileCreate",
    "UserProfileUpdate",
    "Role",
    "Permission",
    "RolePermission",
    "UserRole",
    "RoleAssignRequest",
    # Mentor
    "MentorProfile",
    "MentorSession",
    "MentorService",
    "MentorSettings",
    "MentorSessionBooking",
    "MentorProfileCreate",
    "MentorProfileUpdate",
    "MentorSessionCreate",
    "MentorSessionUpdate",
    "MentorServiceCreate",
    "MentorServiceUpdate",
    "MentorSettingsCreate",
    "MentorSettingsUpdate",
    "BookingCreateRequest",
    "BookingStatusUpdate",
    # Roadmap
    "Roadmap",
    "Goal",
    "RoadCreate",
    "RoadmapUpdate",
    "GoalCreate",
    "GoalCreationRequest",
    "GoalUpdate",
    # Board
    "Board",
    "BoardList",
    "Card",
    "CardComment",
    "CardChecklist",
    "CardChecklistItem",
    "BoardCreate",
    "BoardUpdate",
    "BoardListCreate",
    "BoardListUpdate",
    "CardCreate",
    "CardUpdate",
    "CardCommentCreate",
    "CardCommentUpdate",
    "CardChecklistCreate",
    "CardChecklistUpdate",
    "CardChecklistItemCreate",
    "CardChecklistItemUpdate",
    # LLM
    "SafetyViolation",
    "SafetyReport",
    "ProgressiveUpdateProposal",
    "LLMGenerationRequest",
    "LLMStructuredOutput",
    "LLMGenerationResponse",
    "TaskStatus",
    # Public
    "UserPublic",
    "UsersPublic",
    "UserMinimal",
    "UserProfilePublic",
    "MentorProfilePublic",
    "MentorSessionPublic",
    "MentorServicePublic",
    "MentorSettingsPublic",
    "MentorStatsPublic",
    "BookingPublic",
    "RoadmapPublic",
    "GoalPublic",
    "CardPublic",
    "GoalWithSubgoals",
    "BoardWithLists",
    "ListWithCards",
    "RoadmapDisplay",
]