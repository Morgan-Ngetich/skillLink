from sqlmodel import SQLModel, Field, Relationship
from pydantic import BaseModel
from app.core.config import settings
from enum import Enum
from typing import List

class RoleName(str, Enum):
    SUPERUSER = "superuser"
    MENTOR = "mentor"
    
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


class UserBase(SQLModel):
    full_name: str | None = None
    email: str = Field(unique=True, index=True)
    is_active: bool = True

class User(UserBase, table=True):
    __tablename__ = "users"  # ✅ prevent Postgres reserved word issues
    
    id: int = Field(default=None, primary_key=True)
    hashed_password: str
    roles: list[UserRole] = Relationship(back_populates="user", cascade_delete=True)

    def has_role(self, role_name: RoleName) -> bool:
        return any(ur.role.name == role_name.value for ur in self.roles)

    @property
    def is_superuser(self) -> bool:
        return self.has_role(RoleName.SUPERUSER)

    @property
    def is_mentor(self) -> bool:
        return self.has_role(RoleName.MENTOR)
        
    def to_public(self):
        return UserPublic(
            id=self.id,
            full_name=self.full_name,
            email=self.email,
            is_superuser=self.is_superuser,
            is_mentor=self.is_mentor,
        )

class UserPublic(SQLModel):
    id: int
    full_name: str
    email: str
    is_superuser: bool
    is_mentor: bool

class UsersPublic(BaseModel):
    data: List[UserPublic]
    count: int
    
class UserCreate(UserBase):
    password: str