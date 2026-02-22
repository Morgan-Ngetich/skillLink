# from app import crud

# TODO: Check this out when roadmap is intact

# class TestCompleteScenarios:
#     """Tests for complete application scenarios"""
    
#     def test_mentee_journey_with_mentor_guidance(
#         self,
#         session,
#         test_user,
#         test_mentor_profile,
#         test_roadmap,
#         test_goal,
#         test_board
#     ):
#         """Complete scenario: Mentee learning journey with mentor guidance"""
#         # TODO: Ensure the roadmap CRUD ops works
#         # 1. Mentee creates learning roadmap
#         # roadmap = test_roadmap
#         # goal = test_goal
        
#         # # 2. Mentee creates board to track progress
#         # board = test_board
        
#         # # 3. Create lists for the board
#         #* todo_list = crud.create_board_list(
#         #     session,
#         #     board_id=board.id,
#         #     title="To Do",
#         #     status="todo"
#         # )
        
#         # in_progress_list = crud.create_board_list(
#         #     session,
#         #     board_id=board.id,
#         #     title="In Progress",
#         #     status="in_progress"
#         # )
        
#         # # 4. Create cards for learning tasks
#         # card1 = crud.create_card(
#         #     session,
#         #     list_id=todo_list.id,
#         #     created_by_id=test_user.id,
#         #     title="Study FastAPI documentation",
#         #     description="Read official documentation",
#         #     status="todo"
#         # )
        
#         # card2 = crud.create_card(
#         #     session,
#         #     list_id=todo_list.id,
#         #     created_by_id=test_user.id,
#         #     title="Set up development environment",
#         #     description="Install Python, FastAPI, and dependencies",
#         #     status="todo"
#         # )
        
#         # # 5. Link cards to goal
#         # crud.link_card_to_goal(session, card1.id, goal.id)
#         # crud.link_card_to_goal(session, card2.id, goal.id)
        
#         # 6. Mentee books mentor session for guidance
#         from datetime import datetime, timedelta
#         from app.models.enums import SessionType, LocationType
        
#         start_time = datetime.now() + timedelta(days=1)
#         end_time = start_time + timedelta(hours=1)
        
#         mentor_session = crud.create_mentor_session(
#             session,
#             mentor_id=test_mentor_profile.user_id,
#             title="FastAPI Code Review",
#             duration_minutes=60,
#             start_time=start_time,
#             end_time=end_time,
#             location_type=LocationType.ONLINE
#         )
        
#         # 7. Mentee books the session
#         booking = crud.create_session_booking(
#             session,
#             session_id=mentor_session.id,
#             mentee_id=test_user.id,
#             message="Need help with my FastAPI project structure"
#         )
        
#         # 8. Mentor confirms booking
#         from app.models.enums import BookingStatus
#         crud.update_booking_status(
#             session,
#             booking_id=booking.id,
#             mentor_id=test_mentor_profile.user_id,
#             status=BookingStatus.CONFIRMED
#         )
        
#         # 9. Mentee starts working on tasks
#         # Move card to in progress
#         crud.move_card_to_list(session, card2.id, in_progress_list.id)
#         crud.update_card(session, card2.id, status="in_progress")
        
#         # Update goal status
#         crud.update_goal(session, goal.id, status="in_progress")
        
#         # 10. Create checklist for card
#         checklist = crud.create_card_checklist(
#             session,
#             card_id=card2.id,
#             title="Setup Steps"
#         )
        
#         crud.create_checklist_item(
#             session,
#             checklist_id=checklist.id,
#             content="Install Python 3.9+",
#             is_completed=True
#         )
        
#         crud.create_checklist_item(
#             session,
#             checklist_id=checklist.id,
#             content="Create virtual environment",
#             is_completed=True
#         )
        
#         crud.create_checklist_item(
#             session,
#             checklist_id=checklist.id,
#             content="Install FastAPI and uvicorn",
#             is_completed=False
#         )
        
#         session.commit()
        
#         # 11. Verify complete state
#         session.refresh(test_user)
#         session.refresh(goal)
#         session.refresh(board)
#         session.refresh(mentor_session)
        
#         # User has roadmap, goals, and board
#         assert len(test_user.roadmaps) == 1
#         assert len(test_user.goals) == 1
#         assert len(test_user.boards) == 1
        
#         # Goal is in progress and has cards
#         assert goal.status.value == "in_progress"
#         assert len(goal.cards) == 2
        
#         # Board has lists and cards
#         assert len(board.lists) == 2
#         assert len(board.lists[0].cards) == 1  # todo list
#         assert len(board.lists[1].cards) == 1  # in_progress list
        
#         # Card has checklist
#         assert len(card2.checklists) == 1
#         assert len(card2.checklists[0].items) == 3
        
#         # Booking is confirmed
#         assert booking.status == BookingStatus.CONFIRMED
#         assert mentor_session.confirmed_bookings == 1
        
#         # 12. Generate progress report
#         progress_data = {
#             "user_id": test_user.id,
#             "active_goals": len([g for g in test_user.goals if g.status.value == "in_progress"]),
#             "total_goals": len(test_user.goals),
#             "completed_cards": len([c for c in test_user.created_cards if c.status.value == "done"]),
#             "upcoming_session": mentor_session.start_time if mentor_session else None
#         }
        
#         assert progress_data["active_goals"] == 1
#         assert progress_data["total_goals"] == 1
#         assert progress_data["completed_cards"] == 0
#         assert progress_data["upcoming_session"] == mentor_session.start_time
    
#     def test_mentor_managing_multiple_mentees(
#         self,
#         session,
#         test_mentor_profile,
#         mentor_session_data
#     ):
#         """Scenario: Mentor managing multiple mentees and sessions"""
#         # 1. Create multiple mentees
#         mentees = []
#         for i in range(3):
#             mentee = crud.create_user(
#                 session,
#                 email=f"mentee{i}@example.com",
#                 full_name=f"Mentee {i}",
#                 password="password123"
#             )
#             crud.assign_role_to_user(session, mentee.id, "mentee")
#             mentees.append(mentee)
        
        
#         # 3. Mentees book sessions
#         bookings = []
#         from app.models.enums import BookingStatus
        
#         # Mentee 0 books all sessions
#         for i, mentor_session in enumerate(sessions):
#             booking = crud.book_mentor_session(
#                 session,
#                 session_id=mentor_session.id,
#                 mentee_id=mentees[0].id,
#                 message=f"Booking for {mentor_session.title}"
#             )
#             # Mentor confirms first booking
#             if i == 0:
#                 crud.update_booking_status(
#                     session,
#                     booking_id=booking.id,
#                     mentor_id=test_mentor_profile.user_id,
#                     status=BookingStatus.CONFIRMED
#                 )
#             bookings.append(booking)
        
#         # Mentee 1 books first two sessions
#         for i in range(2):
#             booking = crud.book_mentor_session(
#                 session,
#                 session_id=sessions[i].id,
#                 mentee_id=mentees[1].id,
#                 message=f"Booking from mentee 1"
#             )
#             # Mentor confirms second booking
#             if i == 1:
#                 crud.update_booking_status(
#                     session,
#                     booking_id=booking.id,
#                     mentor_id=test_mentor_profile.user_id,
#                     status=BookingStatus.CONFIRMED
#                 )
#             bookings.append(booking)
        
#         # Mentee 2 books only first session (pending)
#         booking = crud.book_mentor_session(
#             session,
#             session_id=sessions[0].id,
#             mentee_id=mentees[2].id,
#             message="Would like to join"
#         )
#         bookings.append(booking)
        
#         session.commit()
        
#         # 4. Verify mentor profile stats
#         session.refresh(test_mentor_profile)
        
#         # Count bookings per session
#         for mentor_session in sessions:
#             session.refresh(mentor_session)
        
#         # Session 0: 3 bookings (2 pending, 1 confirmed)
#         assert sessions[0].total_bookings == 3
#         assert sessions[0].confirmed_bookings == 1
#         assert sessions[0].pending_bookings == 2
#         assert sessions[0].is_full is True  # max_bookings=2
        
#         # Session 1: 2 bookings (1 pending, 1 confirmed)
#         assert sessions[1].total_bookings == 2
#         assert sessions[1].confirmed_bookings == 1
#         assert sessions[1].pending_bookings == 1
#         assert sessions[1].is_full is True
        
#         # Session 2: 1 booking (pending)
#         assert sessions[2].total_bookings == 1
#         assert sessions[2].confirmed_bookings == 0
#         assert sessions[2].pending_bookings == 1
#         assert sessions[2].is_full is False
        
#         # 5. Mentor reviews and manages bookings
#         # Get pending bookings
#         pending_bookings = []
#         for mentor_session in sessions:
#             for booking in mentor_session.bookings:
#                 if booking.status == BookingStatus.PENDING:
#                     pending_bookings.append(booking)
        
#         assert len(pending_bookings) == 4
        
#         # 6. Mentor accepts one pending booking, rejects another
#         accepted_booking = pending_bookings[0]
#         crud.update_booking_status(
#             session,
#             booking_id=accepted_booking.id,
#             mentor_id=test_mentor_profile.user_id,
#             status=BookingStatus.CONFIRMED
#         )
        
#         rejected_booking = pending_bookings[1]
#         crud.update_booking_status(
#             session,
#             booking_id=rejected_booking.id,
#             mentor_id=test_mentor_profile.user_id,
#             status=BookingStatus.CANCELLED_BY_MENTOR
#         )
        
#         session.commit()
        
#         # 7. Final stats
#         total_confirmed = sum(s.confirmed_bookings for s in sessions)
#         total_pending = sum(s.pending_bookings for s in sessions)
#         total_cancelled = len([b for b in bookings if b.status in [
#             BookingStatus.CANCELLED_BY_MENTOR, 
#             BookingStatus.CANCELLED_BY_MENTEE
#         ]])
        
#         assert total_confirmed == 3  # Originally 2 + 1 accepted
#         assert total_pending == 2    # Originally 4 - 1 accepted - 1 rejected
#         assert total_cancelled == 1
        
#         # 8. Test mentor access to all sessions
#         for mentor_session in sessions:
#             public_session = mentor_session.to_public(current_user_id=test_mentor_profile.user_id)
#             assert public_session.meeting_link is not None  # Mentor can see all details
#             assert len(public_session.bookings) == mentor_session.total_bookings