# import pytest
# from datetime import datetime
# from typing import Dict, Any

# from app import crud
# from app.models import Roadmap, Goal, User
# from app.models.enums import (
#     RoadmapVisibility,
#     RoadmapStatus,
#     GoalType,
#     GoalDifficulty,
#     GoalStatus,
# )

# # NOTE roadmap_data -> Dict[str, Any]. No need for type


# class TestRoadmapModels:
#     """Test Roadmap and Goal models"""

#     # TODO: Ensure the data matches what is expeced from <"crud.create_roadmap_from_llm">
#     # def test_create_roadmap(self, session, test_user, roadmap_data):
#     #     """Test creating a roadmap"""
#     #     roadmap = crud.create_roadmap_from_llm(session, test_user.id, **roadmap_data)
#     #     session.commit()

#     #     assert roadmap.owner_id == test_user.id
#     #     assert roadmap.title == roadmap_data["title"]
#     #     assert roadmap.description == roadmap_data["description"]
#     #     assert roadmap.visibility == RoadmapVisibility.PRIVATE
#     #     assert roadmap.status == RoadmapStatus.ACTIVE
#     #     assert roadmap.tags == ["python", "backend", "fastapi"]
#     #     assert roadmap.is_llm_generated is False

#     def test_create_goal(
#         self, session, test_user: User, test_roadmap: Dict[str, Any], goal_data
#     ):
#         """Test creating a goal"""
#         # TODO: Ensure the data matches what is expeced from <"crud.create_roadmap_from_llm">
#         goal = crud.create_goal_from_llm(
#             session, owner_id=test_user.id, roadmap_id=test_roadmap.id, **goal_data
#         )
#         session.commit()

#         assert goal.owner_id == test_user.id
#         assert goal.roadmap_id == test_roadmap.id
#         assert goal.title == goal_data["title"]
#         assert goal.description == goal_data["description"]
#         assert goal.type == GoalType.SKILL
#         assert goal.difficulty == GoalDifficulty.MEDIUM
#         assert goal.importance == 4
#         assert goal.status == GoalStatus.NOT_STARTED
#         assert goal.tags == ["fastapi", "python", "backend"]
#         assert goal.is_llm_generated is False

#     def test_goal_hierarchy(self, session, test_user, test_roadmap, goal_data):
#         """Test parent-child goal relationships"""
#         # Create parent goal
#         parent_goal = crud.create_goal(
#             session, owner_id=test_user.id, roadmap_id=test_roadmap.id, **goal_data
#         )

#         # Create child goal
#         child_goal_data = goal_data.copy()
#         child_goal_data.update(
#             {"title": "Learn FastAPI Routing", "parent_goal_id": parent_goal.id}
#         )

#         child_goal = crud.create_goal(
#             session,
#             owner_id=test_user.id,
#             roadmap_id=test_roadmap.id,
#             **child_goal_data,
#         )
#         session.commit()

#         # Refresh to load relationships
#         session.refresh(parent_goal)
#         session.refresh(child_goal)

#         assert child_goal.parent_goal_id == parent_goal.id
#         assert child_goal in parent_goal.sub_goals
#         assert child_goal.parent_goal == parent_goal

#     def test_goal_to_public(self, test_goal: Dict[str, Any]):
#         """Test goal.to_public() method"""
#         public_goal: Goal = test_goal.to_public()

#         assert public_goal.id == test_goal.id
#         assert public_goal.title == test_goal.title
#         assert public_goal.description == test_goal.description
#         assert public_goal.type == test_goal.type
#         assert public_goal.difficulty == test_goal.difficulty
#         assert public_goal.status == test_goal.status
#         assert public_goal.owner_id == test_goal.owner_id
#         assert public_goal.roadmap_id == test_goal.roadmap_id

#     # TODO: Create update and delete ops for roadmaps/cards/goals  
#     def test_update_roadmap(self, session, test_roadmap: Dict[str, Any]):
#         """Test updating roadmap"""
#         update_data = {
#             "title": "Updated Roadmap Title",
#             "status": "completed",
#             "tags": ["python", "fastapi", "advanced"],
#         }

#         updated_roadmap = crud.update_roadmap(session, test_roadmap.id, **update_data)
#         session.commit()

#         assert updated_roadmap.title == "Updated Roadmap Title"
#         assert updated_roadmap.status == RoadmapStatus.COMPLETED
#         assert updated_roadmap.tags == ["python", "fastapi", "advanced"]

#     def test_update_goal(self, session, test_goal):
#         """Test updating goal"""
#         update_data = {
#             "title": "Updated Goal Title",
#             "status": "in_progress",
#             "difficulty": "hard",
#         }

#         updated_goal = crud.update_goal(session, test_goal.id, **update_data)
#         session.commit()

#         assert updated_goal.title == "Updated Goal Title"
#         assert updated_goal.status == GoalStatus.IN_PROGRESS
#         assert updated_goal.difficulty == GoalDifficulty.HARD

#     def test_get_roadmap_by_id(self, session, test_roadmap):
#         """Test retrieving roadmap by ID"""
#         roadmap = crud.get_roadmap(session, test_roadmap.id)
#         assert roadmap is not None
#         assert roadmap.id == test_roadmap.id
#         assert roadmap.title == test_roadmap.title

#     def test_get_goal_by_id(self, session, test_goal):
#         """Test retrieving goal by ID"""
#         goal = crud.get_goal(session, test_goal.id)
#         assert goal is not None
#         assert goal.id == test_goal.id
#         assert goal.title == test_goal.title

#     def test_get_roadmap_goals(self, session, test_roadmap, test_goal):
#         """Test retrieving goals for a roadmap"""
#         goals = crud.get_roadmap_goals(session, test_roadmap.id)
#         assert len(goals) == 1
#         assert goals[0].id == test_goal.id
#         assert goals[0].roadmap_id == test_roadmap.id

#     def test_goal_date_validation(self):
#         """Test goal date validation"""
#         from app.models import GoalCreate
#         from datetime import datetime

#         # Test valid dates (start before end)
#         start = datetime(2024, 1, 1)
#         end = datetime(2024, 12, 31)

#         goal_data = {
#             "title": "Test Goal",
#             "type": "skill",
#             "start_date": start,
#             "target_date": end,
#         }

#         # This should work fine
#         GoalCreate(**goal_data)

#         # Test that invalid dates are caught by Pydantic validation
#         with pytest.raises(ValueError):
#             goal_data_invalid = goal_data.copy()
#             goal_data_invalid["start_date"] = end
#             goal_data_invalid["target_date"] = start
#             GoalCreate(**goal_data_invalid)
