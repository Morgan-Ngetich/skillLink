import pytest

from app.models.llm import (
    LLMGenerationRequest,
    LLMStructuredOutput,
    SafetyViolation,
    SafetyReport,
    ProgressiveUpdateProposal
)
from app.models.enums import (
    SafetyViolationType, LLMTargetEntity, LLMActionType
)


class TestLLMModels:
    """Test LLM related models"""
    
    def test_safety_violation_creation(self):
        """Test creating a safety violation"""
        violation = SafetyViolation(
            type=SafetyViolationType.DIFFICULTY,
            message="Goal difficulty is too high for current skill level",
            severity="blocker",
            suggested_action={"adjust_difficulty": "medium"},
            affected_entities=[123, 456],
            entity_type=[LLMTargetEntity.GOALS]
        )
        
        assert violation.type == SafetyViolationType.DIFFICULTY
        assert violation.message == "Goal difficulty is too high for current skill level"
        assert violation.severity == "blocker"
        assert violation.suggested_action == {"adjust_difficulty": "medium"}
        assert violation.affected_entities == [123, 456]
        assert violation.entity_type == [LLMTargetEntity.GOALS]
    
    def test_safety_report_creation(self):
        """Test creating a safety report"""
        violation = SafetyViolation(
            type=SafetyViolationType.DIFFICULTY,
            message="Test violation",
            severity="warning"
        )
        
        report = SafetyReport(
            violations=[violation],
            passes=False,
            requires_human_review=True
        )
        
        assert len(report.violations) == 1
        assert report.violations[0] == violation
        assert report.passes is False
        assert report.requires_human_review is True
    
    def test_progressive_update_proposal(self):
        """Test progressive update proposal"""
        proposal = ProgressiveUpdateProposal(
            intermediate_step={"difficulty": "easy", "duration": "2 weeks"},
            final_goal={"difficulty": "hard", "duration": "6 weeks"},
            confirmation_required=True
        )
        
        assert proposal.intermediate_step == {"difficulty": "easy", "duration": "2 weeks"}
        assert proposal.final_goal == {"difficulty": "hard", "duration": "6 weeks"}
        assert proposal.confirmation_required is True
    
    def test_llm_generation_request_creation(self):
        """Test creating LLM generation request"""
        request = LLMGenerationRequest(
            prompt="Create a learning roadmap for Python backend development",
            context={
                "user_level": "intermediate",
                "time_available": "20_hours_per_week"
            },
            action=LLMActionType.CREATE,
            model="compound-beta-mini",
            temperature=0.7,
            max_tokens=1024,
            top_p=0.7,
            target_entities=[LLMTargetEntity.ROADMAPS, LLMTargetEntity.GOALS],
            format="structured"
        )
        
        assert request.prompt == "Create a learning roadmap for Python backend development"
        assert request.context["user_level"] == "intermediate"
        assert request.action == LLMActionType.CREATE
        assert request.model == "compound-beta-mini"
        assert request.temperature == 0.7
        assert request.max_tokens == 1024
        assert request.target_entities == [LLMTargetEntity.ROADMAPS, LLMTargetEntity.GOALS]
        assert request.format == "structured"
    
    def test_llm_generation_request_validation(self):
        """Test LLM generation request validation"""
        # Test valid temperature
        request = LLMGenerationRequest(
            prompt="Test",
            temperature=0.5
        )
        assert request.temperature == 0.5
        
        # Test invalid temperature (should raise error)
        with pytest.raises(ValueError):
            LLMGenerationRequest(
                prompt="Test",
                temperature=1.5  # Invalid, should be between 0.0 and 1.0
            )
        
        # Test valid top_p
        request = LLMGenerationRequest(
            prompt="Test",
            top_p=0.9
        )
        assert request.top_p == 0.9
        
        # Test invalid top_p (should raise error)
        with pytest.raises(ValueError):
            LLMGenerationRequest(
                prompt="Test",
                top_p=1.5  # Invalid, should be between 0.0 and 1.0
            )
    
    def test_llm_structured_output_creation(self):
        """Test creating LLM structured output"""
        from app.models.roadmap import GoalCreate
        
        goal_create = GoalCreate(
            title="Learn Python Basics",
            type="skill",
            difficulty="easy"
        )
        
        output = LLMStructuredOutput(
            creations={
                "goals": [goal_create] # Pass the goal create obj
            },
            updates=[
                {
                    "id": 123,
                    "type": "goal",
                    "changes": {"status": "in_progress"}
                }
            ],
            progressive_updates=[
                ProgressiveUpdateProposal(
                    intermediate_step={"step": 1},
                    final_goal={"step": 3}
                )
            ],
            analysis="User is making good progress",
            resources=[
                {"title": "Python Documentation", "url": "https://docs.python.org"}
            ],
            safety_report=SafetyReport(passes=True)
        )
        
        assert len(output.creations["goals"]) == 1
        assert output.creations["goals"][0].title == "Learn Python Basics"
        assert len(output.updates) == 1
        assert output.updates[0]["id"] == 123
        assert len(output.progressive_updates) == 1
        assert output.analysis == "User is making good progress"
        assert len(output.resources) == 1
        assert output.safety_report.passes is True