# import pytest

# from app import crud
# from app.models import Board, BoardList, Card, CardChecklist, CardChecklistItem
# from app.models.enums import CardStatus, CardPriority

# TODO: Ensure that all CRUD methos for boards are available.
# class TestBoardModels:
#     """Test Board and Card models"""
    
#     def test_create_board(self, session, test_user, test_roadmap, board_data):
#         """Test creating a board"""
#         board = crud.create_board(
#             session,
#             owner_id=test_user.id,
#             roadmap_id=test_roadmap.id,
#             **board_data
#         )
#         session.commit()
        
#         assert board.owner_id == test_user.id
#         assert board.roadmap_id == test_roadmap.id
#         assert board.title == board_data["title"]
#         assert board.description == board_data["description"]
#         assert board.position == 0
#         assert board.is_archived is False
#         assert board.is_llm_generated is False
    
#     def test_create_board_list(self, session, test_board):
#         """Test creating a board list"""
#         board_list = crud.create_board_list(
#             session,
#             board_id=test_board.id,
#             title="To Do",
#             status="todo"
#         )
#         session.commit()
        
#         assert board_list.board_id == test_board.id
#         assert board_list.title == "To Do"
#         assert board_list.status == CardStatus.TODO
#         assert board_list.position == 0
#         assert board_list.is_archived is False
    
#     def test_create_card(self, session, test_user, test_board, card_data):
#         """Test creating a card"""
#         # Create list first
#         board_list = crud.create_board_list(
#             session,
#             board_id=test_board.id,
#             title="To Do",
#             status="todo"
#         )
        
#         # Create card
#         card = crud.create_card(
#             session,
#             list_id=board_list.id,
#             created_by_id=test_user.id,
#             **card_data
#         )
#         session.commit()
        
#         assert card.list_id == board_list.id
#         assert card.created_by_id == test_user.id
#         assert card.title == card_data["title"]
#         assert card.description == card_data["description"]
#         assert card.status == CardStatus.TODO
#         assert card.priority == CardPriority.MEDIUM
#         assert card.position == 0
#         assert card.is_archived is False
    
#     def test_card_assignment(self, session, test_card, test_user):
#         """Test card assignment to users"""
#         # Create another user
#         assignee = crud.create_user(
#             session,
#             email="assignee@example.com",
#             full_name="Assignee User",
#             password="password123"
#         )
        
#         # Assign card to user
#         updated_card = crud.assign_card_to_user(
#             session,
#             test_card.id,
#             assignee.id
#         )
#         session.commit()
        
#         assert updated_card.assignee_id == assignee.id
#         assert updated_card.assignee == assignee
#         assert test_card in assignee.assigned_cards
    
#     def test_card_with_checklist(self, session, test_card):
#         """Test card with checklist items"""
#         # Create checklist
#         checklist = crud.create_card_checklist(
#             session,
#             card_id=test_card.id,
#             title="Setup Steps"
#         )
        
#         # Add checklist items
#         item1 = crud.create_checklist_item(
#             session,
#             checklist_id=checklist.id,
#             content="Create virtual environment"
#         )
        
#         item2 = crud.create_checklist_item(
#             session,
#             checklist_id=checklist.id,
#             content="Install FastAPI",
#             is_completed=True
#         )
#         session.commit()
        
#         # Refresh card to load relationships
#         session.refresh(test_card)
        
#         assert len(test_card.checklists) == 1
#         assert checklist in test_card.checklists
#         assert len(checklist.items) == 2
#         assert item1 in checklist.items
#         assert item2 in checklist.items
#         assert item1.is_completed is False
#         assert item2.is_completed is True
    
#     def test_card_to_public(self, test_card, test_user):
#         """Test card.to_public() method"""
#         public_card = test_card.to_public()
        
#         assert public_card.id == test_card.id
#         assert public_card.title == test_card.title
#         assert public_card.description == test_card.description
#         assert public_card.status == test_card.status.value
#         assert public_card.priority == test_card.priority.value
#         assert public_card.created_by.id == test_user.id
#         assert public_card.assignee is None  # Not assigned yet
#         assert public_card.goal is None  # Not linked to goal
    
#     def test_update_card(self, session, test_card):
#         """Test updating card"""
#         update_data = {
#             "title": "Updated Card Title",
#             "status": "in_progress",
#             "priority": "high",
#             "position": 1
#         }
        
#         updated_card = crud.update_card(session, test_card.id, **update_data)
#         session.commit()
        
#         assert updated_card.title == "Updated Card Title"
#         assert updated_card.status == CardStatus.IN_PROGRESS
#         assert updated_card.priority == CardPriority.HIGH
#         assert updated_card.position == 1
    
#     def test_update_board(self, session, test_board):
#         """Test updating board"""
#         update_data = {
#             "title": "Updated Board Title",
#             "description": "Updated description",
#             "is_archived": True
#         }
        
#         updated_board = crud.update_board(session, test_board.id, **update_data)
#         session.commit()
        
#         assert updated_board.title == "Updated Board Title"
#         assert updated_board.description == "Updated description"
#         assert updated_board.is_archived is True
    
#     def test_link_card_to_goal(self, session, test_card, test_goal):
#         """Test linking card to goal"""
#         updated_card = crud.link_card_to_goal(session, test_card.id, test_goal.id)
#         session.commit()
        
#         assert updated_card.goal_id == test_goal.id
#         assert updated_card.goal == test_goal
#         assert test_card in test_goal.cards
    
#     def test_move_card_between_lists(self, session, test_card, test_board):
#         """Test moving card between lists"""
#         # Create another list
#         new_list = crud.create_board_list(
#             session,
#             board_id=test_board.id,
#             title="In Progress",
#             status="in_progress"
#         )
        
#         # Move card to new list
#         moved_card = crud.move_card_to_list(session, test_card.id, new_list.id)
#         session.commit()
        
#         assert moved_card.list_id == new_list.id
#         assert test_card.list == new_list
    
#     def test_get_board_lists(self, session, test_board):
#         """Test retrieving lists for a board"""
#         # Create some lists
#         list1 = crud.create_board_list(session, test_board.id, title="List 1", status="todo")
#         list2 = crud.create_board_list(session, test_board.id, title="List 2", status="in_progress")
        
#         lists = crud.get_board_lists(session, test_board.id)
#         assert len(lists) == 2
#         assert list1 in lists
#         assert list2 in lists