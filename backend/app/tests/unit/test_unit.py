import pytest
from uuid import UUID
from app.models.users import (
    User,
    UserPublic,
    UserProfile,
    Role,
    Permission,
    RolePermission,
    UserRole,
    MentorProfile,
    RoleName,
    UserProfileBaseModel,
    RoleAssignRequest
)


# User Model Tests
class TestUserModel:
    def test_user_create(self, session, test_user_data):
        # Text basic user creation
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_" + test_user_data["password"],
        )
        session.add(user)
        session.commit()

        assert user.id is not None
        assert isinstance(user.uuid, UUID)
        assert user.created_at is not None, "User.created_ar is not set correctly"
        assert user.updated_at is not None, "User.Updated_at is not set correctly"
        assert user.is_active is True

    def test_user_has_role(self, session, test_user_data):
        # SetUp
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_" + test_user_data["password"],
        )
        role = Role(name=RoleName.MENTOR.value)

        user_role = UserRole(user=user, role=role)
        session.add_all([user, role, user_role])
        session.commit()

        assert user.has_role(RoleName.MENTOR) is True
        assert user.has_role(RoleName.MENTEE) is False
        assert user.is_mentor is True
        assert user.is_mentee is False
        assert user.is_superuser is False

    def test_user_to_public(self, session, test_user_data):
        # Setup
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_" + test_user_data["password"],
            avatar_url="http://example.com/avatar.jpg",
        )
        session.add(user)
        session.commit()

        public_user = user.to_public()
        assert isinstance(public_user, UserPublic)
        assert public_user.email == test_user_data["email"]
        assert public_user.avatar_url == "http://example.com/avatar.jpg"
        assert public_user.is_superuser is False
        assert public_user.profile is None
        assert public_user.mentor_profile is None


# Role AND Permission Tests
class TestRoleAndPermissionModels:
    def test_role_creation(self, session):
        role = Role(name=RoleName.MENTOR.value)
        session.add(role)
        session.commit()

        assert role.id is not None
        assert role.name == RoleName.MENTOR.value

    def test_permission_creation(self, session):
        permission = Permission(name="create_post")
        session.add(permission)
        session.commit()

        assert permission.id is not None
        assert permission.name == "create_post"

    def test_role_permission_association(self, session):
        # Setup.
        role = Role(name=RoleName.MENTOR.value)
        permission = Permission(name="create_post")
        role_permission = RolePermission(role=role, permission=permission)

        session.add_all([role, permission, role_permission])
        session.commit()

        assert len(role.permissions) == 1
        assert role.permissions[0].permission.name == "create_post"
        assert len(permission.roles) == 1
        assert permission.roles[0].role.name == RoleName.MENTOR.value

    def test_user_role_assignment(self, session, test_user_data):
        # Setup
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_" + test_user_data["password"],
        )
        role = Role(name=RoleName.MENTEE.value)
        user_role = UserRole(user=user, role=role)

        session.add_all([user, role, user_role])
        session.commit()

        assert len(user.roles) == 1
        assert user.roles[0].role.name == RoleName.MENTEE.value
        assert len(role.users) == 1
        assert role.users[0].user.email == test_user_data["email"]


# User Profile Tests
class TestUserProfileModel:
    def test_profile_creation(self, session, test_user_data):
        # Setup
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_" + test_user_data["password"],
        )
        profile = UserProfile(
            user=user,
            about="Test about section",
            location="Test Location",
            area_of_focus=["Tech", "Education"],
            goals=["Learn Python", "Become mentor"],
            interests=["Programming", "Teaching"],
            skills=["Programming", "Architecture"]
        )
        session.add_all([user, profile])
        session.commit()

        assert profile.user_id == user.id
        assert profile.about == "Test about section"
        assert profile.area_of_focus == ["Tech", "Education"]
        assert profile.is_profile_setup_complete is True
        assert profile.is_profile_complete is False  # Because social_links is missing

    def test_profile_completion_flags(self, session):
        # Test with minimal data
        user = User(email="minimal@example.com", hashed_password="pwd")
        profile = UserProfile(user=user, about="just about")
        session.add_all([user, profile])
        session.commit()

        assert profile.is_profile_setup_complete is False
        assert profile.is_profile_complete is False

    def test_profile_to_public(self, session, test_user_data):
        # Setup
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_password",
        )
        profile = UserProfile(
            user=user,
            about="Test about",
            location="Test Location",
            social_links={"twitter": "testuser"},
        )
        session.add_all([user, profile])
        session.commit()

        # Test
        public_profile = profile.to_public()
        assert public_profile.user_id == user.id
        assert public_profile.about == "Test about"
        assert public_profile.social_links == {"twitter": "testuser"}
        assert public_profile.is_profile_complete is False


# Mentor Profile Tests
class TestMentorProfileModel:
    def test_mentor_profile_creation(self, session, test_user_data):
        # Setup
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_password",
        )
        mentor_profile = MentorProfile(
            user=user,
            title="Senior Developer",
            industry="Tech",
            expertise=["Python", "SQL"],
            currently_open_to_mentees=True,
        )
        session.add_all([user, mentor_profile])
        session.commit()

        # Test
        assert mentor_profile.user_id == user.id
        assert mentor_profile.title == "Senior Developer"
        assert mentor_profile.expertise == ["Python", "SQL"]
        assert mentor_profile.currently_open_to_mentees is True
        assert mentor_profile.is_mentor_profile_complete is False  # Missing some fields

    def test_mentor_profile_completion(self, session):
        # Complete profile
        user = User(email="complete@example.com", hashed_password="pwd")
        mentor_profile = MentorProfile(
            user=user,
            title="Title",
            industry="Industry",
            expertise=["Skill"],
            experience_level="Senior",
            available_times=["Weekends"],
            tags=["Tag"],
            currently_open_to_mentees=True,
        )
        session.add_all([user, mentor_profile])
        session.commit()

        assert mentor_profile.is_mentor_profile_complete is True

    def test_mentor_profile_to_public(self, session, test_user_data):
        # Setup
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_password",
        )
        mentor_profile = MentorProfile(
            user=user,
            title="Senior Developer",
            expertise=["Python"],
            currently_open_to_mentees=True,
        )
        session.add_all([user, mentor_profile])
        session.commit()

        # Test
        public_profile = mentor_profile.to_public()
        assert public_profile.user_id == user.id
        assert public_profile.title == "Senior Developer"
        assert public_profile.expertise == ["Python"]
        assert public_profile.currently_open_to_mentees is True
        assert public_profile.is_mentor_profile_complete is False


# Validatsion tests.
class TestModelValidation:
    def test_user_profile_validation(self):
        # Test array fields can accept JSON strings
        profile_data = {
            "about": "Test about",
            "goals": '["goal1", "goal2"]',
            "interests": '["interest1", "interest2"]',
        }
        profile = UserProfileBaseModel(**profile_data)

        assert profile.about == "Test about"
        assert profile.goals == ["goal1", "goal2"]
        assert profile.interests == ["interest1", "interest2"]

    def test_role_assign_request_validation(self):
        # Test enum validation
        valid_data = {"user_id": 1, "role_name": "mentor"}
        request = RoleAssignRequest(**valid_data)
        assert request.role_name == RoleName.MENTOR

        # Test invalid role
        with pytest.raises(ValueError):
            invalid_data = {"user_id": 1, "role_name": "invalid_role"}
            RoleAssignRequest(**invalid_data)

