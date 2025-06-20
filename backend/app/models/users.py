from sqlmodel import SQLModel, Field, Relationship, UniqueConstraint
from app.core.config import settings

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
    user_id: int = Field(foreign_key="user.id", **{"ondelete": "CASCADE"})
    role_id: int = Field(foreign_key="role.id", **{"ondelete": "CASCADE"})
    user: "User" = Relationship(back_populates="roles")
    role: Role = Relationship(back_populates="users")  


class UserBase(SQLModel):
    full_name: str | None = None
    email: str = Field(unique=True, index=True)
    is_active: bool = True

class User(UserBase, table=True):
    id: int = Field(default=None, primary_key=True)
    hashed_password: str
    roles: list[UserRole] = Relationship(back_populates="user", cascade_delete=True)

    def has_role(self, role_name: str) -> bool:
        return any(ur.role.name == role_name for ur in self.roles)

    @property
    def is_superuser(self) -> bool:
        return self.has_role("superuser")

    def to_public(self):
        return UserPublic(
            id=self.id,
            full_name=self.full_name,
            email=self.email,
            is_superuser=self.is_superuser,
            is_provider=self.has_role("provider"),
            is_loggeduser=self.has_role("loggeduser"),
        )

class UserPublic(SQLModel):
    id: int
    full_name: str
    email: str
    is_superuser: bool
    is_provider: bool
    is_loggeduser: bool
    
class UserCreate(UserBase):
    password: str