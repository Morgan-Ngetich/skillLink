"""Roadmap and Goal models"""
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from pydantic import ConfigDict, field_validator, ValidationInfo

from .enums import (
    RoadmapVisibility,
    RoadmapStatus,
    GoalStatus,
    GoalDifficulty,
    GoalType,
)

if TYPE_CHECKING:
    from .users import User
    from .board import Board, Card
    from .public.roadmap_public import GoalPublic


# ==================== ROADMAP MODEL ====================
class RoadmapBase(SQLModel):
    title: str = Field(index=True)
    description: Optional[str] = None
    visibility: RoadmapVisibility = Field(default=RoadmapVisibility.PRIVATE)
    status: RoadmapStatus = Field(default=RoadmapStatus.DRAFT)
    tags: Optional[List[str]] = Field(sa_column=Column(ARRAY(String), default=None))
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None


class Roadmap(RoadmapBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    is_llm_generated: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    owner: "User" = Relationship(back_populates="roadmaps")
    goals: List["Goal"] = Relationship(back_populates="roadmap")
    boards: List["Board"] = Relationship(back_populates="roadmap")


class RoadCreate(RoadmapBase):
    pass


class RoadmapUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    visibility: Optional[RoadmapVisibility] = None
    status: Optional[RoadmapStatus] = None
    tags: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "title": "Apply Python in Real-World Projects",
                    "description": "Create a complete implementation plan for applying Python in real-world projects",
                    "visibility": "public",
                    "status": "draft",
                    "tags": ["Python", "Real-World Projects"],
                    "start_date": "2024-01-01T00:00:00",
                    "target_date": "2024-12-31T00:00:00",
                }
            ]
        }
    )


# ==================== GOAL MODEL ====================
class GoalBase(SQLModel):
    title: str
    description: Optional[str] = None
    type: GoalType = Field(
        default=GoalType.SKILL,
        description="Category of goal: skill, project, career, or personal",
    )
    difficulty: GoalDifficulty = Field(
        default=GoalDifficulty.EASY,
        description="Estimated challenge level: very_easy, easy, medium, hard, very_hard",
    )
    importance: Optional[int] = Field(default=1, ge=1, le=5)  # 1-5 scale
    tags: Optional[List[str]] = Field(sa_column=Column(ARRAY(String)), default=None)
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    
    @field_validator("start_date", "target_date", mode="after")
    def validate_dates(cls, v, info: ValidationInfo):
        start_date = info.data.get("start_date")
        target_date = v
        
        if start_date and target_date and start_date > target_date:
            raise ValueError("Start date cannot be after target date")
        return v


class Goal(GoalBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    roadmap_id: Optional[int] = Field(
        foreign_key="roadmap.id", default=None, index=True
    )
    parent_goal_id: Optional[int] = Field(foreign_key="goal.id", default=None)
    status: GoalStatus = Field(default=GoalStatus.NOT_STARTED, index=True)
    is_llm_generated: bool = Field(default=False)
    llm_metadata: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON), default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    owner: "User" = Relationship(back_populates="goals")
    roadmap: Optional["Roadmap"] = Relationship(back_populates="goals")
    sub_goals: List["Goal"] = Relationship(back_populates="parent_goal")
    cards: List["Card"] = Relationship(back_populates="goal")
    
    parent_goal: Optional["Goal"] = Relationship(
        back_populates="sub_goals", sa_relationship_kwargs={"remote_side": "Goal.id"}
    )
    
    def to_public(self) -> "GoalPublic":
        """Convert Goal ORM instance to public representation"""
        from .public.roadmap_public import GoalPublic
        
        return GoalPublic(
            id=self.id,
            title=self.title,
            description=self.description,
            type=self.type,
            difficulty=self.difficulty,
            importance=self.importance,
            tags=self.tags,
            start_date=self.start_date,
            target_date=self.target_date,
            owner_id=self.owner_id,
            roadmap_id=self.roadmap_id,
            parent_goal_id=self.parent_goal_id,
            status=self.status,
            is_llm_generated=self.is_llm_generated,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


class GoalCreate(GoalBase):
    """User-facing input model (only editable fields)"""
    
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "title": "Learn Python",
                    "description": "Master Python fundamentals",
                    "type": "skill",
                    "difficulty": "easy",
                    "tags": ["programming", "backend"],
                    "start_date": "2024-01-01T00:00:00",
                    "target_date": "2024-06-30T23:59:59",
                }
            ]
        }
    )


class GoalCreationRequest(GoalCreate):
    """User-facing model to create goals with optional AI assistance"""
    
    generate_plan: bool = Field(
        default=True, description="Whether to generate a roadmap and tasks using AI"
    )
    
    ai_settings: Optional[Dict[str, Any]] = Field(
        default=None, description="Optional parameters for customizing AI generation"
    )
    
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "title": "Learn Python",
                    "description": "Master Python fundamentals",
                    "type": "skill",
                    "difficulty": "easy",
                    "tags": ["programming", "backend"],
                    "start_date": "2024-01-01T00:00:00",
                    "target_date": "2024-06-30T23:59:59",
                    "generate_plan": True,
                    "ai_settings": {"model": "compound-beta-mini", "temperature": 0.7},
                }
            ]
        }
    )


class GoalUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[GoalStatus] = None
    difficulty: Optional[GoalDifficulty] = None
    importance: Optional[int] = None
    tags: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None