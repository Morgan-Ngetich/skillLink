from sqlmodel import SQLModel
from pydantic import BaseModel
from typing import List, Optional, TYPE_CHECKING
from datetime import datetime
from uuid import UUID

from app.models.base import Education, Experience
from app.models.enums import BookingStatus

if TYPE_CHECKING:
    from app.models.board import Board, Card
    from app.models.roadmap import Roadmap, Goal
    from app.models.public.mentor_public import MentorProfilePublic


class UserMinimal(SQLModel):
    """Minimal user info for nested responses"""
    id: int
    uuid: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    cover_image: Optional[str] = None
    is_superuser: bool
    is_mentor: bool
    is_mentee: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserProfilePublic(SQLModel):
    """User profile with optional mentor profile nested"""
    user_id: int
    uuid: str
    title: Optional[str] = None
    about: Optional[str] = None
    location: Optional[str] = None
    area_of_focus: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    social_links: Optional[dict[str, str]] = None
    contact_details: Optional[dict[str, str]] = None
    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None
    is_profile_complete: Optional[bool] = None
    is_profile_setup_complete: Optional[bool] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    mentor_profile: Optional["MentorProfilePublic"] = None


class UserPublic(SQLModel):
    """Complete public user data with all relationships"""
    id: int
    uuid: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    cover_image: Optional[str] = None
    is_superuser: bool
    is_mentor: bool
    is_mentee: bool
    profile: Optional[UserProfilePublic] = None
    
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    roadmap_count: int = 0
    active_goal_count: int = 0
    
    boards: List["Board"] = []
    roadmaps: List["Roadmap"] = []
    goals: List["Goal"] = []
    assigned_cards: List["Card"] = []
    created_cards: List["Card"] = []


class UsersPublic(BaseModel):
    """List of users with count"""
    data: List[UserPublic]
    count: int


class BookingPublic(SQLModel):
    """Booking without nested session"""
    id: int
    uuid: UUID
    session_id: int
    mentee: Optional[UserMinimal] = None
    status: BookingStatus
    message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}