from sqlmodel import SQLModel, Field
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime

from app.models.enums import (
    RoadmapVisibility,
    RoadmapStatus,
    GoalStatus,
    GoalDifficulty,
    GoalType,
)

if TYPE_CHECKING:
    from app.models.roadmap import Roadmap, Goal
    from app.models.public.board_public import BoardWithLists, CardPublic
    from app.utils.helper import ProgressService


class RoadmapPublic(SQLModel):
    """Public roadmap without nested data"""
    id: int
    title: str
    description: Optional[str] = None
    visibility: RoadmapVisibility
    status: RoadmapStatus
    tags: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    is_llm_generated: bool
    created_at: datetime
    updated_at: datetime


class GoalPublic(SQLModel):
    """Public goal without nested data"""
    id: int
    owner_id: int
    roadmap_id: Optional[int] = None
    parent_goal_id: Optional[int] = None
    
    # Core fields
    title: str
    description: Optional[str] = None
    type: GoalType
    difficulty: GoalDifficulty
    importance: Optional[int] = None
    tags: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    
    # Status
    status: GoalStatus
    is_llm_generated: bool
    
    # Timestamps
    created_at: datetime
    updated_at: datetime


class GoalWithSubgoals(SQLModel):
    """Goal with nested subgoals structure"""
    goal: GoalPublic
    subgoals: List["GoalWithSubgoals"] = Field(default_factory=list)
    cards: List["CardPublic"] = Field(default_factory=list)
    progress: float = Field(0.0, ge=0.0, le=1.0)
    
    @classmethod
    def from_goal(cls, goal: "Goal", progress_service: "ProgressService", depth: int = 3):
        """Convert Goal ORM to nested structure with progress"""
        if depth <= 0:
            return cls(
                goal=goal.to_public(),
                subgoals=[],
                cards=[],
                progress=progress_service.calculate_goal_progress(goal),
            )
        
        return cls(
            goal=goal.to_public(),
            subgoals=[
                cls.from_goal(subgoal, progress_service, depth - 1)
                for subgoal in goal.sub_goals
            ],
            cards=[c.to_public() for c in goal.cards],
            progress=progress_service.calculate_goal_progress(goal),
        )


class RoadmapDisplay(SQLModel):
    """Combined view for displaying roadmap hierarchy"""
    roadmap: "Roadmap"
    goals: List[GoalWithSubgoals] = Field(default_factory=list)
    boards: List["BoardWithLists"] = Field(default_factory=list)
    
    @classmethod
    def from_roadmap(cls, roadmap: "Roadmap", session):
        """Convert Roadmap ORM to display structure"""
        from app.utils.helper import ProgressService
        
        progress_service = ProgressService(session)
        
        return cls(
            roadmap=roadmap,
            goals=[
                GoalWithSubgoals.from_goal(goal, progress_service)
                for goal in roadmap.goals
                if goal.parent_goal_id is None
            ],
            boards=[BoardWithLists.from_board(board) for board in roadmap.boards],
        )
