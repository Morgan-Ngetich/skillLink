import json
import sqlalchemy as sa
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy.orm import relationship
from pydantic import (
    BaseModel,
    ConfigDict,
    computed_field,
    field_validator,
    ValidationInfo,
)
from app.core.config import settings
from enum import Enum
from typing import List, Optional, Dict, Any, Literal, Union
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from app.utils.validation import is_valid
from app.utils.helper import ProgressService


# ================== PUBLIC MODELS ==================
class CleanStrFieldsMixin(BaseModel):
    """Converts empty strings to None for all fields in inheriting models."""

    @field_validator("*", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if isinstance(v, str) and v.strip() == "":
            return None
        return v


class Education(CleanStrFieldsMixin):
    institution: Optional[str] = None
    logo: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class Experience(CleanStrFieldsMixin):
    company: Optional[str] = None
    logo: Optional[str] = None
    position: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class UserProfilePublic(SQLModel):
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


class CardPublic(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str  # CardStatus as string
    priority: str  # CardPriority as string
    position: int = 0
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime
    assignee: Optional["UserPublic"] = None
    created_by: Optional["UserPublic"] = None
    goal: Optional["GoalPublic"] = None


class UserPublic(SQLModel):
    id: int
    uuid: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    cover_image: Optional[str] = None
    is_superuser: bool
    is_mentor: bool
    is_mentee: bool
    profile: Optional["UserProfilePublic"] = None
    # mentor_profile: Optional["MentorProfilePublic"] = None

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
    data: List[UserPublic]
    count: int


class ExperienceLevel(str, Enum):
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"


class MentorType(str, Enum):
    CAREER_COACH = "career_coach"
    TECHNICAL_MENTOR = "technical_mentor"
    INDUSTRY_EXPERT = "industry_expert"
    LEADERSHIP_COACH = "leadership_coach"
    ENTREPRENEUR = "entrepreneur"


class SessionType(str, Enum):
    ONE_ON_ONE = "1-on-1 Video Call"
    CODE_REVIEW = "Code Review"


# ================== ROLES AND PERMISSIONS ==================
class RoleName(str, Enum):
    SUPERUSER = "superuser"
    MENTOR = "mentor"
    MENTEE = "mentee"


# use BaseModel to avoid kwargs mismatch bt FastAPI
class RoleAssignRequest(BaseModel):
    user_id: int
    role_name: RoleName


class RoleBase(SQLModel):
    name: str = Field(unique=True, index=True)


class RoleCreate(RoleBase):
    pass


class RoleUpdate(RoleBase):
    pass


class Role(RoleBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    users: list["UserRole"] = Relationship(back_populates="role", cascade_delete=True)
    permissions: list["RolePermission"] = Relationship(back_populates="role")


class PermissionBase(SQLModel):
    name: str = Field(unique=True, index=True)


class PermissionCreate(PermissionBase):
    pass


class Permission(PermissionBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    roles: list["RolePermission"] = Relationship(
        back_populates="permission", cascade_delete=True
    )


class RolePermission(SQLModel, table=True):
    role_id: int = Field(
        foreign_key="role.id", primary_key=True, **{"ondelete": "CASCADE"}
    )
    permission_id: int = Field(
        foreign_key="permission.id", primary_key=True, **{"ondelete": "CASCADE"}
    )
    role: Role = Relationship(back_populates="permissions")
    permission: Permission = Relationship(back_populates="roles")


class UserRole(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, **{"ondelete": "CASCADE"})
    role_id: int = Field(foreign_key="role.id", index=True, **{"ondelete": "CASCADE"})
    user: "User" = Relationship(back_populates="roles")
    role: Role = Relationship(back_populates="users")


# ================== USER ==================
class UserBase(SQLModel):
    full_name: str | None = None
    email: str = Field(unique=True, index=True)
    is_active: bool = True


class User(UserBase, table=True):
    __tablename__ = "users"  # ✅ prevent Postgres reserved word issues

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
    )  # Auto-incrementing ID for supabase users. Superuser have UUIDs only
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)
    # TODO: Consider moving the avatar_url to UserProfile to keep User table clean and focused on authentication
    avatar_url: str | None = None
    cover_image: str | None = None
    hashed_password: str = Field(repr=False)
    created_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    roles: List["UserRole"] = Relationship(back_populates="user", cascade_delete=True)
    profile: Optional["UserProfile"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"uselist": False}
    )
    mentor_profile: Optional["MentorProfile"] = Relationship(
        back_populates="user", sa_relationship_kwargs={"uselist": False}
    )

    boards: List["Board"] = Relationship(back_populates="owner")
    roadmaps: List["Roadmap"] = Relationship(back_populates="owner")
    goals: List["Goal"] = Relationship(back_populates="owner")
    assigned_cards: List["Card"] = Relationship(
        back_populates="assignee",
        sa_relationship_kwargs={"foreign_keys": "[Card.assignee_id]"},
    )
    created_cards: List["Card"] = Relationship(
        back_populates="created_by",
        sa_relationship_kwargs={"foreign_keys": "[Card.created_by_id]"},
    )

    def has_role(self, role_name: RoleName) -> bool:
        return any(ur.role.name == role_name.value for ur in self.roles)

    @property
    def is_superuser(self) -> bool:
        return self.has_role(RoleName.SUPERUSER)

    @property
    def is_mentor(self) -> bool:
        return self.has_role(RoleName.MENTOR)

    @property
    def is_mentee(self) -> bool:
        return self.has_role(RoleName.MENTEE)

    def to_public(self):
        return UserPublic(
            id=self.id,
            uuid=str(self.uuid),
            full_name=self.full_name,
            email=self.email,
            avatar_url=self.avatar_url or settings.DEFAULT_AVATAR_URL,
            cover_image=self.cover_image or settings.DEFAULT_COVER_IMAGE_URL,
            is_superuser=self.is_superuser,
            is_mentor=self.is_mentor,
            is_mentee=self.is_mentee,
            profile=self.profile.to_public() if self.profile else None,
            mentor_profile=self.mentor_profile.to_public()
            if self.mentor_profile
            else None,
            created_at=self.created_at,
            updated_at=self.updated_at,
            boards=self.boards,
            roadmaps=self.roadmaps,
            roadmap_count=len(self.roadmaps),
            active_goal_count=len(
                [g for g in self.goals if g.status == GoalStatus.IN_PROGRESS]
            ),
            goals=self.goals,
            assigned_cards=self.assigned_cards,
            created_cards=self.created_cards,
        )


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    email: Optional[str] = None  # Add this


# ================== USER PROFILE ==================
class UserSyncIn(BaseModel):
    user_id: UUID  # UUID from Supabase
    email: str
    full_name: str | None = None
    avatar_url: str | None = None  # Optional, can be set later in UserProfile


class UserProfileBase(SQLModel):
    user_id: int = Field(
        foreign_key="users.id", index=True, primary_key=True, **{"ondelete": "CASCADE"}
    )
    title: Optional[str] = Field(default=None, nullable=True)
    about: Optional[str] = Field(default=None, nullable=True)
    location: Optional[str] = Field(default=None, nullable=True)

    area_of_focus: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    goals: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    interests: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    # Later
    skills: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    social_links: Optional[dict[str, str]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    contact_details: Optional[dict[str, str]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    education: Optional[List[Education]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    experience: Optional[List[Experience]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    created_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class UserProfile(UserProfileBase, table=True):
    user: User = Relationship(back_populates="profile")

    @computed_field(return_type=bool)
    @property
    def is_profile_complete(self) -> bool:
        return all(
            is_valid(field)
            for field in [
                self.title,
                self.about,
                self.location,
                self.area_of_focus,
                self.goals,
                self.interests,
                self.skills,
                self.social_links,
                self.contact_details,
                self.education,
                self.experience,
            ]
        )

    @computed_field(return_type=bool)
    @property
    def is_profile_setup_complete(self) -> bool:
        """Partial profile completion check — used to gate initial onboarding steps (no social_links required)."""
        return all(
            is_valid(field)
            for field in [
                self.title,
                self.about,
                self.location,
                self.area_of_focus,
                self.goals,
                self.interests,
                self.skills,
            ]
        )

    def to_public(self):
        return UserProfilePublic(
            user_id=self.user_id,
            uuid=str(self.user.uuid),
            title=self.title,
            about=self.about,
            location=self.location,
            area_of_focus=self.area_of_focus,
            goals=self.goals,
            interests=self.interests,
            skills=self.skills,
            social_links=self.social_links,
            contact_details=self.contact_details,
            education=self.education,
            experience=self.experience,
            is_profile_complete=self.is_profile_complete,
            is_profile_setup_complete=self.is_profile_setup_complete,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


class UserProfileBaseModel(BaseModel):
    title: Optional[str] = None
    about: Optional[str] = None
    location: Optional[str] = None

    area_of_focus: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None

    social_links: Optional[Dict[str, str]] = None
    contact_details: Optional[Dict[str, str]] = None

    education: Optional[List[Education]] = None
    experience: Optional[List[Experience]] = None

    @field_validator("goals", "interests", "area_of_focus", "skills", mode="before")
    @classmethod
    def parse_list_fields(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v]
        return v

    @field_validator("education", "experience", mode="before")
    @classmethod
    def remove_empty_entries(cls, v):
        if not v:
            return []

        # Keep only the entries that have atleast non-empty field
        cleaned = None
        for entry in v:
            if not isinstance(entry, dict):
                continue

            # Filter out entries where all empty, null, or blank strings
            if any(value not in (None, [], {}) for value in entry.values()):
                cleaned = []
                cleaned.append(entry)

        return cleaned

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "title": "Software enginerr at Microsoft",
                    "about": "I am a Software engineer at Microsoft",
                    "location": "Berlin, Germany",
                    "area_of_focus": ["AI", "EdTech", "Open Source"],
                    "goals": ["Build an online course", "Contribute to open source"],
                    "interests": ["Machine Learning", "Startups", "Hackathons"],
                    "skills": ["Python", "FastAPI", "Docker"],
                    "social_links": {
                        "linkedin": "https://linkedin.com/in/morgan",
                        "github": "https://github.com/morgan",
                    },
                    "contact_details": {
                        "email": "user@example.com",
                        "phone": "+1234567890",
                    },
                    "education": [
                        {
                            "institution": "MIT",
                            "degree": "BSc Computer Science",
                            "field_of_study": "Computer Science",
                            "start_date": "2015-09-01T00:00:00",
                            "end_date": "2019-06-01T00:00:00",
                        }
                    ],
                    "experience": [
                        {
                            "company": "Google",
                            "position": "Software Engineer",
                            "description": "Worked on internal tools",
                            "start_date": "2020-01-01T00:00:00",
                            "end_date": "2023-07-01T00:00:00",
                        }
                    ],
                }
            ]
        }
    )


class UserProfileCreate(UserProfileBaseModel):
    pass


class UserProfileUpdate(UserProfileBaseModel):
    pass


class MentorProfileBase(SQLModel):
    user_id: int = Field(foreign_key="users.id", index=True)

    # Core Identity (Required for onboarding)
    title: str  # "Senior Software Engineer at Google"
    industries: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )
    expertise: List[str] = Field(
        sa_column=Column(ARRAY(String), nullable=False)
    )  # ["Career Transitions", "System Design"]
    experience_level: ExperienceLevel = Field(sa_column=Column(String, nullable=False))

    # Optional Identity Enhancements
    mentor_type: Optional[List[MentorType]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    # Display Tags & Badges
    tags: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )  # e.g., ["Hiring Manager", "Open Source Contributor"]
    badges: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )  # e.g., ["Top Mentor", "5-Star Rated"]

    @field_validator("experience_level")
    def validate_experience_level(cls, v):
        if v is not None and v not in [level.value for level in ExperienceLevel]:
            raise ValueError(
                f"Invalid experience_level '{v}'. Must be one of: {[e.value for e in ExperienceLevel]}"
            )
        return v


class MentorSettingsBase(SQLModel):
    """All preferences, availability, and operational settings"""

    mentor_id: int = Field(foreign_key="mentorprofile.user_id")

    # Availability Flags
    currently_open_to_mentees: bool = Field(default=True)
    profile_visibility: bool = Field(default=True)
    auto_accept_bookings: bool = Field(default=False)
    require_intro_message: bool = Field(default=True)

    # Scheduling
    timezone: Optional[str] = None  # e.g., "America/New_York"
    available_times: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )  # e.g., ["Mon-Fri 6-9pm"]
    weekly_schedule: Optional[Dict[str, Any]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )  # Detailed weekly schedule
    booking_buffer_hours: int = Field(default=24)
    session_gap_minutes: int = Field(default=15)

    # Capacity
    max_mentees: Optional[int] = Field(default=5)

    # Mentorship Style
    mentorship_philosophy: Optional[str] = Field(default=None, max_length=500)
    ideal_mentee_description: Optional[str] = Field(default=None, max_length=300)
    communication_style: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )  # e.g., ["Supportive", "Direct"]
    response_time_hours: int = Field(default=48)


class MentorSettings(MentorSettingsBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    mentor: "MentorProfile" = Relationship(back_populates="settings")


class MentorProfilePublic(MentorProfileBase):
    """Public-facing profile data"""
    total_sessions: int
    total_mentees: int
    average_rating: Optional[float]
    created_at: datetime
    updated_at: datetime


class MentorProfile(MentorProfileBase, table=True):
    user_id: int = Field(foreign_key="users.id", primary_key=True, index=True)

    # Stats (computed/cached) (updated via update_mentor_cached_stats after CRUD operations)
    total_sessions: int = Field(default=0)
    total_mentees: int = Field(default=0)
    average_rating: Optional[float] = Field(default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    user: Optional["User"] = Relationship(back_populates="mentor_profile")
    sessions: List["MentorSession"] = Relationship(back_populates="mentor")
    services: List["MentorService"] = Relationship(back_populates="mentor")
    settings: Optional["MentorSettings"] = Relationship(back_populates="mentor")

    @property
    def is_mentor_profile_complete(self) -> bool:
        """Profile is complete if all required fields are filled"""
        return bool(
            self.title
            and self.industries
            and self.expertise
            and len(self.expertise) > 0
            and self.experience_level
        )

    @property
    def completion_percentage(self) -> int:
        """Calculate profile completion percentage"""
        fields = [
            bool(self.title),
            bool(self.industries),
            bool(self.expertise and len(self.expertise) > 0),
            bool(self.experience_level),
            bool(self.mentor_type and len(self.mentor_type) > 0),
        ]
        return int((sum(fields) / len(fields)) * 100)

    def to_public(self) -> MentorProfilePublic:
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
        )


class MentorProfileCreate(MentorProfileBase):
    pass


class MentorProfileUpdate(SQLModel):
    """All fields optional for updates"""

    title: Optional[str] = None
    industries: Optional[List[str]] = None
    expertise: Optional[List[str]] = None
    experience_level: Optional[ExperienceLevel] = None
    mentor_type: Optional[List[MentorType]] = None
    tags: Optional[List[str]] = None
    badges: Optional[List[str]] = None


class LocationType(str, Enum):
    ONLINE = "online"
    PHYSICAL = "physical"


class MentorSessionBase(SQLModel):
    mentor_id: int = Field(foreign_key="mentorprofile.user_id")

    # Session Details
    title: str
    description: Optional[str] = None
    session_type: SessionType
    duration_minutes: int = 60
    price_usd: Optional[float] = None

    tags: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True),
        default=None,
    )

    start_time: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    end_time: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )
    timezone: str = Field(default="UTC")

    # Availability & booking rules
    is_cancelled: bool = Field(default=False)
    is_active: bool = Field(default=True)
    max_bookings: Optional[int] = None

    # Location
    location_type: LocationType = Field(
        sa_column=Column(String, nullable=False),
        default=LocationType.ONLINE
    )

    meeting_link: Optional[str] = None
    physical_address: Optional[str] = None


class MentorSession(MentorSessionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    mentor: MentorProfile = Relationship(back_populates="sessions")
    bookings: List["MentorSessionBooking"] = Relationship(back_populates="session")


    @property
    def total_bookings(self) -> int:
        """Total number of bookings for this session"""
        return len(self.bookings)
    
    @property
    def confirmed_bookings(self) -> int:
        """Number of confirmed bookings"""
        return len([b for b in self.bookings if b.status == BookingStatus.CONFIRMED])
    
    @property
    def pending_bookings(self) -> int:
        """Number of pending bookings"""
        return len([b for b in self.bookings if b.status == BookingStatus.PENDING])
    
    @property
    def is_full(self) -> bool:
        """Check if session has reached max bookings"""
        if self.max_bookings is None:
            return False
        active_bookings = len([
            b for b in self.bookings 
            if b.status in [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        ])
        return active_bookings >= self.max_bookings
    
    @property
    def available_spots(self) -> Optional[int]:
        """Number of available booking spots"""
        if self.max_bookings is None:
            return None
        active_bookings = len([
            b for b in self.bookings 
            if b.status in [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        ])
        return max(0, self.max_bookings - active_bookings)
    
    
    def to_public(self) -> "MentorSessionPublic":
        return MentorSessionPublic.model_validate(self)


class MentorSessionCreate(MentorSessionBase):
    pass


class MentorSessionUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    session_type: Optional[SessionType] = None
    duration_minutes: Optional[int] = None
    price_usd: Optional[float] = None
    is_active: Optional[bool] = None
    max_bookings: Optional[int] = None
    tags: Optional[List[str]] = None
    location_type: Optional[LocationType] = None
    meeting_link: Optional[str] = None
    physical_address: Optional[str] = None
    
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    
class BookingPublic(SQLModel):
    id: int
    uuid: UUID
    session_id: int
    mentee_id: int
    status: BookingStatus
    message: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class MentorSessionPublic(MentorSessionBase):
    id: int
    uuid: UUID
    
    total_bookings: int
    confirmed_bookings: int
    pending_bookings: int
    is_full: bool
    available_spots: Optional[int]
    
    mentor: MentorProfilePublic
    bookings: List[BookingPublic] = Field(default_factory=list)
    
    created_at: datetime
    updated_at: datetime
    
    model_config = {
        "from_attributes": True
    }


# BOOKINGS
class MentorSessionBooking(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)

    session_id: int = Field(
        foreign_key="mentorsession.id", index=True, ondelete="CASCADE"
    )
    mentee_id: int = Field(foreign_key="users.id", index=True, ondelete="CASCADE")

    status: BookingStatus = Field(
        default=BookingStatus.PENDING, sa_column=Column(String)
    )
    message: Optional[str] = Field(default=None, max_length=1000)  # Message to mentor

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    session: MentorSession = Relationship(back_populates="bookings")
    mentee: "User" = Relationship()

    def to_public(self) -> "BookingPublic":
        return BookingPublic.model_validate(self)




# class BookingWithDetails(BookingPublic):
#     """Extended booking with session and mentee details"""
#     session: Optional[MentorSessionPublic] = None
#     mentee: Optional[UserPublic] = None


class BookingCreateRequest(BaseModel):
    message: Optional[str] = Field(None, max_length=1000)


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


# Mentor Service
class MentorServiceBase(SQLModel):
    mentor_id: int = Field(foreign_key="mentorprofile.user_id")

    # Display info
    title: str  # "Portfolio FeedBack"
    description: Optional[str] = Field(default=None, max_length=500)
    banner_url: Optional[str] = Field(default=None, max_length=500)
    price_usd: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None

    # Categorization
    category: Optional[str] = None  # "Career", "Tech Review"
    highlights: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )  # e.g., ["@4hr turnaround", "Detailed Feedback"]

    def to_public(self) -> "MentorServicePublic":
        return MentorServicePublic(
            id=getattr(self, "id", None),
            uuid=getattr(self, "uuid", None),
            mentor_id=self.mentor_id,
            title=self.title,
            description=self.description,
            banner_url=self.banner_url,
            price_usd=self.price_usd,
            estimated_duration_minutes=self.estimated_duration_minutes,
            category=self.category,
            highlights=self.highlights,
            is_active=getattr(self, "is_active", True),
            created_at=getattr(self, "created_at", None),
            updated_at=getattr(self, "updated_at", None),
        )


class MentorService(MentorServiceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)

    is_active: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    mentor: MentorProfile = Relationship(back_populates="services")


class MentorServiceCreate(MentorServiceBase):
    pass


class MentorServiceUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    price_usd: Optional[float] = None
    estimated_duration_minutes: Optional[int] = None
    category: Optional[str] = None
    highlights: Optional[List[str]] = None
    is_active: Optional[bool] = None


class MentorServicePublic(MentorServiceBase):
    id: int
    uuid: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


# MENTOR SETTINGS
class MentorSettingsCreate(MentorSettingsBase):
    """Create with defaults"""
    pass


class MentorSettingsUpdate(SQLModel):
    """All fields optional for updates"""
    currently_open_to_mentees: Optional[bool] = None
    profile_visibility: Optional[bool] = None
    auto_accept_bookings: Optional[bool] = None
    require_intro_message: Optional[bool] = None
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


class MentorSettingsPublic(MentorSettingsBase):
    created_at: datetime
    updated_at: datetime





# MENTOR STATS
class MentorStatsPublic(BaseModel):
    """
    Comprehensive mentor statistics for dashboard
    All counts are computed via SQL queries for performance
    """
    # Profile completion
    completion_percentage: int
    is_complete: bool
    
    # Session stats
    total_sessions: int  # Total sessions ever created (cached in DB)
    active_sessions: int  # Currently active sessions
    upcoming_sessions: int  # Future sessions
    
    # Booking stats (all computed via SQL)
    total_bookings: int  # All bookings
    confirmed_bookings: int
    pending_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    
    # Mentee stats
    total_mentees: int  # Unique mentees who booked (cached in DB)
    
    # Rating
    average_rating: Optional[float]
    
    model_config = ConfigDict(from_attributes=True)





# ====================== ROADMAP SCHEMA =======================
class RoadmapVisibility(str, Enum):
    PRIVATE = "private"
    TEAM = "team"
    PUBLIC = "public"


class RoadmapStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


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
    owner: User = Relationship(back_populates="roadmaps")
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


class RoadmapPublic(SQLModel):
    id: int
    title: str
    description: Optional[str] = None
    visibility: RoadmapVisibility
    status: RoadmapStatus
    tags: Optional[List[str]]
    start_date: Optional[datetime]
    target_date: Optional[datetime]
    is_llm_generated: bool
    created_at: datetime
    updated_at: datetime


# ========================= GOAL SCHEMA (LLM-Generated) ============================
# TODO: Add other(relevant, any) goaltypes
class GoalType(str, Enum):
    SKILL = "skill"
    PROJECT = "project"
    CAREER = "career"
    PERSONAL = "personal"


class GoalStatus(str, Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class GoalDifficulty(str, Enum):
    VERY_EASY = "very_easy"
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    VERY_HARD = "very_hard"


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


class GoalPublic(GoalBase):
    id: int
    owner_id: int
    roadmap_id: Optional[int] = None
    parent_goal_id: Optional[int] = None
    status: GoalStatus
    is_llm_generated: bool
    created_at: datetime
    updated_at: datetime


class Goal(GoalBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    # TODO consider removing this. Or documment that NUll mean personal
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
    owner: User = Relationship(back_populates="goals")
    roadmap: Optional[Roadmap] = Relationship(back_populates="goals")
    sub_goals: List["Goal"] = Relationship(back_populates="parent_goal")
    cards: List["Card"] = Relationship(back_populates="goal")

    parent_goal: Optional["Goal"] = Relationship(
        back_populates="sub_goals", sa_relationship_kwargs={"remote_side": "Goal.id"}
    )

    def to_public(self) -> "GoalPublic":
        """Convert Goal ORM instance to public representation"""
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
    """User-facing model to create goals with optional AI assistance."""

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


# =================== TRELLO-STYLE BOARD SCHEMA =================
class BoardBase(SQLModel):
    title: str
    description: Optional[str] = None
    position: int = Field(default=0)  # for ordering
    is_archived: bool = Field(default=False)


class Board(BoardBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    roadmap_id: Optional[int] = Field(foreign_key="roadmap.id", default=None)
    goal_id: Optional[int] = Field(foreign_key="goal.id", default=None)
    is_llm_generated: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    owner: User = Relationship(back_populates="boards")
    roadmap: Optional[Roadmap] = Relationship(back_populates="boards")
    goal: Optional[Goal] = Relationship()
    lists: List["BoardList"] = Relationship(back_populates="board")


class BoardCreate(BoardBase):
    pass


class BoardUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    is_archived: Optional[bool] = None

    # ========================= BOARD LIST SCHEMA ========================


class CardStatus(str, Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"


class BoardListBase(SQLModel):
    title: str
    position: int = Field(default=0)
    is_archived: bool = Field(default=False)
    status: Optional[CardStatus] = Field(default=None)


class BoardList(BoardListBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="board.id")
    is_llm_generated: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    board: Board = Relationship(back_populates="lists")
    cards: List["Card"] = Relationship(back_populates="list")


class BoardListCreate(BoardListBase):
    pass


class BoardListUpdate(SQLModel):
    title: Optional[str] = None
    position: Optional[int] = None
    is_archived: Optional[bool] = None

    # ================== CARD SCHEMA ==================


class CardPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CardBase(SQLModel):
    title: str
    description: Optional[str] = None
    status: CardStatus = Field(default=CardStatus.TODO)
    priority: CardPriority = Field(default=CardPriority.MEDIUM)
    position: int = Field(default=0)  # for ordering wihtin the list of the todos
    tags: Optional[List[str]] = Field(sa_column=Column(ARRAY(String)), default=None)
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None  # in minutes
    is_archived: bool = Field(default=False)


class Card(CardBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    list_id: int = Field(foreign_key="boardlist.id")
    goal_id: Optional[int] = Field(foreign_key="goal.id", default=None)
    roadmap_id: Optional[int] = Field(foreign_key="roadmap.id", default=None)
    assignee_id: Optional[int] = Field(foreign_key="users.id", default=None)
    created_by_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationsips
    list: BoardList = Relationship(back_populates="cards")
    goal: Optional[Goal] = Relationship(back_populates="cards")
    assignee: Optional[User] = Relationship(
        back_populates="assigned_cards",
        sa_relationship_kwargs={"foreign_keys": "[Card.assignee_id]"},
    )
    created_by: User = Relationship(
        back_populates="created_cards",
        sa_relationship_kwargs={"foreign_keys": "[Card.created_by_id]"},
    )
    comments: List["CardComment"] = Relationship(back_populates="card")
    checklists: List["CardChecklist"] = Relationship(back_populates="card")

    def to_public(self) -> CardPublic:
        return CardPublic(
            id=self.id,
            title=self.title,
            description=self.description,
            status=self.status.value,
            priority=self.priority.value,
            posistion=self.position,
            tags=self.tags,
            due_date=self.due_date,
            estimated_duration=self.estimated_duration,
            is_archived=self.is_archived,
            created_at=self.created_at,
            updated_at=self.updated_at,
            assignee=self.assignee.to_public() if self.assignee else None,
            created_by=self.created_by.to_public() if self.created_by else None,
            goal=self.goal.to_public() if self.goal else None,
        )


class CardCreate(CardBase):
    pass


class CardUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[CardStatus] = None
    priority: Optional[CardPriority] = None
    position: Optional[int] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    is_archived: Optional[bool] = None

    # ==================== CARD COMMENTS ==================


class CardCommentBase(SQLModel):
    content: str


class CardComment(CardCommentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    card_id: int = Field(foreign_key="card.id")
    author_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    card: Card = Relationship(back_populates="comments")
    author: User = Relationship()


class CardCommentCreate(CardCommentBase):
    pass


class CardCommentUpdate(SQLModel):
    content: Optional[str] = None

    # =============== CARD CHECKLISTS =================


class CardChecklistBase(SQLModel):
    title: str
    position: int = Field(default=0)


class CardChecklist(CardChecklistBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    card_id: int = Field(foreign_key="card.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    card: Card = Relationship(back_populates="checklists")
    items: List["CardChecklistItem"] = Relationship(back_populates="checklist")


class CardChecklistCreate(CardChecklistBase):
    pass


class CardChecklistUpdate(SQLModel):
    title: Optional[str] = None
    position: Optional[int] = None

    # ======================== CARD CHECKLIST ITEMS ========================


class CardChecklistItemBase(SQLModel):
    content: str
    is_completed: bool = Field(default=False)
    position: int = Field(default=0)


class CardChecklistItem(CardChecklistItemBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    checklist_id: int = Field(foreign_key="cardchecklist.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    checklist: CardChecklist = Relationship(back_populates="items")


class CardChecklistItemCreate(CardChecklistItemBase):
    pass


class CardChecklistItemUpdate(SQLModel):
    content: Optional[str] = None
    is_completed: Optional[bool] = None
    position: Optional[int] = None


# ================== LLM GENERATION SCHEMA ==================
class SafetyViolationType(str, Enum):
    DIFFICULTY = "difficulty"
    TIMING = "timing"
    PREREQUISITES = "prerequisites"
    CONFLICT = "conflict"
    SYSTEM = "system"


# TODO :// move to public.py
class LLMTargetEntity(str, Enum):
    BOARDS = "boards"
    GOALS = "goals"
    ROADMAPS = "roadmaps"
    CARDS = "cards"
    SYSTEM = "system"

    @classmethod
    def list(cls):
        return [item.value for item in cls]


class SafetyViolation(BaseModel):
    type: SafetyViolationType
    message: str
    severity: Literal["warning", "blocker", "review"]
    suggested_action: Optional[Dict[str, Any]] = None
    # Refrence to affected entities, e.g. goal IDs
    # TODO: Update this to List[Optional[LLMTargetEntity]]
    affected_entities: Optional[List[Union[int, str]]] = None
    entity_type: Optional[List[LLMTargetEntity]] = None


class SafetyReport(BaseModel):
    violations: List[SafetyViolation] = Field(default_factory=list)
    passes: bool = Field(default=True)
    requires_human_review: bool = Field(default=False)


class ProgressiveUpdateProposal(BaseModel):
    intermediate_step: Dict[str, Any]
    final_goal: Dict[str, Any]
    confirmation_required: bool = Field(default=True)


class LLMActionType(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    ANALYZE = "analyze"
    CONFIRM = "confirm"


class LLMGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Primary instruction for the LLM")
    context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Includes user capabilities and historical progress",
    )
    action: LLMActionType = Field(default=LLMActionType.CREATE)
    model: Literal[
        "gpt-3.5-turbo",
        "gpt-4",
        "falcon-7b",
        "falcon-7b-instruct",
        "claude-2",
        "compound-beta-mini",
    ] = "compound-beta-mini"

    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    max_tokens: int = Field(
        default=1024, ge=1, le=4096, description="Maximum number of tokens to generate"
    )
    top_p: float = Field(default=0.7, ge=0.0, le=1.0)
    frequency_penalty: float = Field(default=0.0, ge=0.0, le=2.0)
    presence_penalty: float = Field(default=0.0, ge=0.0, le=2.0)

    target_entities: List[LLMTargetEntity] = Field(default=LLMTargetEntity.GOALS)
    update_constraints: Dict[str, Any] = Field(
        default={"max_difficulty_change": 2, "allow_progressive_steps": True}
    )
    format: Literal["structured", "raw"] = "structured"
    user_intent: Optional[str] = Field(default=None)

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "prompt": "Explain quantum computing to a 12-year-old.",
                    "context": {"user_level": "beginner"},
                    "action": "create",
                    "model": "compound-beta-mini",
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "frequency_penalty": 0.0,
                    "presence_penalty": 0.0,
                    "target_entities": ["roadmaps"],
                    "update_constraints": {"max_difficulty_change": 2},
                    "format": "structured",
                    "user_intent": "accelerated-learning",
                }
            ]
        }
    )

    @field_validator("temperature", mode="before")
    def validate_temperature(cls, v):
        if not (0.0 <= v <= 1.0):
            raise ValueError("Temperature must be between 0.0 and 1.0")
        return v

    @field_validator("top_p", mode="before")
    def validate_top_p(cls, v):
        if not (0.0 <= v <= 1.0):
            raise ValueError("top_p must be between 0.0 and 1.0")
        return v

    @field_validator("frequency_penalty", mode="before")
    def validate_frequency_penalty(cls, v):
        if not (0.0 <= v <= 2.0):
            raise ValueError("frequency_penalty must be between 0.0 and 2.0")
        return v

    @field_validator("presence_penalty", mode="before")
    def validate_presence_penalty(cls, v):
        if not (0.0 <= v <= 2.0):
            raise ValueError("presence_penalty must be between 0.0 and 2.0")
        return v


# TODO create BOADWITHLISTCREATE that will have `boards`: & `lists` instead of `Dict[str, Any]`, to house the `board_with_lists`
class LLMStructuredOutput(BaseModel):
    creations: Optional[
        Dict[
            str,
            List[
                Union[GoalCreate, RoadCreate, CardCreate, BoardCreate, Dict[str, Any]]
            ],
        ]
    ] = Field(
        default_factory=dict,
        description="Structured output containing created entities like goals, roadmaps, or cards",
    )
    updates: Optional[List[Dict[str, Any]]] = None
    progressive_updates: Optional[List[ProgressiveUpdateProposal]] = Field(
        default_factory=list, description="When multi-step progression is needed"
    )
    analysis: Optional[str] = None
    resources: List[Dict[str, str]] = Field(default_factory=list)
    safety_report: SafetyReport = Field(default_factory=SafetyReport)

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "creations": {
                        "goals": [
                            {"title": "Python Intermediate", "difficulty": "easy"}
                        ]
                    },
                    "updates": [
                        {
                            "id": 123,
                            "type": "goal",
                            "changes": {"difficulty": "medium"},
                            "progressive_path": {
                                "steps": [3, 4],
                                "estimated_weeks": [2, 3],
                            },
                        }
                    ],
                    "progressive_updates": [],
                    "analysis": "User needs structured path forward.",
                    "resources": [
                        {"title": "Intro to Python", "url": "https://example.com"}
                    ],
                    "safety_report": {},
                }
            ]
        }
    )


class LLMGenerationResponse(BaseModel):
    request_id: str
    action: LLMActionType
    output: Union[LLMStructuredOutput, str]
    model_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="LLM provider-specific metadata like tokens used, processing time, etc.",
    )
    safety_check: SafetyReport = Field(default_factory=SafetyReport)
    user_options: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Presented when confirmation required",
    )

    def to_public(self) -> Dict[str, Any]:
        return {
            "request_id": self.request_id,
            "action": self.action,
            "output": self.output,
            "user_options": self.user_options,
        }

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "request_id": "abc-123",
                    "action": "create",
                    "output": {
                        "creations": {
                            "goals": [
                                {"title": "Python Intermediate", "difficulty": "easy"}
                            ]
                        },
                        "updates": [],
                        "progressive_updates": [],
                        "analysis": "Recommended next steps...",
                        "resources": [],
                        "safety_report": {},
                    },
                    "model_metadata": {
                        "model": "gpt-3.5-turbo",
                        "tokens_used": 1245,
                        "processing_time": 2.34,
                        "cost_estimate": 0.024,
                    },
                    "safety_check": {},
                    "user_options": {
                        "options": [
                            {
                                "label": "Take intermediate step",
                                "action": "accept_step",
                            },
                            {"label": "Proceed directly", "action": "override"},
                        ]
                    },
                }
            ]
        }
    )


class TaskStatusEnum(str, Enum):
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# TASK STATUS
class TaskStatus(BaseModel):
    task_id: str
    status: TaskStatusEnum
    message: Optional[str] = None
    result: Optional[LLMGenerationResponse] = None


# TODO: Place this in the public folder.
class ListWithCards(SQLModel):
    """List with its cards"""

    boardlist: BoardList
    cards: List[CardPublic]

    @computed_field
    def card_count(self) -> int:
        return len(self.cards)

    @classmethod
    def from_list(cls, board_list: BoardList):
        return cls(
            boardlist=board_list,
            cards=sorted(
                [card.to_public() for card in board_list.cards],
                key=lambda x: x.position,
            ),
        )


class BoardWithLists(SQLModel):
    """Board with nested lists and cards"""

    board: Board
    lists: List[ListWithCards]

    @computed_field
    def active_card_count(self) -> int:
        return sum(len(lst.cards) for lst in self.lists)

    @classmethod
    def from_board(cls, board: Board):
        return cls(
            board=board,
            lists=sorted(
                [ListWithCards.from_list(l) for l in board.lists],
                key=lambda x: x.boardlist.position,
            ),
        )


class GoalWithSubgoals(SQLModel):
    """Goal with nested subgoals structure"""

    goal: GoalPublic
    subgoals: List["GoalWithSubgoals"]
    cards: List[CardPublic]
    progress: float = Field(0.0, ge=0.0, le=1.0)

    @classmethod
    def from_goal(cls, goal: Goal, progress_service: ProgressService, depth: int = 3):
        """takes progress_service as dependency"""
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
    """Combined view for displaying roadmap hierachy"""

    roadmap: Roadmap
    goals: List["GoalWithSubgoals"]
    boards: List[BoardWithLists]

    @classmethod
    def from_roadmap(cls, roadmap: Roadmap, session):
        """Now takes session to create ProgressService"""
        progress_service = ProgressService(session)

        return cls(
            roadmap=roadmap,
            goals=[
                GoalWithSubgoals.from_goal(goal, progress_service)
                for goal in roadmap.goals
                if goal.parent_goal_id is None
            ],  # Only top-level
            boards=[BoardWithLists.from_board(board) for board in roadmap.boards],
            # progress_summary=progress_service.calculate_roadmap_progress(roadmap)
        )


"""
{
  "roadmap": {
    "id": 1,
    "title": "Become Full-Stack Developer",
    "description": "Master frontend and backend technologies in 6 months",
    "visibility": "private",
    "status": "active",
    "tags": ["programming", "career"],
    "start_date": "2024-01-01T00:00:00Z",
    "target_date": "2024-06-30T23:59:59Z",
    "owner_id": 101,
    "created_at": "2024-01-01T09:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  },

  "goals": [
    {
      "id": 10,
      "title": "Master Frontend",
      "type": "skill",
      "difficulty": "hard",
      "status": "in_progress",
      "roadmap_id": 1,
      "parent_goal_id": null,
      "is_llm_generated": true,
      "llm_metadata": {
        "confidence_score": 0.85,
        "generated_at": "2024-01-01T09:05:00Z"
      },
      "sub_goals": [
        {
          "id": 11,
          "title": "Learn React",
          "type": "skill",
          "difficulty": "medium",
          "status": "in_progress",
          "parent_goal_id": 10,
          "cards": [
            {
              "id": 101,
              "title": "Complete React Tutorial",
              "status": "done",
              "priority": "high",
              "due_date": "2024-01-10T23:59:59Z"
            }
          ]
        }
      ]
    }
  ],

  "boards": [
    {
      "id": 100,
      "title": "Weekly Tasks",
      "position": 0,
      "lists": [
        {
          "id": 1001,
          "title": "To Do",
          "position": 0,
          "cards": [
            {
              "id": 102,
              "title": "Build Auth Component",
              "status": "todo",
              "priority": "critical",
              "goal_id": 11,
              "due_date": "2024-01-20T23:59:59Z",
              "checklists": [
                {
                  "title": "Auth Requirements",
                  "items": [
                    {"content": "JWT Implementation", "is_completed": false},
                    {"content": "Password Hashing", "is_completed": true}
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": 1002,
          "title": "In Progress",
          "position": 1,
          "cards": [
            {
              "id": 103,
              "title": "API Integration",
              "status": "in_progress",
              "priority": "medium",
              "goal_id": 11
            }
          ]
        }
      ]
    }
  ],

  "llm_generation": {
    "request": {
      "prompt": "Create a 6-month full-stack learning path",
      "action": "create",
      "target_entities": ["roadmaps", "goals", "cards"],
      "model": "gpt-4"
    },
    "response": {
      "creations": {
        "roadmaps": [{"title": "Become Full-Stack Developer"}],
        "goals": [
          {"title": "Master Frontend", "difficulty": "hard"},
          {"title": "Learn React", "difficulty": "medium"}
        ],
        "cards": [
          {"title": "Complete React Tutorial", "priority": "high"}
        ]
      },
      "safety_report": {
        "passes": true,
        "violations": []
      }
    }
  }
}




{
  "roadmap": {
    "id": 1,
    "title": "Become Full-Stack Developer",
    "description": "Master both frontend and backend technologies to become a complete full-stack developer within 6 months",
    "visibility": "private",
    "status": "active",
    "tags": ["programming", "career", "web-development"],
    "start_date": "2024-01-01T00:00:00Z",
    "target_date": "2024-06-30T23:59:59Z",
    "owner_id": 101,
    "is_llm_generated": true,
    "created_at": "2024-01-01T09:00:00Z",
    "updated_at": "2024-01-15T14:30:00Z",
    
    "owner": {
      "id": 101,
      "uuid": "550e8400-e29b-41d4-a716-446655440001",
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "avatar_url": "https://example.com/avatars/john.jpg",
      "cover_image": "https://example.com/covers/john.jpg",
      "is_superuser": false,
      "is_mentor": true,
      "is_mentee": false,
      "created_at": "2023-12-01T10:00:00Z",
      "updated_at": "2024-01-15T14:30:00Z"
    }
  },

  "goals": [
    {
      "id": 10,
      "title": "Master Frontend Development",
      "description": "Learn modern frontend frameworks and best practices",
      "type": "skill",
      "difficulty": "hard",
      "importance": 5,
      "status": "in_progress",
      "tags": ["frontend", "javascript", "react"],
      "start_date": "2024-01-01T00:00:00Z",
      "target_date": "2024-03-31T23:59:59Z",
      "owner_id": 101,
      "roadmap_id": 1,
      "parent_goal_id": null,
      "is_llm_generated": true,
      "llm_metadata": {
        "confidence_score": 0.85,
        "generated_at": "2024-01-01T09:05:00Z",
        "model": "compound-beta-mini",
        "prompt": "Create frontend learning path"
      },
      "created_at": "2024-01-01T09:05:00Z",
      "updated_at": "2024-01-10T16:20:00Z",
      
      "sub_goals": [
        {
          "id": 11,
          "title": "Learn React Fundamentals",
          "description": "Master React components, hooks, and state management",
          "type": "skill",
          "difficulty": "medium",
          "importance": 4,
          "status": "in_progress",
          "tags": ["react", "javascript", "components"],
          "start_date": "2024-01-01T00:00:00Z",
          "target_date": "2024-01-31T23:59:59Z",
          "owner_id": 101,
          "roadmap_id": 1,
          "parent_goal_id": 10,
          "is_llm_generated": true,
          "llm_metadata": {
            "confidence_score": 0.90,
            "generated_at": "2024-01-01T09:05:00Z"
          },
          "created_at": "2024-01-01T09:06:00Z",
          "updated_at": "2024-01-10T16:20:00Z",
          
          "sub_goals": [],
          
          "cards": [
            {
              "id": 101,
              "title": "Complete React Tutorial Series",
              "description": "Work through official React documentation tutorial",
              "status": "done",
              "priority": "high",
              "position": 1,
              "tags": ["tutorial", "documentation"],
              "due_date": "2024-01-10T23:59:59Z",
              "estimated_duration": 480,
              "is_archived": false,
              "created_at": "2024-01-01T09:10:00Z",
              "updated_at": "2024-01-08T14:00:00Z"
            },
            {
              "id": 102,
              "title": "Build Todo App with React",
              "description": "Create a fully functional todo application using React hooks",
              "status": "in_progress",
              "priority": "high",
              "position": 2,
              "tags": ["project", "hands-on"],
              "due_date": "2024-01-20T23:59:59Z",
              "estimated_duration": 720,
              "is_archived": false,
              "created_at": "2024-01-01T09:12:00Z",
              "updated_at": "2024-01-15T11:30:00Z"
            }
          ]
        },
        {
          "id": 12,
          "title": "Master CSS and Styling",
          "description": "Learn advanced CSS techniques and responsive design",
          "type": "skill",
          "difficulty": "medium",
          "importance": 3,
          "status": "not_started",
          "tags": ["css", "styling", "responsive"],
          "start_date": "2024-02-01T00:00:00Z",
          "target_date": "2024-02-29T23:59:59Z",
          "owner_id": 101,
          "roadmap_id": 1,
          "parent_goal_id": 10,
          "is_llm_generated": true,
          "created_at": "2024-01-01T09:07:00Z",
          "updated_at": "2024-01-01T09:07:00Z",
          
          "sub_goals": [],
          "cards": []
        }
      ],
      
      "cards": [
        {
          "id": 100,
          "title": "Research Frontend Frameworks Comparison",
          "description": "Compare React, Vue, Angular to understand ecosystem",
          "status": "done",
          "priority": "medium",
          "position": 0,
          "tags": ["research", "strategic"],
          "due_date": "2024-01-05T23:59:59Z",
          "estimated_duration": 240,
          "is_archived": false,
          "created_at": "2024-01-01T09:08:00Z",
          "updated_at": "2024-01-03T16:45:00Z"
        }
      ]
    },
    {
      "id": 20,
      "title": "Master Backend Development",
      "description": "Learn server-side programming and database management",
      "type": "skill",
      "difficulty": "hard",
      "importance": 5,
      "status": "not_started",
      "tags": ["backend", "nodejs", "database"],
      "start_date": "2024-04-01T00:00:00Z",
      "target_date": "2024-06-30T23:59:59Z",
      "owner_id": 101,
      "roadmap_id": 1,
      "parent_goal_id": null,
      "is_llm_generated": true,
      "created_at": "2024-01-01T09:08:00Z",
      "updated_at": "2024-01-01T09:08:00Z",
      
      "sub_goals": [
        {
          "id": 21,
          "title": "Learn Node.js and Express",
          "description": "Master server-side JavaScript development",
          "type": "skill",
          "difficulty": "medium",
          "importance": 4,
          "status": "not_started",
          "tags": ["nodejs", "express", "api"],
          "start_date": "2024-04-01T00:00:00Z",
          "target_date": "2024-04-30T23:59:59Z",
          "owner_id": 101,
          "roadmap_id": 1,
          "parent_goal_id": 20,
          "is_llm_generated": true,
          "created_at": "2024-01-01T09:09:00Z",
          "updated_at": "2024-01-01T09:09:00Z",
          
          "sub_goals": [],
          "cards": []
        }
      ],
      
      "cards": []
    }
  ],

  "boards": [
    {
      "id": 200,
      "title": "Frontend Development Sprint",
      "description": "Weekly sprint board for frontend tasks",
      "position": 0,
      "is_archived": false,
      "owner_id": 101,
      "roadmap_id": 1,
      "goal_id": 10,
      "is_llm_generated": true,
      "created_at": "2024-01-01T09:15:00Z",
      "updated_at": "2024-01-15T14:30:00Z",
      
      "lists": [
        {
          "id": 2001,
          "title": "Backlog",
          "position": 0,
          "is_archived": false,
          "status": "backlog",
          "board_id": 200,
          "is_llm_generated": true,
          "created_at": "2024-01-01T09:16:00Z",
          "updated_at": "2024-01-01T09:16:00Z",
          
          "cards": [
            {
              "id": 103,
              "title": "Setup React Testing Library",
              "description": "Configure testing environment for React components",
              "status": "backlog",
              "priority": "medium",
              "position": 1,
              "tags": ["testing", "setup"],
              "due_date": "2024-01-25T23:59:59Z",
              "estimated_duration": 180,
              "is_archived": false,
              "list_id": 2001,
              "goal_id": 11,
              "roadmap_id": 1,
              "assignee_id": 101,
              "created_by_id": 101,
              "created_at": "2024-01-01T09:20:00Z",
              "updated_at": "2024-01-15T11:30:00Z",
              
              "assignee": {
                "id": 101,
                "uuid": "550e8400-e29b-41d4-a716-446655440001",
                "full_name": "John Doe",
                "email": "john.doe@example.com"
              },
              
              "created_by": {
                "id": 101,
                "uuid": "550e8400-e29b-41d4-a716-446655440001",
                "full_name": "John Doe",
                "email": "john.doe@example.com"
              },
              
              "comments": [
                {
                  "id": 1001,
                  "content": "Should include Jest and React Testing Library setup",
                  "card_id": 103,
                  "author_id": 101,
                  "created_at": "2024-01-02T10:15:00Z",
                  "updated_at": "2024-01-02T10:15:00Z",
                  
                  "author": {
                    "id": 101,
                    "uuid": "550e8400-e29b-41d4-a716-446655440001",
                    "full_name": "John Doe",
                    "email": "john.doe@example.com"
                  }
                }
              ],
              
              "checklists": [
                {
                  "id": 1001,
                  "title": "Testing Setup Requirements",
                  "position": 0,
                  "card_id": 103,
                  "created_at": "2024-01-01T09:25:00Z",
                  "updated_at": "2024-01-01T09:25:00Z",
                  
                  "items": [
                    {
                      "id": 10001,
                      "content": "Install Jest testing framework",
                      "is_completed": false,
                      "position": 0,
                      "checklist_id": 1001,
                      "created_at": "2024-01-01T09:26:00Z",
                      "updated_at": "2024-01-01T09:26:00Z"
                    },
                    {
                      "id": 10002,
                      "content": "Configure React Testing Library",
                      "is_completed": false,
                      "position": 1,
                      "checklist_id": 1001,
                      "created_at": "2024-01-01T09:27:00Z",
                      "updated_at": "2024-01-01T09:27:00Z"
                    },
                    {
                      "id": 10003,
                      "content": "Write first component test",
                      "is_completed": false,
                      "position": 2,
                      "checklist_id": 1001,
                      "created_at": "2024-01-01T09:28:00Z",
                      "updated_at": "2024-01-01T09:28:00Z"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "id": 2002,
          "title": "In Progress",
          "position": 1,
          "is_archived": false,
          "status": "in_progress",
          "board_id": 200,
          "is_llm_generated": true,
          "created_at": "2024-01-01T09:17:00Z",
          "updated_at": "2024-01-01T09:17:00Z",
          
          "cards": [
            {
              "id": 102,
              "title": "Build Todo App with React",
              "description": "Create a fully functional todo application using React hooks",
              "status": "in_progress",
              "priority": "high",
              "position": 1,
              "tags": ["project", "hands-on"],
              "due_date": "2024-01-20T23:59:59Z",
              "estimated_duration": 720,
              "is_archived": false,
              "list_id": 2002,
              "goal_id": 11,
              "roadmap_id": 1,
              "assignee_id": 101,
              "created_by_id": 101,
              "created_at": "2024-01-01T09:12:00Z",
              "updated_at": "2024-01-15T11:30:00Z",
              
              "assignee": {
                "id": 101,
                "uuid": "550e8400-e29b-41d4-a716-446655440001",
                "full_name": "John Doe",
                "email": "john.doe@example.com"
              },
              
              "created_by": {
                "id": 101,
                "uuid": "550e8400-e29b-41d4-a716-446655440001",
                "full_name": "John Doe",
                "email": "john.doe@example.com"
              },
              
              "comments": [],
              "checklists": []
            }
          ]
        },
        {
          "id": 2003,
          "title": "Done",
          "position": 2,
          "is_archived": false,
          "status": "done",
          "board_id": 200,
          "is_llm_generated": true,
          "created_at": "2024-01-01T09:18:00Z",
          "updated_at": "2024-01-01T09:18:00Z",
          
          "cards": [
            {
              "id": 101,
              "title": "Complete React Tutorial Series",
              "description": "Work through official React documentation tutorial",
              "status": "done",
              "priority": "high",
              "position": 1,
              "tags": ["tutorial", "documentation"],
              "due_date": "2024-01-10T23:59:59Z",
              "estimated_duration": 480,
              "is_archived": false,
              "list_id": 2003,
              "goal_id": 11,
              "roadmap_id": 1,
              "assignee_id": 101,
              "created_by_id": 101,
              "created_at": "2024-01-01T09:10:00Z",
              "updated_at": "2024-01-08T14:00:00Z",
              
              "assignee": {
                "id": 101,
                "uuid": "550e8400-e29b-41d4-a716-446655440001",
                "full_name": "John Doe",
                "email": "john.doe@example.com"
              },
              
              "created_by": {
                "id": 101,
                "uuid": "550e8400-e29b-41d4-a716-446655440001",
                "full_name": "John Doe",
                "email": "john.doe@example.com"
              },
              
              "comments": [],
              "checklists": []
            }
          ]
        }
      ]
    }
  ],

  "progress_summary": {
    "roadmap_progress": 0.15,
    "total_goals": 2,
    "completed_goals": 0,
    "in_progress_goals": 1,
    "total_cards": 4,
    "completed_cards": 2,
    "in_progress_cards": 1,
    "backlog_cards": 1
  },

  "metadata": {
    "generated_by_llm": true,
    "last_updated": "2024-01-15T14:30:00Z",
    "total_estimated_hours": 25.2,
    "days_remaining": 166
  }
}
"""
