from sqlmodel import Field
from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any, Union

from app.models.enums import LLMActionType, TaskStatusEnum
from app.models.llm import LLMStructuredOutput, SafetyReport


class LLMGenerationResponse(BaseModel):
    """Public LLM generation response"""
    request_id: str
    action: LLMActionType
    output: Union[LLMStructuredOutput, str]
    model_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="LLM provider-specific metadata like tokens used, processing time, etc.",
    )
    safety_check: SafetyReport = Field(default_factory=SafetyReport)
    user_options: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Presented when confirmation required",
    )
    
    def to_public(self) -> Dict[str, Any]:
        """Convert to dict for API response"""
        return {
            "request_id": self.request_id,
            "action": self.action,
            "output": self.output,
            "user_options": self.user_options,
        }
    
    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "request_id": "abc-123",
                    "action": "create",
                    "output": {
                        "creations": {
                            "goals": [
                                {"title": "Python Intermediate", "difficulty": "easy"}
                            ]
                        },
                        "updates": [],
                        "progressive_updates": [],
                        "analysis": "Recommended next steps...",
                        "resources": [],
                        "safety_report": {},
                    },
                    "model_metadata": {
                        "model": "gpt-3.5-turbo",
                        "tokens_used": 1245,
                        "processing_time": 2.34,
                        "cost_estimate": 0.024,
                    },
                    "safety_check": {},
                    "user_options": {
                        "options": [
                            {
                                "label": "Take intermediate step",
                                "action": "accept_step",
                            },
                            {"label": "Proceed directly", "action": "override"},
                        ]
                    },
                }
            ]
        }
    )


class TaskStatus(BaseModel):
    """Task status for async LLM operations"""
    task_id: str
    status: TaskStatusEnum
    message: Optional[str] = None
    result: Optional[LLMGenerationResponse] = None