from typing import Optional, List, Dict, Any, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from pydantic import BaseModel

from .enums import (
    ExperienceLevel,
    MentorType,
    SessionType,
    LocationType,
    BookingStatus,
)
from .base import PreparationMaterial

if TYPE_CHECKING:
  from app.models.users import User


# ==================== MENTOR PROFILE MODEL ====================
class MentorProfile(SQLModel, table=True):
    user_id: int = Field(foreign_key="users.id", primary_key=True, index=True)

    # Core Identity
    title: str
    industries: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    expertise: List[str] = Field(sa_column=Column(ARRAY(String), nullable=False))
    experience_level: ExperienceLevel = Field(sa_column=Column(String, nullable=False))
    mentor_type: Optional[List[MentorType]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    tags: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    badges: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    # Stats (cached)
    total_sessions: int = Field(default=0)
    total_mentees: int = Field(default=0)
    average_rating: Optional[float] = Field(default=None)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    user: Optional["User"] = Relationship(back_populates="mentor_profile")
    sessions: List["MentorSession"] = Relationship(back_populates="mentor")
    services: List["MentorService"] = Relationship(back_populates="mentor")
    settings: Optional["MentorSettings"] = Relationship(back_populates="mentor")

    @property
    def is_mentor_profile_complete(self) -> bool:
        return bool(
            self.title
            and self.industries
            and self.expertise
            and len(self.expertise) > 0
            and self.experience_level
        )

    @property
    def completion_percentage(self) -> int:
        fields = [
            bool(self.title),
            bool(self.industries),
            bool(self.expertise and len(self.expertise) > 0),
            bool(self.experience_level),
            bool(self.mentor_type and len(self.mentor_type) > 0),
        ]
        return int((sum(fields) / len(fields)) * 100)

    def to_public(self):
        """Convert to MentorProfilePublic"""
        from .public.mentor_public import MentorProfilePublic
        
        return MentorProfilePublic(
            user_id=self.user_id,
            title=self.title,
            industries=self.industries,
            expertise=self.expertise,
            experience_level=self.experience_level,
            mentor_type=self.mentor_type,
            tags=self.tags,
            badges=self.badges,
            total_sessions=self.total_sessions,
            total_mentees=self.total_mentees,
            average_rating=self.average_rating,
            created_at=self.created_at,
            updated_at=self.updated_at,
            user=self.user.to_minimal() if self.user else None,
            sessions=[s.to_public() for s in self.sessions],
            services=[s.to_public() for s in self.services],
            settings=self.settings.to_public() if self.settings else None,
        )


# ==================== MENTOR SESSION MODEL ====================
class MentorSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)
    mentor_id: int = Field(foreign_key="mentorprofile.user_id")

    # Session Details
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    session_type: SessionType = Field(sa_column=Column(String, nullable=False))
    duration_minutes: int = 60
    price_usd: Optional[float] = None

    tags: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    start_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    end_time: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    timezone: str = Field(default="UTC")

    # Availability & booking rules
    is_public: bool = Field(default=True)
    is_cancelled: bool = Field(default=False)
    is_active: bool = Field(default=True)
    max_bookings: Optional[int] = None

    # Sensitive data
    location_type: LocationType = Field(
        sa_column=Column(String, nullable=False), default=LocationType.ONLINE
    )
    meeting_link: Optional[str] = None
    physical_address: Optional[str] = None
    preparation_materials: Optional[List[PreparationMaterial]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    mentor: "MentorProfile" = Relationship(back_populates="sessions")
    bookings: List["MentorSessionBooking"] = Relationship(back_populates="session")

    @property
    def total_bookings(self) -> int:
        return len(self.bookings)

    @property
    def confirmed_bookings(self) -> int:
        return len([b for b in self.bookings if b.status == BookingStatus.CONFIRMED])

    @property
    def pending_bookings(self) -> int:
        return len([b for b in self.bookings if b.status == BookingStatus.PENDING])

    @property
    def is_full(self) -> bool:
        if self.max_bookings is None:
            return False
        active_bookings = len([
            b for b in self.bookings
            if b.status == BookingStatus.CONFIRMED
        ])
        return active_bookings >= self.max_bookings

    @property
    def available_spots(self) -> Optional[int]:
        if self.max_bookings is None:
            return None
        active_bookings = len([
            b for b in self.bookings
            if b.status == BookingStatus.CONFIRMED
        ])
        return max(0, self.max_bookings - active_bookings)
    
    def user_has_booked(self, user_id: int) -> bool:
        return any(
            b.mentee_id == user_id and b.status in [
                BookingStatus.CONFIRMED,
                BookingStatus.PENDING
            ]
            for b in self.bookings
        )
        
    def can_user_access(self, user_id: int) -> bool:
        is_owner = self.mentor_id == user_id
        has_booking = self.user_has_booked(user_id)
        return is_owner or has_booking

    def to_public(self, current_user_id: Optional[int] = None):
        """Convert to MentorSessionPublic"""
        from .public.mentor_public import MentorSessionPublic
        
        is_owner = current_user_id and self.mentor_id == current_user_id
        user_has_booked = current_user_id and self.user_has_booked(current_user_id)
        can_access = current_user_id and self.can_user_access(current_user_id)
        
        # Hide sensitive data if user doesn't have access
        meeting_link = self.meeting_link if can_access else None
        physical_address = self.physical_address if can_access else None
        
        return MentorSessionPublic(
            id=self.id,
            uuid=self.uuid,
            mentor_id=self.mentor_id,
            title=self.title,
            description=self.description,
            cover_image=self.cover_image,
            session_type=self.session_type,
            duration_minutes=self.duration_minutes,
            price_usd=self.price_usd,
            tags=self.tags,
            start_time=self.start_time,
            end_time=self.end_time,
            timezone=self.timezone,
            is_public=self.is_public,
            is_cancelled=self.is_cancelled,
            is_active=self.is_active,
            max_bookings=self.max_bookings,
            location_type=self.location_type,
            meeting_link=meeting_link,
            physical_address=physical_address,
            preparation_materials=self.preparation_materials,
            total_bookings=self.total_bookings,
            confirmed_bookings=self.confirmed_bookings,
            pending_bookings=self.pending_bookings,
            is_full=self.is_full,
            available_spots=self.available_spots,
            user_has_booked=bool(user_has_booked),
            bookings=[b.to_public() for b in self.bookings] if is_owner else [],
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


# ==================== MENTOR SESSION BOOKING MODEL ====================
class MentorSessionBooking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)

    session_id: int = Field(foreign_key="mentorsession.id", index=True, ondelete="CASCADE")
    mentee_id: int = Field(foreign_key="users.id", index=True, ondelete="CASCADE")

    status: BookingStatus = Field(default=BookingStatus.PENDING, sa_column=Column(String))
    message: Optional[str] = Field(default=None, max_length=1000)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    session: "MentorSession" = Relationship(back_populates="bookings")
    mentee: "User" = Relationship()

    def to_public(self):
        """Convert to BookingPublic"""
        from .public.mentor_public import BookingPublic
        
        return BookingPublic(
            id=self.id,
            uuid=self.uuid,
            session_id=self.session_id,
            mentee=self.mentee.to_minimal(),
            status=self.status,
            message=self.message,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


# ==================== MENTOR SERVICE MODEL ====================
class MentorService(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)
    mentor_id: int = Field(foreign_key="mentorprofile.user_id")

    title: str
    description: Optional[str] = Field(default=None, max_length=500)
    banner_url: Optional[str] = Field(default=None, max_length=500)
    price_usd: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None

    category: Optional[str] = None
    highlights: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    mentor: MentorProfile = Relationship(back_populates="services")

    def to_public(self):
        """Convert to MentorServicePublic"""
        from .public.mentor_public import MentorServicePublic
        
        return MentorServicePublic(
            id=self.id,
            uuid=self.uuid,
            mentor_id=self.mentor_id,
            title=self.title,
            description=self.description,
            banner_url=self.banner_url,
            price_usd=self.price_usd,
            estimated_duration_minutes=self.estimated_duration_minutes,
            category=self.category,
            highlights=self.highlights,
            is_active=self.is_active,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


# ==================== MENTOR SETTINGS MODEL ====================
class MentorSettings(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mentor_id: int = Field(foreign_key="mentorprofile.user_id")

    currently_open_to_mentees: bool = Field(default=True)
    profile_visibility: bool = Field(default=True)
    auto_accept_bookings: bool = Field(default=True)
    require_intro_message: bool = Field(default=True)
    allow_public_availability_view: bool = Field(default=True)

    timezone: Optional[str] = None
    available_times: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    weekly_schedule: Optional[Dict[str, Any]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    booking_buffer_hours: int = Field(default=24)
    session_gap_minutes: int = Field(default=15)

    max_mentees: Optional[int] = Field(default=5)

    mentorship_philosophy: Optional[str] = Field(default=None, max_length=500)
    ideal_mentee_description: Optional[str] = Field(default=None, max_length=300)
    communication_style: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    response_time_hours: int = Field(default=48)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    mentor: "MentorProfile" = Relationship(back_populates="settings")

    def to_public(self):
        """Convert to MentorSettingsPublic"""
        from .public.mentor_public import MentorSettingsPublic
        
        return MentorSettingsPublic(
            id=self.id,
            mentor_id=self.mentor_id,
            currently_open_to_mentees=self.currently_open_to_mentees,
            profile_visibility=self.profile_visibility,
            auto_accept_bookings=self.auto_accept_bookings,
            require_intro_message=self.require_intro_message,
            allow_public_availability_view=self.allow_public_availability_view,
            timezone=self.timezone,
            available_times=self.available_times,
            weekly_schedule=self.weekly_schedule,
            booking_buffer_hours=self.booking_buffer_hours,
            session_gap_minutes=self.session_gap_minutes,
            max_mentees=self.max_mentees,
            mentorship_philosophy=self.mentorship_philosophy,
            ideal_mentee_description=self.ideal_mentee_description,
            communication_style=self.communication_style,
            response_time_hours=self.response_time_hours,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


# ==================== REQUEST/UPDATE MODELS ====================
class BookingCreateRequest(BaseModel):
    message: Optional[str] = Field(None, max_length=1000)


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class MentorProfileCreate(BaseModel):
    user_id: int
    title: str
    industries: Optional[List[str]] = None
    expertise: List[str]
    experience_level: ExperienceLevel
    mentor_type: Optional[List[MentorType]] = None
    tags: Optional[List[str]] = None
    badges: Optional[List[str]] = None


class MentorProfileUpdate(SQLModel):
    title: Optional[str] = None
    industries: Optional[List[str]] = None
    expertise: Optional[List[str]] = None
    experience_level: Optional[ExperienceLevel] = None
    mentor_type: Optional[List[MentorType]] = None
    tags: Optional[List[str]] = None
    badges: Optional[List[str]] = None


class MentorSessionCreate(BaseModel):
    mentor_id: int
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    session_type: SessionType
    duration_minutes: int = 60
    price_usd: Optional[float] = None
    tags: Optional[List[str]] = None
    start_time: datetime
    end_time: datetime
    timezone: str = "UTC"
    is_public: Optional[bool] = None
    is_active: bool = True
    max_bookings: Optional[int] = None
    location_type: LocationType = LocationType.ONLINE
    meeting_link: Optional[str] = None
    physical_address: Optional[str] = None
    preparation_materials: Optional[List[PreparationMaterial]] = None


class MentorSessionUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    session_type: Optional[SessionType] = None
    duration_minutes: Optional[int] = None
    price_usd: Optional[float] = None
    is_public: Optional[bool] = None
    is_active: Optional[bool] = None
    max_bookings: Optional[int] = None
    tags: Optional[List[str]] = None
    location_type: Optional[LocationType] = None
    meeting_link: Optional[str] = None
    physical_address: Optional[str] = None
    preparation_materials: Optional[List[PreparationMaterial]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class MentorServiceCreate(BaseModel):
    mentor_id: int
    title: str
    description: Optional[str] = None
    banner_url: Optional[str] = None
    price_usd: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    category: Optional[str] = None
    highlights: Optional[List[str]] = None


class MentorServiceUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    price_usd: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    category: Optional[str] = None
    highlights: Optional[List[str]] = None
    is_active: Optional[bool] = None


class MentorSettingsCreate(BaseModel):
    mentor_id: int
    currently_open_to_mentees: bool = True
    profile_visibility: bool = True
    auto_accept_bookings: bool = False
    require_intro_message: bool = True
    allow_public_availability_view: Optional[bool] = True
    timezone: Optional[str] = None
    available_times: Optional[List[str]] = None
    weekly_schedule: Optional[Dict[str, Any]] = None
    booking_buffer_hours: int = 24
    session_gap_minutes: int = 15
    max_mentees: Optional[int] = 5
    mentorship_philosophy: Optional[str] = None
    ideal_mentee_description: Optional[str] = None
    communication_style: Optional[List[str]] = None
    response_time_hours: int = 48


class MentorSettingsUpdate(SQLModel):
    currently_open_to_mentees: Optional[bool] = None
    profile_visibility: Optional[bool] = None
    auto_accept_bookings: Optional[bool] = None
    require_intro_message: Optional[bool] = None
    allow_public_availability_view: Optional[bool] = None
    timezone: Optional[str] = None
    available_times: Optional[List[str]] = None
    weekly_schedule: Optional[Dict[str, Any]] = None
    booking_buffer_hours: Optional[int] = None
    session_gap_minutes: Optional[int] = None
    max_mentees: Optional[int] = None
    mentorship_philosophy: Optional[str] = None
    ideal_mentee_description: Optional[str] = None
    communication_style: Optional[List[str]] = None
    response_time_hours: Optional[int] = None