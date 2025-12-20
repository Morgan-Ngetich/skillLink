from sqlmodel import SQLModel, Field
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any, TYPE_CHECKING
from datetime import datetime
from uuid import UUID

from app.models.enums import ExperienceLevel, MentorType, LocationType
from app.models.base import PreparationMaterial

if TYPE_CHECKING:
    from app.models.public.user_public import UserMinimal, BookingPublic


class MentorServicePublic(SQLModel):
    """Service without nested mentor"""
    id: int
    uuid: UUID
    mentor_id: int
    title: str
    description: Optional[str] = None
    banner_url: Optional[str] = None
    price_usd: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    category: Optional[str] = None
    highlights: Optional[List[str]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class MentorSessionPublic(SQLModel):
    """Session without nested mentor profile"""
    id: int
    uuid: UUID
    mentor_id: int
    
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    session_type: str
    duration_minutes: int
    price_usd: Optional[float] = None
    tags: Optional[List[str]] = None
    
    start_time: datetime
    end_time: datetime
    timezone: str
    
    is_public: bool
    is_cancelled: bool
    is_active: bool
    max_bookings: Optional[int] = None
    
    location_type: LocationType
    meeting_link: Optional[str] = None
    physical_address: Optional[str] = None
    preparation_materials: Optional[List[PreparationMaterial]] = None
    
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    is_full: bool
    available_spots: Optional[int] = None
    user_has_booked: bool = False
    
    bookings: List["BookingPublic"] = Field(default_factory=list)
    
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class MentorSettingsPublic(SQLModel):
    """Public mentor settings"""
    id: int
    mentor_id: int
    
    currently_open_to_mentees: bool
    profile_visibility: bool
    auto_accept_bookings: bool
    require_intro_message: bool
    allow_public_availability_view: bool
    
    timezone: Optional[str] = None
    available_times: Optional[List[str]] = None
    weekly_schedule: Optional[Dict[str, Any]] = None
    booking_buffer_hours: int
    session_gap_minutes: int
    
    max_mentees: Optional[int] = None
    
    mentorship_philosophy: Optional[str] = None
    ideal_mentee_description: Optional[str] = None
    communication_style: Optional[List[str]] = None
    response_time_hours: int
    
    created_at: datetime
    updated_at: datetime


class MentorProfilePublic(SQLModel):
    """Complete public mentor profile"""
    user_id: int
    
    title: str
    industries: Optional[List[str]] = None
    expertise: List[str]
    experience_level: ExperienceLevel
    mentor_type: Optional[List[MentorType]] = None
    tags: Optional[List[str]] = None
    badges: Optional[List[str]] = None
    
    total_sessions: int
    total_mentees: int
    average_rating: Optional[float] = None
    
    created_at: datetime
    updated_at: datetime
    
    user: Optional["UserMinimal"] = None
    sessions: List[MentorSessionPublic] = Field(default_factory=list)
    services: List[MentorServicePublic] = Field(default_factory=list)
    settings: Optional[MentorSettingsPublic] = None


class MentorStatsPublic(BaseModel):
    """Comprehensive mentor statistics"""
    completion_percentage: int
    is_complete: bool
    
    total_sessions: int
    active_sessions: int
    upcoming_sessions: int
    past_sessions: int
    
    total_bookings: int
    active_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    completed_bookings: int
    
    total_cancelled: int
    cancelled_by_mentee: int
    cancelled_by_mentor: int
    expired_bookings: int
    
    total_no_shows: int
    no_show_mentee: int
    no_show_mentor: int
    
    completion_rate: float
    cancellation_rate: float
    no_show_rate: float
    
    total_mentees: int
    average_rating: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)
    

class MentorExplorePublic(SQLModel):
    user_id: int
    uuid: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    cover_image: Optional[str]

    title: str
    about: Optional[str]
    skills: Optional[list[str]]
    location: str
    expertise: List[str]
    area_of_focus: Optional[list[str]]
    experience_level: ExperienceLevel

    average_rating: Optional[float]
    total_sessions: int
    total_mentees: int
    is_available: bool

    min_session_price: Optional[float]
    max_session_price: Optional[float]
    avg_session_price: Optional[float]
