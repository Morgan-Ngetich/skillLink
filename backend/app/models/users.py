from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel
from app.core.config import settings
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4
from datetime import datetime
from pydantic import model_validator, computed_field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSON

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
    user_id: int = Field(foreign_key="users.id", **{"ondelete": "CASCADE"})
    role_id: int = Field(foreign_key="role.id", **{"ondelete": "CASCADE"})
    user: "User" = Relationship(back_populates="roles")
    role: Role = Relationship(back_populates="users")  



# ================== USER ==================
class UserBase(SQLModel):
    full_name: str | None = None
    email: str = Field(unique=True, index=True)
    is_active: bool = True

class User(UserBase, table=True):
    __tablename__ = "users"  # ✅ prevent Postgres reserved word issues
    
    id: int = Field(default=None, primary_key=True)
    uuid: UUID = Field(default_factory=uuid4, index=True, unique=True)
    # TODO: Consider moving the avatar_url to UserProfile to keep User table clean and focused on authentication
    avatar_url: str | None = None
    hashed_password: str
    created_at: datetime | None = Field(default=None, nullable=True)
    updated_at: datetime | None = Field(default=None, nullable=True)

    roles: list[UserRole] = Relationship(back_populates="user", cascade_delete=True)
    
    profile: "UserProfile" = Relationship(back_populates="user", sa_relationship_kwargs={"uselist": False})
    
    
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
            full_name=self.full_name,
            email=self.email,
            avatar_url=self.avatar_url or settings.DEFAULT_AVATAR_URL,
            is_superuser=self.is_superuser,
            is_mentor=self.is_mentor,
            is_mentee=self.is_mentee,
            profile=self.profile.to_public() if self.profile else None    
        )

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
    is_active: bool | None = None
    

# ================== USER PUBLIC MODELS ==================
class UserProfilePublic(SQLModel):
    user_id: int
    bio: str | None = None
    location: str | None = None
    goals: str | None = None
    social_links: dict[str, str] | None = None
    
class UserPublic(SQLModel):
    id: int
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    is_superuser: bool
    is_mentor: bool
    is_mentee: bool
    profile: Optional["UserProfilePublic"] = None

class UsersPublic(BaseModel):
    data: List[UserPublic]
    count: int
    

# ================== USER PROFILE ==================
class UserSyncIn(BaseModel):
    user_id: UUID
    email: str
    full_name: str | None = None
    avatar_url: str | None = None  # Optional, can be set later in UserProfile
    
    
class UserProfileBase(SQLModel):
    user_id: int = Field(foreign_key="users.id", primary_key=True, **{"ondelete": "CASCADE"})
    bio: str | None = None
    location: str | None = None
    goals: str | None = None
    social_links: Optional[dict[str, str]] = Field(
        sa_column=Column(JSON, nullable=True), default=None
    )
    created_at: datetime | None = Field(default=None, nullable=True)
    updated_at: datetime | None = Field(default=None, nullable=True)
  
class UserProfile(UserProfileBase, table=True):
    user: User = Relationship(back_populates="profile")
    @computed_field
    def avatar_url(self) -> str:
        return self.user.avatar_url or settings.DEFAULT_AVATAR_URL if self.user else settings.DEFAULT_AVATAR_URL
    
    def to_public(self):
        return UserProfilePublic(
            user_id=self.user_id,
            bio=self.bio,
            location=self.location,
            goals=self.goals,
            social_links=self.social_links
        )
        
class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(BaseModel):
    bio: str | None = None
    location: str | None = None
    goals: str | None = None
    social_links: Optional[dict[str, str]] = None 

    