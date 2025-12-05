from app.models.users import User, Role, RoleName, UserRole, UserProfile, MentorProfile

# Intergration tests.
class TestModelRelationships:
    def test_user_with_profile_and_roles(self, session, test_user_data):
        # Setup
        user = User(
            email=test_user_data["email"],
            full_name=test_user_data["full_name"],
            hashed_password="hashed_password",
        )

        # Create roles
        mentor_role = Role(name=RoleName.MENTOR.value)
        mentee_role = Role(name=RoleName.MENTEE.value)

        # Assign roles
        UserRole(user=user, role=mentor_role)
        UserRole(user=user, role=mentee_role)

        # Create profiles
        profile = UserProfile(user=user, about="About")
        mentor_profile = MentorProfile(user=user, title="Mentor")

        session.add_all([user, mentor_role, mentee_role, profile, mentor_profile])
        session.commit()

        # Test
        assert len(user.roles) == 2
        assert user.has_role(RoleName.MENTOR)
        assert user.has_role(RoleName.MENTEE)
        assert user.profile is not None
        assert user.mentor_profile is not None
        assert user.to_public().is_mentor is True
        assert user.to_public().is_mentee is True
