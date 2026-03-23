from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from pydantic import BaseModel, field_validator, computed_field
import json

from app.core.config import settings
from app.utils.validation import is_valid
from .enums import RoleName
from .base import Education, Experience


if TYPE_CHECKING:
    from .board import Board, Card
    from .roadmap import Roadmap, Goal
    from .mentor import MentorProfile


# ==================== ROLE & PERMISSION MODELS ====================
class RoleBase(SQLModel):
    name: str = Field(unique=True, index=True)


class Role(RoleBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    users: list["UserRole"] = Relationship(back_populates="role", cascade_delete=True)
    permissions: list["RolePermission"] = Relationship(back_populates="role")


class Permission(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    roles: list["RolePermission"] = Relationship(
        back_populates="permission", cascade_delete=True
    )


class RolePermission(SQLModel, table=True):
    role_id: int = Field(foreign_key="role.id", primary_key=True, ondelete="CASCADE")
    permission_id: int = Field(
        foreign_key="permission.id", primary_key=True, ondelete="CASCADE"
    )
    role: "Role" = Relationship(back_populates="permissions")
    permission: "Permission" = Relationship(back_populates="roles")


class UserRole(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, ondelete="CASCADE")
    role_id: int = Field(foreign_key="role.id", index=True, ondelete="CASCADE")
    user: "User" = Relationship(back_populates="roles")
    role: "Role" = Relationship(back_populates="users")


# ==================== USER MODEL ====================
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)
    full_name: str | None = None
    email: str = Field(unique=True, index=True)
    avatar_url: str | None = None
    cover_image: str | None = None
    hashed_password: str = Field(repr=False)
    is_active: bool = True
    created_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    roles: List["UserRole"] = Relationship(back_populates="user", cascade_delete=True)
    profile: Optional["UserProfile"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False, "passive_deletes": True},
    )
    mentor_profile: Optional["MentorProfile"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False, "passive_deletes": True},
    )

    # Roadmap relationships
    boards: List["Board"] = Relationship(
        back_populates="owner", sa_relationship_kwargs={"passive_deletes": True}
    )
    roadmaps: List["Roadmap"] = Relationship(
        back_populates="owner", sa_relationship_kwargs={"passive_deletes": True}
    )
    goals: List["Goal"] = Relationship(
        back_populates="owner", sa_relationship_kwargs={"passive_deletes": True}
    )
    assigned_cards: List["Card"] = Relationship(
        back_populates="assignee",
        sa_relationship_kwargs={
            "foreign_keys": "[Card.assignee_id]",
            "passive_deletes": True,
        },
    )
    created_cards: List["Card"] = Relationship(
        back_populates="created_by",
        sa_relationship_kwargs={
            "foreign_keys": "[Card.created_by_id]",
            "passive_deletes": True,
        },
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

    def to_public(self, current_user_id: Optional[int] = None):
        """Convert to UserPublic (imported to avoid circular imports)"""
        from .public.user_public import UserPublic
        from .enums import GoalStatus

        profile_public = (
            self.profile.to_public(current_user_id=current_user_id)
            if self.profile
            else None
        )

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
            profile=profile_public,
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

    def to_minimal(self):
        """Minimal user data for nested responses"""
        from .public.user_public import UserMinimal

        return UserMinimal(
            id=self.id,
            uuid=str(self.uuid),
            full_name=self.full_name,
            email=self.email,
            avatar_url=self.avatar_url or settings.DEFAULT_AVATAR_URL,
            cover_image=self.cover_image or settings.DEFAULT_COVER_IMAGE_URL,
            is_superuser=self.is_superuser,
            is_mentor=self.is_mentor,
            is_mentee=self.is_mentee,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    # TODO: Add/remove fields as needed to match the expected data on the frontend.
    def to_explore_mentor_public(self):
        """Convert to explore mentor public. Returns None if user is not a mentor or profile incomplete."""
        from .public.mentor_public import MentorExplorePublic
        from .mentor import MentorSettings

        # Only for users with mentor profile
        if not self.is_mentor or not self.mentor_profile:
            return None

        mentor_profile: "MentorProfile" = self.mentor_profile
        profile: "UserProfile" = self.profile
        settings: "MentorSettings" = mentor_profile.settings

        public_sessions = [
            s for s in mentor_profile.sessions if s.is_public and s.is_active
        ]

        prices = [s.price_usd for s in public_sessions if s.price_usd is not None]

        return MentorExplorePublic(
            user_id=self.id,
            uuid=str(self.uuid),
            full_name=self.full_name,
            avatar_url=self.avatar_url,
            cover_image=self.cover_image,
            title=mentor_profile.title,
            about=profile.about,
            skills=profile.skills,
            location=profile.location,
            expertise=mentor_profile.expertise,
            area_of_focus=profile.area_of_focus,
            experience_level=mentor_profile.experience_level,
            average_rating=mentor_profile.average_rating,
            total_sessions=mentor_profile.total_sessions,
            total_mentees=mentor_profile.total_mentees,
            is_available=settings.currently_open_to_mentees if settings else False,
            # NOTE: Needed for filtering
            min_session_price=min(prices) if prices else None,
            max_session_price=max(prices) if prices else None,
            avg_session_price=(sum(prices) / len(prices)) if prices else None,
        )


# ==================== USER PROFILE MODEL ====================
class UserProfile(SQLModel, table=True):
    user_id: int = Field(
        foreign_key="users.id", index=True, primary_key=True, ondelete="CASCADE"
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
                self.education,
                self.experience,
            ]
        )

    @computed_field(return_type=bool)
    @property
    def is_profile_setup_complete(self) -> bool:
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

    def to_public(self, current_user_id: Optional[int] = None):
        """Convert to UserProfilePublic"""
        from .public.user_public import UserProfilePublic

        mentor_profile_public = None
        if self.user and self.user.mentor_profile:
            mentor_profile_public = self.user.mentor_profile.to_public(
                current_user_id=current_user_id
            )

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
            mentor_profile=mentor_profile_public,
        )


# ==================== REQUEST/UPDATE MODELS ====================
class RoleAssignRequest(BaseModel):
    user_id: int
    role_name: RoleName


class UserCreate(BaseModel):
    full_name: str | None = None
    email: str
    password: str
    is_active: bool = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_image: Optional[str] = None
    is_active: Optional[bool] = None
    email: Optional[str] = None


class UserSyncIn(BaseModel):
    user_id: UUID
    email: str
    full_name: str | None = None
    avatar_url: str | None = None


class UserProfileBaseModel(BaseModel):
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
        cleaned = []
        for entry in v:
            if not isinstance(entry, dict):
                continue
            if any(value not in (None, [], {}) for value in entry.values()):
                cleaned.append(entry)
        return cleaned if cleaned else []


class UserProfileCreate(UserProfileBaseModel):
    pass


class UserProfileUpdate(UserProfileBaseModel):
    pass
