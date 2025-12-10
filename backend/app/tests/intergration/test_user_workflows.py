from app import crud
from app.models import (
    UserCreate,
    UserProfileCreate,
    UserProfileUpdate,
    MentorProfileCreate,
    MentorSessionCreate,
    MentorSettingsCreate,
    RoadCreate,
    GoalCreate,
    GoalUpdate,
    BoardCreate,
    CardCreate,
)
from app.models.enums import RoleName, BookingStatus, SessionType, LocationType
from datetime import datetime, timedelta


class TestUserWorkflows:
    """Integration tests for complete user workflows"""
    
    def test_user_registration_and_profile_completion(
        self, 
        session, 
        user_data, 
        profile_data
    ):
        """Complete user registration and profile setup workflow"""
        # 1. Create user
        user = crud.create_user(
            session,
            UserCreate(**user_data)  # Fixed: Pass UserCreate object
        )
        session.commit()
        session.refresh(user)
        
        assert user.email == user_data["email"]
        assert user.is_active is True
        
        # 2. Assign role
        crud.assign_role(session, user, RoleName.MENTEE)
        session.commit()
        
        session.refresh(user)
        assert user.is_mentee is True
        
        # 3. Create profile
        profile = crud.create_user_profile(
            session,
            UserProfileCreate(**profile_data),  # Fixed: Pass UserProfileCreate object
            user_id=user.id
        )
        session.commit()
        
        assert profile.user_id == user.id
        assert profile.title == profile_data["title"]
        assert profile.is_profile_complete is True
        
        # 4. Update profile
        updated_profile = crud.update_user_profile(
            session,
            user.id,
            UserProfileUpdate(
                title="Senior Software Developer",
                skills=["Python", "FastAPI", "Docker", "AWS"]
            )
        )
        session.commit()
        
        assert updated_profile.title == "Senior Software Developer"
        assert len(updated_profile.skills) == 4
        
        # 5. Get complete user data
        complete_user = crud.get_user_by_id(session, user.id)
        assert complete_user is not None
        assert complete_user.profile is not None
        assert complete_user.profile.title == "Senior Software Developer"
    
    def test_user_becomes_mentor_workflow(
        self, 
        session, 
        mentor_profile_data
    ):
        """Complete workflow for user becoming a mentor"""
        import uuid
    
        # Generate unique email HERE, not from fixture
        unique_id = uuid.uuid4().hex[:8]
        mentor_user_data = {
            "email": f"mentor-workflow-{unique_id}@example.com",  # Different prefix
            "full_name": "Mentor User",
            "password": "mentor123"
        }
        
        # 1. Create user
        user = crud.create_user(
            session,
            UserCreate(**mentor_user_data)  # Fixed: Pass UserCreate object
        )
        session.commit()
        session.refresh(user)
        
        # 2. Assign mentor role
        crud.assign_role(session, user, RoleName.MENTOR)
        session.commit()
        
        session.refresh(user)
        assert user.is_mentor is True
        
        # 3. Create mentor profile (update user_id to match created user)
        mentor_profile_data_copy = mentor_profile_data.copy()
        mentor_profile_data_copy["user_id"] = user.id
        
        mentor_profile = crud.create_mentor_profile(
            session,
            MentorProfileCreate(**mentor_profile_data_copy)
        )
        session.commit()
        
        assert mentor_profile.user_id == user.id
        assert mentor_profile.is_mentor_profile_complete is True
        
        # 4. Create mentor settings
        mentor_settings = crud.create_mentor_settings(
            session,
            MentorSettingsCreate(
                mentor_id=user.id,
                auto_accept_bookings=False,
                require_intro_message=True
            )
        )
        session.commit()
        
        assert mentor_settings.mentor_id == user.id
        assert mentor_settings.auto_accept_bookings is False
        
        # 5. Create mentor session
        start_time = datetime.now() + timedelta(days=1)
        end_time = start_time + timedelta(hours=1)
        
        mentor_session = crud.create_mentor_session(
            session,
            MentorSessionCreate(
                mentor_id=user.id,
                title="Intro Session",
                session_type=SessionType.ONE_ON_ONE,
                duration_minutes=30,
                start_time=start_time,
                end_time=end_time,
                location_type=LocationType.ONLINE,
                is_public=True
            )
        )
        session.commit()
        
        assert mentor_session.mentor_id == user.id
        assert mentor_session.title == "Intro Session"
        
        # 6. Verify complete mentor setup
        session.refresh(user)
        assert user.mentor_profile is not None
        assert user.mentor_profile.settings is not None
        assert len(user.mentor_profile.sessions) == 1
    
    def test_user_roadmap_and_goal_workflow(
        self, 
        session, 
        test_user, 
        roadmap_data, 
        goal_data
    ):
        """Complete roadmap and goal creation workflow"""
        # 1. Create roadmap
        roadmap = crud.create_roadmap_from_llm(
            session,
            llm_data=RoadCreate(**roadmap_data),
            owner_id=test_user.id
        )
        session.commit()
        
        assert roadmap.owner_id == test_user.id
        assert roadmap.title == roadmap_data["title"]
        
        # 2. Create goal
        goal = crud.create_goal_from_llm(
            session,
            llm_data=GoalCreate(**goal_data),
            owner_id=test_user.id,
            roadmap_id=roadmap.id
        )
        session.commit()
        
        assert goal.owner_id == test_user.id
        assert goal.roadmap_id == roadmap.id
        
        # 3. Create subgoal
        subgoal_data = goal_data.copy()
        subgoal_data.update({
            "title": "Learn FastAPI Routing"
        })
        
        subgoal = crud.create_goal_from_llm(
            session,
            llm_data=GoalCreate(**subgoal_data),
            owner_id=test_user.id,
            roadmap_id=roadmap.id,
            parent_goal_id=goal.id
        )
        session.commit()
        
        assert subgoal.parent_goal_id == goal.id
        
        # 4. Create board for roadmap with cards
        card_data = {
            "title": "Study FastAPI documentation",
            "description": "Read the official docs",
            "status": "todo"
        }
        
        board, total_cards = crud.create_board_from_llm(
            session,
            llm_data=BoardCreate(
                title="Learning Tasks",
                description="Track learning progress"
            ),
            owner_id=test_user.id,
            roadmap_id=roadmap.id,
            goal_id=subgoal.id,
            cards_data=[card_data]
        )
        session.commit()
        session.refresh(board)
        
        assert board.roadmap_id == roadmap.id
        assert board.goal_id == subgoal.id
        assert len(board.lists) == 5  # Default lists: Backlog, To Do, In Progress, Done, Blocked
        assert total_cards == 1
        
        # 5. Verify board lists were created
        backlog_list = next((l for l in board.lists if l.title == "Backlog"), None)
        assert backlog_list is not None
        
        # 6. Verify complete structure
        session.refresh(roadmap)
        session.refresh(goal)
        
        assert len(roadmap.goals) == 2  # goal + subgoal
        assert len(goal.sub_goals) == 1
        assert len(roadmap.boards) == 1
        
        # 7. Update goal status
        updated_goal = crud.update_goal(
            session,
            goal.id,
            GoalUpdate(status="in_progress")
        )
        session.commit()
        
        assert updated_goal.status.value == "in_progress"
        
    def test_mentor_session_booking_workflow(
        self,
        session,
        test_user,  # Regular user fixture
        mentor_session_data
    ):
        """Complete mentor session booking workflow"""
        import uuid
        
        # 1. Create new mentor user (not using fixture)
        unique_id = uuid.uuid4().hex[:8]
        mentor_user = crud.create_user(
            session,
            UserCreate(
                email=f"mentor-booking-{unique_id}@example.com",
                full_name="Mentor Booking User",
                password="mentor123"
            )
        )
        session.commit()
        
        # 2. Setup mentor role
        crud.assign_role(session, mentor_user, RoleName.MENTOR)
        session.commit()
        
        # 3. Create mentor profile
        from app.models.enums import ExperienceLevel
        mentor_profile_data = {
            "user_id": mentor_user.id,
            "title": "Senior Software Engineer",
            "industries": ["Tech", "SaaS"],
            "expertise": ["Python", "FastAPI", "System Design"],
            "experience_level": ExperienceLevel.SENIOR,
            "mentor_type": ["technical_mentor"],
            "tags": ["backend", "api-design"],
            "badges": ["verified"]
        }
        
        mentor_profile = crud.create_mentor_profile(
            session,
            MentorProfileCreate(**mentor_profile_data)
        )
        session.commit()
        
        # Create mentor settings with auto-accept disabled
        mentor_settings = crud.create_mentor_settings(
            session,
            MentorSettingsCreate(
                mentor_id=mentor_user.id,
                auto_accept_bookings=False,
                require_intro_message=True
            )
        )
        session.commit()
        
        # 2. Create mentor session (update mentor_id to session data to match the new created user "mentor_user")
        session_data = mentor_session_data.copy()
        session_data["mentor_id"] = mentor_user.id
        
        mentor_session = crud.create_mentor_session(
            session,
            MentorSessionCreate(**session_data)
        )
        session.commit()
        session.refresh(mentor_session)
        
        assert mentor_session.available_spots == 5
        
        # 3. User books session
        booking = crud.create_session_booking(
            session,
            session_id=mentor_session.id,
            mentee_id=test_user.id,
            message="Would like to discuss Python best practices"
        )
        session.commit()
        
        assert booking.session_id == mentor_session.id
        assert booking.mentee_id == test_user.id
        assert booking.status == BookingStatus.PENDING  # Not auto-accepted
        
        # 4. Mentor confirms booking
        confirmed_booking = crud.update_booking_status(
            session,
            booking_id=booking.id,
            new_status=BookingStatus.CONFIRMED,
            user_id=mentor_user.id
        )
        session.commit()
        
        assert confirmed_booking.status == BookingStatus.CONFIRMED
        
        # 5. Verify session availability
        session.refresh(mentor_session)
        assert mentor_session.confirmed_bookings == 1
        assert mentor_session.available_spots == 4
        
        # 6. Another user tries to book
        another_user = crud.create_user(
            session,
            UserCreate(
                email="another@example.com",
                password="password123",
                full_name="Another User"
            )
        )
        session.commit()
        
        another_booking = crud.create_session_booking(
            session,
            session_id=mentor_session.id,
            mentee_id=another_user.id,
            message="I also need help"
        )
        session.commit()
        
        # 7. Mentor cancels booking
        cancelled_booking = crud.update_booking_status(
            session,
            booking_id=another_booking.id,
            new_status=BookingStatus.CANCELLED_BY_MENTOR,
            user_id=mentor_user.id
        )
        session.commit()
        
        assert cancelled_booking.status == BookingStatus.CANCELLED_BY_MENTOR
        
        # 8. Final session state
        session.refresh(mentor_session)
        assert mentor_session.total_bookings == 2
        assert mentor_session.confirmed_bookings == 1
        assert mentor_session.pending_bookings == 0
        
        # 9. Test access control
        assert mentor_session.can_user_access(mentor_user.id) is True
        assert mentor_session.can_user_access(test_user.id) is True
        assert mentor_session.can_user_access(another_user.id) is False  # Booking was cancelled