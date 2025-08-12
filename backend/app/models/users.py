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
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from app.utils.validation import is_valid
from app.utils.helper import calculate_goal_progress


# ================== PUBLIC MODELS ==================
class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class Experience(BaseModel):
    company: str
    position: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class UserProfilePublic(SQLModel):
    user_id: int
    uuid: str
    bio: Optional[str] = None
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
    posistion: int = 0
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime
    assignee: Optional["UserPublic"] = None
    created_by: Optional["UserPublic"] = None


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
    mentor_profile: Optional["MentorProfilePublic"] = None

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


class MentorProfilePublic(SQLModel):
    user_id: int
    uuid: str
    title: Optional[str] = None
    industry: Optional[str] = None
    expertise: Optional[List[str]] = None
    experience_level: Optional[str] = None
    available_times: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    badges: Optional[List[str]] = None
    currently_open_to_mentees: bool
    is_mentor_profile_complete: Optional[bool] = None
    created_at: datetime
    updated_at: datetime



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
    bio: Optional[str] = Field(default=None, nullable=True)
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
                self.bio,
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
                self.bio,
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
            bio=self.bio,
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
    bio: Optional[str] = None
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

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "bio": "Software engineer passionate about education.",
                    "location": "Berlin, Germany",
                    "area_of_focus": ["AI", "EdTech", "Open Source"],
                    "goals": ["Build an online course", "Contribute to open source"],
                    "interests": ["Machine Learning", "Startups", "Hackathons"],
                    "skills": ["Python", "FastAPI", "Docker"],
                    "social_links": {
                        "linkedin": "https://linkedin.com/in/morgan",
                        "github": "https://github.com/morgan"
                    },
                    "contact_details": {
                        "email": "user@example.com",
                        "phone": "+1234567890"
                    },
                    "education": [
                        {
                            "institution": "MIT",
                            "degree": "BSc Computer Science",
                            "field_of_study": "Computer Science", 
                            "start_date": "2015-09-01T00:00:00",
                            "end_date": "2019-06-01T00:00:00"
                        }
                    ],
                    "experience": [
                        {
                            "company": "Google",
                            "position": "Software Engineer",
                            "description": "Worked on internal tools",
                            "start_date": "2020-01-01T00:00:00",
                            "end_date": "2023-07-01T00:00:00"
                        }
                    ]
                }
            ]
        }
    )



class UserProfileCreate(UserProfileBaseModel):
    pass


class UserProfileUpdate(UserProfileBaseModel):
    pass


class MentorProfileBase(SQLModel):
    user_id: int = Field(foreign_key="users.id", index=True, primary_key=True)
    title: Optional[str] = None
    industry: Optional[str] = None

    expertise: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    experience_level: Optional[str] = None

    available_times: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    currently_open_to_mentees: bool = Field(default=True)
    # For bagdes and filtering purposes e.g ["Live Now", "Hiring Manager", "Trending", "Workshop Host"]
    tags: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )


class MentorProfile(MentorProfileBase, table=True):
    user: "User" = Relationship(back_populates="mentor_profile")
    badges: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    created_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    updated_at: Optional[datetime] = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    @computed_field(return_type=bool)
    @property
    def is_mentor_profile_complete(self) -> bool:
        return all(
            is_valid(field)
            for field in [
                self.title,
                self.industry,
                self.expertise,
                self.experience_level,
                self.available_times,
                self.tags,
            ]
        )

    def to_public(self) -> "MentorProfilePublic":
        return MentorProfilePublic(
            user_id=self.user_id,
            uuid=str(self.user.uuid),
            title=self.title,
            industry=self.industry,
            expertise=self.expertise,
            experience_level=self.experience_level,
            available_times=self.available_times,
            tags=self.tags,
            badges=self.badges,
            currently_open_to_mentees=self.currently_open_to_mentees,
            is_mentor_profile_complete=self.is_mentor_profile_complete,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


class MentorProfileCreate(MentorProfileBase):
    pass


class MentorProfileUpdate(SQLModel):
    title: Optional[str] = None
    industry: Optional[str] = None
    expertise: Optional[List[str]] = None
    experience_level: Optional[str] = None
    available_times: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    badges: Optional[List[str]] = None
    currently_open_to_mentees: Optional[bool] = None


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
    owner: User = Relationship(back_populates="goals")
    roadmap: Optional[Roadmap] = Relationship(back_populates="goals")
    sub_goals: List["Goal"] = Relationship(back_populates="parent_goal")
    cards: List["Card"] = Relationship(back_populates="goal")

    parent_goal: Optional["Goal"] = Relationship(
        back_populates="sub_goals", sa_relationship_kwargs={"remote_side": "Goal.id"}
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
        default=True,
        description="Whether to generate a roadmap and tasks using AI"
    )

    ai_settings: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Optional parameters for customizing AI generation"
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
                    "ai_settings": {
                        "model": "compound-beta",
                        "temperature": 0.7
                    }
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    owner: User = Relationship(back_populates="boards")
    roadmap: Optional[Roadmap] = Relationship(back_populates="boards")
    lists: List["BoardList"] = Relationship(back_populates="board")


class BoardCreate(BoardBase):
    pass


class BoardUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None
    is_archived: Optional[bool] = None

    # ========================= BOARD LIST SCHEMA ========================


class BoardListBase(SQLModel):
    title: str
    position: int = Field(default=0)
    is_archived: bool = Field(default=False)


class BoardList(BoardListBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    board_id: int = Field(foreign_key="board.id")
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


class CardStatus(str, Enum):
    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    BLOCKED = "blocked"


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
    posistion: int = Field(default=0)  # for ordering wihtin the list of the todos
    tags: Optional[List[str]] = Field(sa_column=Column(ARRAY(String)), default=None)
    due_date: Optional[datetime] = None
    estimated_duration: Optional[int] = None  # in minutes
    is_archived: bool = Field(default=False)


class Card(CardBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    list_id: int = Field(foreign_key="boardlist.id")
    goal_id: Optional[int] = Field(foreign_key="goal.id", default=None)
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
            posistion=self.posistion,
            tags=self.tags,
            due_date=self.due_date,
            estimated_duration=self.estimated_duration,
            is_archived=self.is_archived,
            created_at=self.created_at,
            updated_at=self.updated_at,
            assignee=self.assignee.to_public() if self.assignee else None,
            created_by=self.created_by.to_public() if self.created_by else None,
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
    SYSTEM="system"



# TODO :// move to public.py
class LLMTargetEntity(str, Enum):
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
        "compound-beta"
    ] = "compound-beta"

    
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    max_tokens: int = Field(default=1024, ge=1, le=4096, description="Maximum number of tokens to generate")
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
                    "model": "compound-beta",
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
    
class LLMStructuredOutput(BaseModel):
    creations: Optional[Dict[str, List[Union[GoalCreate, RoadCreate, CardCreate]]]] = (
        Field(
            default_factory=dict,
            description="Structured output containing created entities like goals, roadmaps, or cards",
        )
    )
    updates: Optional[List[Dict[str, Any]]] = None
    progressive_updates: Optional[List[ProgressiveUpdateProposal]] = Field(
        default_factory=list,
        description="When multi-step progression is needed"
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
class CardWithGoal(SQLModel):
    """Card with goal context"""
    card: CardPublic
    goal: Optional[Goal] = None
    
    @classmethod
    def from_card(cls, card: Card):
        return cls(
            card=card.to_public(),
            goal=card.goal
        )


class ListWithCards(SQLModel):
    """List with its cards"""
    list: BoardList
    cards: List[CardWithGoal]
    
    @classmethod
    def from_list(cls, board_list: BoardList):
        return cls(
            list=board_list,
            cards=[CardWithGoal.from_card(c) for c in board_list.cards]
        )


class BoardWithLists(SQLModel):
    """Board with nested lists and cards"""
    board: Board
    lists: List["ListWithCards"]
    
    @classmethod
    def from_board(cls, board: Board):
        return cls(
            board=board,
            lists=[ListWithCards.from_list(l) for l in board.lists]
        )


class GoalWithSubgoals(SQLModel):
    """Goal with nested subgoals structure"""
    goal: Goal
    subgoals: List["GoalWithSubgoals"]
    cards: List[CardPublic]
    progress: float = Field(0.0, ge=0.0, le=1.0)
    
    @classmethod
    def from_goal(cls, goal: Goal):
        return cls(
            goal=goal,
            subgoals=[cls.from_goal(g) for g in goal.sub_goals],
            cards=[c.to_public() for c in goal.cards],
            progress=calculate_goal_progress(goal)
        )
        
class RoadmapDisplay(SQLModel):
    """Combined view for displaying roadmap hierachy"""
    roadmap: Roadmap
    goals: List["GoalWithSubgoals"]
    boards: List[BoardWithLists]
    
    @classmethod
    def from_roadmap(cls, roadmap: Roadmap):
        return cls(
            roadmap=roadmap,
            goals=[GoalWithSubgoals.from_goal(g) for g in roadmap.goals],
            boards=[BoardWithLists.from_board(b) for b in roadmap.boards]
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
"""