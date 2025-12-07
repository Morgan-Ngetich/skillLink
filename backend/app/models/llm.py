from sqlmodel import Field
from pydantic import (
    BaseModel,
    ConfigDict,
    field_validator,
)
from typing import List, Optional, Dict, Any, Literal, Union, TYPE_CHECKING
from .enums import SafetyViolationType, LLMTargetEntity, LLMActionType


if TYPE_CHECKING:
    from app.models.roadmap import RoadCreate, GoalCreate
    from app.models.board import BoardCreate, CardCreate
    
class SafetyViolation(BaseModel):
    type: SafetyViolationType
    message: str
    severity: Literal["warning", "blocker", "review"]
    suggested_action: Optional[Dict[str, Any]] = None
    # Refrence to affected entities, e.g. goal IDs
    # TODO: Update this to List[Optional[LLMTargetEntity]]
    affected_entities: Optional[List[Union[int, str]]] = None
    entity_type: Optional[List[LLMTargetEntity]] = None


class SafetyReport(BaseModel):
    violations: List[SafetyViolation] = Field(default_factory=list)
    passes: bool = Field(default=True)
    requires_human_review: bool = Field(default=False)


class ProgressiveUpdateProposal(BaseModel):
    intermediate_step: Dict[str, Any]
    final_goal: Dict[str, Any]
    confirmation_required: bool = Field(default=True)



class LLMGenerationRequest(BaseModel):
    prompt: str = Field(..., description="Primary instruction for the LLM")
    context: Dict[str, Any] = Field(
        default_factory=dict,
        description="Includes user capabilities and historical progress",
    )
    action: LLMActionType = Field(default=LLMActionType.CREATE)
    model: Literal[
        "gpt-3.5-turbo",
        "gpt-4",
        "falcon-7b",
        "falcon-7b-instruct",
        "claude-2",
        "compound-beta-mini",
    ] = "compound-beta-mini"

    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    max_tokens: int = Field(
        default=1024, ge=1, le=4096, description="Maximum number of tokens to generate"
    )
    top_p: float = Field(default=0.7, ge=0.0, le=1.0)
    frequency_penalty: float = Field(default=0.0, ge=0.0, le=2.0)
    presence_penalty: float = Field(default=0.0, ge=0.0, le=2.0)

    target_entities: List[LLMTargetEntity] = Field(default=LLMTargetEntity.GOALS)
    update_constraints: Dict[str, Any] = Field(
        default={"max_difficulty_change": 2, "allow_progressive_steps": True}
    )
    format: Literal["structured", "raw"] = "structured"
    user_intent: Optional[str] = Field(default=None)

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "prompt": "Explain quantum computing to a 12-year-old.",
                    "context": {"user_level": "beginner"},
                    "action": "create",
                    "model": "compound-beta-mini",
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "frequency_penalty": 0.0,
                    "presence_penalty": 0.0,
                    "target_entities": ["roadmaps"],
                    "update_constraints": {"max_difficulty_change": 2},
                    "format": "structured",
                    "user_intent": "accelerated-learning",
                }
            ]
        }
    )

    @field_validator("temperature", mode="before")
    def validate_temperature(cls, v):
        if not (0.0 <= v <= 1.0):
            raise ValueError("Temperature must be between 0.0 and 1.0")
        return v

    @field_validator("top_p", mode="before")
    def validate_top_p(cls, v):
        if not (0.0 <= v <= 1.0):
            raise ValueError("top_p must be between 0.0 and 1.0")
        return v

    @field_validator("frequency_penalty", mode="before")
    def validate_frequency_penalty(cls, v):
        if not (0.0 <= v <= 2.0):
            raise ValueError("frequency_penalty must be between 0.0 and 2.0")
        return v

    @field_validator("presence_penalty", mode="before")
    def validate_presence_penalty(cls, v):
        if not (0.0 <= v <= 2.0):
            raise ValueError("presence_penalty must be between 0.0 and 2.0")
        return v


# TODO create BOADWITHLISTCREATE that will have `boards`: & `lists` instead of `Dict[str, Any]`, to house the `board_with_lists`
class LLMStructuredOutput(BaseModel):
    creations: Optional[
        Dict[
            str,
            List[
                Union["GoalCreate", "RoadCreate", "CardCreate", "BoardCreate", Dict[str, Any]]
            ],
        ]
    ] = Field(
        default_factory=dict,
        description="Structured output containing created entities like goals, roadmaps, or cards",
    )
    updates: Optional[List[Dict[str, Any]]] = None
    progressive_updates: Optional[List[ProgressiveUpdateProposal]] = Field(
        default_factory=list, description="When multi-step progression is needed"
    )
    analysis: Optional[str] = None
    resources: List[Dict[str, str]] = Field(default_factory=list)
    safety_report: SafetyReport = Field(default_factory=SafetyReport)

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "creations": {
                        "goals": [
                            {"title": "Python Intermediate", "difficulty": "easy"}
                        ]
                    },
                    "updates": [
                        {
                            "id": 123,
                            "type": "goal",
                            "changes": {"difficulty": "medium"},
                            "progressive_path": {
                                "steps": [3, 4],
                                "estimated_weeks": [2, 3],
                            },
                        }
                    ],
                    "progressive_updates": [],
                    "analysis": "User needs structured path forward.",
                    "resources": [
                        {"title": "Intro to Python", "url": "https://example.com"}
                    ],
                    "safety_report": {},
                }
            ]
        }
    )