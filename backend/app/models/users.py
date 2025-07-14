import json
from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel, computed_field, field_validator
from app.core.config import settings
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime, timezone
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import JSON, ARRAY
from app.utils.validation import is_valid

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
    roles: list["RolePermission"] = Relationship(back_populates="permission", cascade_delete=True)

class RolePermission(SQLModel, table=True):
    role_id: int = Field(foreign_key="role.id", primary_key=True, **{"ondelete": "CASCADE"})
    permission_id: int = Field(foreign_key="permission.id", primary_key=True, **{"ondelete": "CASCADE"})
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
    
    id: Optional[int] = Field(default=None, primary_key=True,) # Auto-incrementing ID for supabase users. Superuser have UUIDs only
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)
    # TODO: Consider moving the avatar_url to UserProfile to keep User table clean and focused on authentication
    avatar_url: str | None = None
    hashed_password: str = Field(repr=False)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    roles: list[UserRole] = Relationship(back_populates="user", cascade_delete=True)
    
    profile: "UserProfile" = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    mentor_profile: "MentorProfile" = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    
    
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
            is_superuser=self.is_superuser,
            is_mentor=self.is_mentor,
            is_mentee=self.is_mentee,            
            profile=self.profile.to_public() if self.profile else None,
            mentor_profile=self.mentor_profile.to_public() if self.mentor_profile else None,
            created_at=self.created_at,
            updated_at=self.updated_at
        )

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    email: Optional[str] = None  # Add this
    

# ================== USER PUBLIC MODELS ==================
class UserProfilePublic(SQLModel):
    user_id: int
    uuid: str
    bio: Optional[str] = None
    location: Optional[str] = None
    area_of_focus: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    social_links: Optional[dict[str, str]] = None
    is_profile_complete: Optional[bool] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
       
class UserPublic(SQLModel):
    id: int
    uuid: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    is_superuser: bool
    is_mentor: bool
    is_mentee: bool
    profile: Optional["UserProfilePublic"] = None
    mentor_profile: Optional["MentorProfilePublic"] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class UsersPublic(BaseModel):
    data: List[UserPublic]
    count: int

class MentorProfilePublic(SQLModel):
    user_id: int
    uuid: str
    industry: Optional[str] = None
    expertise: Optional[List[str]] = None
    experience_level: Optional[str] = None
    available_times: Optional[List[str]] = None
    currently_open_to_mentees: bool
    contact_details: Optional[dict[str, str]] = None
    is_mentor_profile_complete: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

# ================== USER PROFILE ==================
class UserSyncIn(BaseModel):
    user_id: UUID  # UUID from Supabase
    email: str
    full_name: str | None = None
    avatar_url: str | None = None  # Optional, can be set later in UserProfile
    
    
class UserProfileBase(SQLModel):
    user_id: int = Field(foreign_key="users.id", index=True, primary_key=True, **{"ondelete": "CASCADE"})
    bio: Optional[str] = Field(default=None, nullable=True)
    location: Optional[str] = Field(default=None, nullable=True)
    
    area_of_focus: Optional[List[str]] = Field(sa_column=Column(ARRAY(String), nullable=True), default=None)
    goals: Optional[List[str]] = Field(sa_column=Column(ARRAY(String), nullable=True), default=None)
    interests: Optional[List[str]] = Field(sa_column=Column(ARRAY(String), nullable=True), default=None)
    
    social_links: Optional[dict[str, str]] = Field(sa_column=Column(JSON, nullable=True), default=None)
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
  
class UserProfile(UserProfileBase, table=True):
    user: User = Relationship(back_populates="profile")
    
    @computed_field(return_type=bool)
    @property
    def is_profile_complete(self) -> bool:  
        return all(is_valid(field) for field in [
            self.bio,
            self.location,
            self.area_of_focus,
            self.goals,
            self.interests,
            self.social_links,
        ])
        
    def to_public(self):
        return UserProfilePublic(
            user_id=self.user_id,
            uuid=str(self.user.uuid),
            bio=self.bio,
            location=self.location,
            area_of_focus=self.area_of_focus,
            goals=self.goals,
            interests=self.interests,
            social_links=self.social_links,
            is_profile_complete=self.is_profile_complete,
            created_at=self.created_at,
            updated_at=self.updated_at
        )
        
        
class UserProfileBaseModel(BaseModel):
    bio: Optional[str] = None
    location: Optional[str] = None
    area_of_focus: Optional[List[str]] = None
    goals: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    social_links: Optional[dict[str, str]] = None

    @field_validator('goals', 'interests', 'area_of_focus', mode='before')
    @classmethod
    def parse_list_fields(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v


class UserProfileCreate(UserProfileBaseModel):
    pass


class UserProfileUpdate(UserProfileBaseModel):
    pass

class MentorProfileBase(SQLModel):
    user_id: int = Field(foreign_key="users.id", index=True, primary_key=True)
    industry: Optional[str] = None

    expertise: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    experience_level: Optional[str] = None

    available_times: Optional[List[str]] = Field(
        sa_column=Column(ARRAY(String), nullable=True), default=None
    )

    currently_open_to_mentees: bool = Field(default=True)

    contact_details: Optional[dict[str, str]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )


class MentorProfile(MentorProfileBase, table=True):
    user: "User" = Relationship(back_populates="mentor_profile")

    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

    @computed_field(return_type=bool)
    @property
    def is_mentor_profile_complete(self) -> bool:
        return all(is_valid(field) for field in [
            self.industry,
            self.expertise,
            self.experience_level,
            self.available_times,
            self.contact_details,
        ])
      
    def to_public(self) -> "MentorProfilePublic":
        return MentorProfilePublic(
            user_id=self.user_id,
            uuid=str(self.user.uuid),
            industry=self.industry,
            expertise=self.expertise,
            experience_level=self.experience_level,
            available_times=self.available_times,
            currently_open_to_mentees=self.currently_open_to_mentees,
            contact_details=self.contact_details,
            is_mentor_profile_complete=self.is_mentor_profile_complete,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )


class MentorProfileCreate(MentorProfileBase):
    pass


class MentorProfileUpdate(SQLModel):
    industry: Optional[str] = None
    expertise: Optional[List[str]] = None
    experience_level: Optional[str] = None
    available_times: Optional[List[str]] = None
    currently_open_to_mentees: Optional[bool] = None
    contact_details: Optional[dict[str, str]] = None
