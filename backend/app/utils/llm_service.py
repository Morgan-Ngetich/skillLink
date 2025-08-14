import httpx
import threading
from sqlmodel import Session
from typing import List, Dict, Any, Union, Optional, Literal
from app.models.users import (
    RoadmapVisibility,
    RoadmapStatus,
    CardStatus,
    CardPriority,
    SafetyReport,
    SafetyViolation,
    SafetyViolationType,
    ProgressiveUpdateProposal,
    Goal,
    GoalDifficulty,
    GoalType,
    User,
    LLMGenerationRequest,
    LLMGenerationResponse,
    LLMStructuredOutput,
    LLMTargetEntity,
)
from app.utils.validation import (
    validate_enum,
    validate_card,
    validate_goal,
    validate_roadmap,
    extract_json_from_markdown,
)
from app.utils.helper import calculate_goal_progress
from app.crud import get_user_skills
from app.api.deps import CurrentUser
import json
from enum import Enum
from app.core.config import settings
from app.utils.logger_config import llm_logger, app_logger
from fastapi import status, HTTPException
from datetime import datetime, timezone
from tenacity import retry, stop_after_attempt, wait_exponential
from functools import lru_cache
from app.core.llm_executor import get_llm_executor
# from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM, BitsAndBytesConfig
from groq import Groq


class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    META = "meta"
    HUGGINGFACE = "huggingface"
    # LOCAL = "local"
    GROQ="groq"
    MOCK = "mock"


class GroqGenerator:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model_name = "compound-beta"
        
    def generate_roadmap(self, goal_description: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> str:
        """Generate roadmap text given a goal description and timeframe."""
        sanitized_goal = self.sanitize_input(goal_description)
        if not sanitized_goal:
            raise ValueError("Goal description is empty after sanitization")

        prompt = self._build_prompt(sanitized_goal, start_date, end_date)
        
        try:
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=False,
                stop=None,
            )
            return completion.choices[0].message.content
            
        except Exception as e:
            llm_logger.error(f"Groq generation failed: {str(e)}")
            raise RuntimeError(f"Groq generation failed: {str(e)}")
            
    def _build_prompt(self, goal: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> str:
        timeframe_clause = ""
        if start_date and end_date:
            timeframe_clause = f" The roadmap should be completed between {start_date} and {end_date}."
        elif start_date:
            timeframe_clause = f" The roadmap should start on {start_date}."
        elif end_date:
            timeframe_clause = f" The roadmap should be completed by {end_date}."

        return (
            f"You are an API-only generator. Output ONLY valid JSON.\n"
            f"Create a roadmap with goals and cards for: \"{goal}\".{timeframe_clause}\n"
            f"Use this exact structure:\n\n"
            "{\n"
            "  \"creations\": {\n"
            "    \"roadmaps\": [\n" 
            "      {\n"
            "        \"title\": \"Roadmap Title\",\n"
            "        \"description\": \"Optional description\",\n"
            "        \"visibility\": \"private\",\n"
            "        \"status\": \"draft\",\n"
            "        \"tags\": [\"tag1\"],\n"
            "        \"start_date\": \"YYYY-MM-DD\",\n"
            "        \"target_date\": \"YYYY-MM-DD\"\n"
            "      }\n"
            "    ],\n"
            "    \"goals\": [\n"
            "      {\n"
            "        \"title\": \"Goal Title\",\n"
            "        \"description\": \"Goal description\",\n"
            "        \"type\": \"skill\",\n"
            "        \"difficulty\": \"easy\",\n"
            "        \"importance\": 3,\n"
            "        \"tags\": [\"tag1\"],\n"
            "        \"start_date\": \"YYYY-MM-DD\",\n"
            "        \"target_date\": \"YYYY-MM-DD\"\n"
            "      }\n"
            "    ],\n"
            "    \"boards\": [\n"
            "      {\n"
            "        \"title\": \"Board Title\",\n"
            "        \"description\": \"Board description\",\n"
            "        \"lists\": [\n"
            "          {\n"
            "            \"title\": \"Backlog\",\n"
            "            \"status\": \"backlog\",\n"
            "            \"cards\": [\n"
            "              {\n"
            "                \"title\": \"Card Title\",\n"
            "                \"description\": \"Optional card description\",\n"
            "                \"status\": \"backlog\",\n"
            "                \"priority\": \"medium\",\n"
            "                \"position\": 0,\n"
            "                \"tags\": [\"tag1\"],\n"
            "                \"due_date\": \"YYYY-MM-DD\",\n"
            "                \"estimated_duration\": 60\n"
            "              }\n"
            "            ]\n"
            "          },\n"
            "          {\n"
            "            \"title\": \"To Do\",\n"
            "            \"status\": \"todo\",\n"
            "            \"cards\": []\n"
            "          }\n"
            "        ]\n"
            "      }\n"
            "    ]\n"
            "  },\n"
            "  \"analysis\": \"Brief summary of the roadmap\",\n"
            "  \"progressive_updates\": [],\n"
            "  \"resources\": []\n"
            "}\n\n"
            "Key points:\n"
            "1. Each card must be placed in a list with matching status\n"
            "2. Lists should have standard statuses: backlog, todo, in_progress, done, blocked\n"
            "3. Card status must match the list status it's placed in\n"
            "Do not explain anything. Return only JSON."
        )
            
    def sanitize_input(self, text: str) -> str:
        return text.replace("\n", " ").strip()[:500] if text else ""

class GroqExecutor:
    def __init__(self):
        self.generator = GroqGenerator()
        self.lock = threading.Lock()
        
    def get_generator(self) -> GroqGenerator:
        with self.lock:
            return self.generator

groq_executor = GroqExecutor()
                

def build_goal_context(
    session: Session, current_user: CurrentUser, goal: Optional[Goal] = None
) -> dict:
    """Build context dictionary for LLM generation

    * Args:
        session: Database session
        curren_user: The authenticated user
        goal: Optional specific goal to include in context

    * Returns:
        Dictionary containing:
        - User skills and preferences
        - Current goals (excluding archived)
        - Progess statistics
        - Goal-specific context (if provided)
        - System timestamp
    """

    try:
        base_context = {
            "user": {
                "skills": get_user_skills(session, current_user.id),
            },
            "current_goals": [
                {
                    "id": g.id,
                    "title": g.title,
                    "difficulty": g.difficulty,
                    "progress": calculate_goal_progress(g),
                }
                for g in current_user.goals  # Optionally: add `if not g.is_archived`
            ],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        if goal:
            base_context["focus_goal"] = {
                "id": goal.id,
                "title": goal.title,
                "description": goal.description,
                "difficulty": goal.difficulty,
                "type": goal.type,
                "tags": goal.tags,
                "target_date": goal.target_date.isoformat() if goal.target_date else None,
            }

        return base_context

    except Exception as e:
        app_logger.error("Context build failed", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not generate context",
        )

def check_goal_update_safety(
    session: Session, update: dict, user: User
) -> SafetyReport:
    """Validate proposed goal updates against safety rules"""
    report = SafetyReport()
    goal = session.get(Goal, update.get("id"))

    if not goal:
        report.violations.append(
            SafetyViolation(
                type=SafetyViolationType.CONFLICT,
                severity="blocker",
                message="Goal not found",
            )
        )
        return report

    if "difficulty" in update.get("changes", {}):
        current_diff = GoalDifficulty(goal.difficulty)
        try:
            new_diff = GoalDifficulty(update["changes"]["difficulty"])
        except ValueError:
            report.violations.append(
                SafetyViolation(
                    type=SafetyViolationType.DIFFICULTY,
                    severity="blocker",
                    message="Invalid difficulty level",
                )
            )
            return report

        # Get difficulty levels as list for easier comparison
        difficulty_levels = list(GoalDifficulty)
        current_idx = difficulty_levels.index(current_diff)
        new_idx = difficulty_levels.index(new_diff)
        delta = new_idx - current_idx

        if delta > settings.MAX_DIFFICULTY_JUMP:
            report.violations.append(
                SafetyViolation(
                    type=SafetyViolationType.DIFFICULTY,
                    severity="blocker",
                    message=f"Cannot jump from L{current_diff.value} to L{new_diff.value}",
                )
            )
        elif delta > 1:
            report.violations.append(
                SafetyViolation(
                    type=SafetyViolationType.DIFFICULTY,
                    severity="review",
                    message="Consider progressive steps",
                    suggested_action={
                        "intermediate_step": difficulty_levels[current_idx + 1].value,
                        "final_goal": new_diff.value,
                    },
                )
            )

        report.passes = not any(v.severity == "blocker" for v in report.violations)
        report.requires_human_review = any(
            v.severity == "review" for v in report.violations
        )
        return report


def suggest_progressive_steps(
    session: Session, update: dict, user: User
) -> List[ProgressiveUpdateProposal]:
    """Generate intermediate steps for ambitious updates"""
    goal: Goal = session.get(Goal, update.get("id"))
    if not goal or "difficulty" not in update.get("changes", {}):
        return []

    try:
        current_level = GoalDifficulty(goal.difficulty)
        target_level = GoalDifficulty(update["changes"]["difficulty"])
    except ValueError:
        return []

    difficulty_levels = list(GoalDifficulty)
    current_idx = difficulty_levels.index(current_level)
    target_idx = difficulty_levels.index(target_level)

    proposals = []

    if target_idx > current_idx + 1:
        for step_idx in range(current_idx + 1, target_idx):
            step_difficulty = difficulty_levels[step_idx]
            proposals.append(
                ProgressiveUpdateProposal(
                    intermediate_step={
                        "title": f"{goal.title} ({step_difficulty.value})",
                        "difficulty": step_difficulty.value,
                        "type": goal.type,
                        "parent_goal_id": goal.id,
                    },
                    final_goal={"id": goal.id, "difficulty": target_level.value},
                    confirmation_required=step_idx != (target_idx - 1),
                )
            )

    return proposals


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
def call_llm_service(llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """
    Unified LLM service caller with retry logic and error handling

    Args:
        llm_request: Contains all parameters for LLM generation

    Returns:
        LLMGenerationResponse: Structured response from LLM

    Raises:
        HTTPException: If LLM service fails
    """
        
    try:
        return get_llm_executor().run(_call_llm_service_async(llm_request))
    except Exception as e:
        llm_logger.error("LLM request failed", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"LLM service unavailable: {str(e)}"
        )

async def _call_llm_service_async(llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """Internal async implementation"""   
    # Update the provider_map in call_llm_service()
    provider_map = {
        "gpt-3.5-turbo": LLMProvider.OPENAI,
        "gpt-4": LLMProvider.OPENAI,
        "claude-2": LLMProvider.ANTHROPIC,
        "falcon-7b": LLMProvider.HUGGINGFACE,
        "falcon-7b-instruct": LLMProvider.HUGGINGFACE,
        "compound-beta": LLMProvider.GROQ
    }
    
    provider = provider_map.get(llm_request.model, LLMProvider.MOCK)


    llm_logger.info(
        "LLM request started",
        extra={"model": llm_request.model, "action": llm_request.action.value},
    )

    if provider == LLMProvider.OPENAI:
        response = await _call_openai(llm_request)
    elif provider == LLMProvider.ANTHROPIC:
        response = await _call_anthropic(llm_request)
    elif provider == LLMProvider.HUGGINGFACE:
        response = await _call_huggingface(llm_request)
    elif provider == LLMProvider.GROQ:
        response = await _call_groq(llm_request)
    else:
        response = _call_mock_service(llm_request)

    llm_logger.info(
        "LLM request completed",
        extra={"model": llm_request.model, "request_id": response.request_id},
    )
    return response


async def _call_openai(llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """Handle OpenAI API calls"""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    response = await client.chat.completions.create(
        model=llm_request.model,
        temperature=llm_request.temperature,
        messages=[
            {"role": "system", "content": _build_system_prompt(llm_request)},
            {"role": "user", "content": llm_request.prompt},
        ],
        response_format={"type": "json_object"}
        if llm_request.format == "structured"
        else None,
        timeout=settings.LLM_TIMEOUT,
    )

    return _format_openai_response(response, llm_request)


async def _call_anthropic(llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """Handle Anthropic API calls"""
    import anthropic

    client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    message = await client.messages.create(
        model=llm_request.model,
        max_tokens=1024,
        temperature=llm_request.temperature,
        system=_build_system_prompt(llm_request),
        messages=[{"role": "user", "content": llm_request.prompt}],
    )

    return _format_anthropic_response(message, llm_request)


# async def _call_llama2(llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
#     """Handle Llama-2 API calls with comprehensive error handling and logging

#     Args:
#         llm_request: Validated LLM generation request

#     Returns:
#         Formatted LLM response matching your schema

#     Raises:
#         HTTPException: If the API call fails after retries
#     """
#     import replicate
#     from tenacity import RetryError
#     import asyncio
#     from datetime import time

#     # Log the start of the request with model details
#     llm_logger.info(
#         "Starting Llama-2 API call",
#         extra={
#             "model": llm_request.model,
#             "temperature": llm_request.temperature,
#             "format": llm_request.format,
#             "target_entities": [t.value for t in llm_request.target_entities],
#         },
#     )

#     try:
#         start_time = time.time()

#         # Execute the API call with timeout
#         output = await asyncio.wait_for(
#             replicate.async_run(
#                 f"meta/{llm_request.model}",
#                 input={
#                     "prompt": _build_llama2_prompt(llm_request),
#                     "temperature": min(
#                         max(llm_request.temperature, 0.1), 1.0
#                     ),  # Clamped
#                     "max_new_tokens": min(
#                         llm_request.max_tokens or 1024, 2048
#                     ),  # Limited
#                     "top_p": 0.9,  # Recommended default
#                     "json_mode": llm_request.format == "structured",
#                     "stop_sequences": ["</s>"]
#                     if llm_request.format == "structured"
#                     else None,
#                 },
#             ),
#             timeout=settings.LLAMA2_TIMEOUT,  # e.g., 30 seconds
#         )

#         # Log successful call
#         llm_logger.info(
#             "Llama-2 API call succeeded",
#             extra={
#                 "duration": f"{time.time() - start_time:.2f}s",
#                 "model": llm_request.model,
#                 "output_sample": str(output)[:200],  # Log first part of output
#             },
#         )

#         return _format_llama2_response(output, llm_request)

#     except asyncio.TimeoutError:
#         llm_logger.error(
#             "Llama-2 API timeout",
#             extra={"model": llm_request.model, "timeout": settings.LLAMA2_TIMEOUT},
#         )
#         raise HTTPException(
#             status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="Llama-2 API timeout"
#         )

#     except replicate.exceptions.ModelError as e:
#         llm_logger.error(
#             "Llama-2 model error", exc_info=e, extra={"model": llm_request.model}
#         )
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=f"Invalid model parameters: {str(e)}",
#         )

#     except replicate.exceptions.ReplicateError as e:
#         llm_logger.error(
#             "Replicate API error", exc_info=e, extra={"model": llm_request.model}
#         )
#         raise HTTPException(
#             status_code=status.HTTP_502_BAD_GATEWAY, detail="Replicate service error"
#         )

#     except Exception as e:
#         llm_logger.error(
#             "Unexpected Llama-2 API error",
#             exc_info=e,
#             extra={"model": llm_request.model},
#         )
#         raise HTTPException(
#             status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
#             detail="Llama-2 service currently unavailable",
#         )

async def _call_huggingface(llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """Call Llama 2 via Hugging Face Inference API"""
    try:
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "inputs": _build_falcon_prompt(llm_request),
            "parameters": {
                "max_new_tokens": llm_request.max_tokens or 1024,
                "temperature": max(0.1, min(llm_request.temperature, 1.0)),
                "top_p": max(0.0, min(llm_request.top_p, 1.0)),
                "frequency_penalty": max(0.0, min(llm_request.frequency_penalty, 2.0)),
                "presence_penalty": max(0.0, min(llm_request.presence_penalty, 2.0)),
                "return_full_text": False,
                "do_sample": True
            }
        }
        
        async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT) as client:
            response = await client.post(
                # f"https://api-inference.huggingface.co/models/{settings.HUGGINGFACE_LLAMA_MODEL}",
                "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
                headers=headers,
                json=payload
            )
            
        if response.status_code != 200:
            error_msg = f"Hugging Face API error ({response.status_code}): {response.text}"
            llm_logger.error(error_msg)
            raise HTTPException(status_code=response.status_code, detail=error_msg)
        
                # HF API returns a list of dicts - we take the first one
        response_data = response.json()[0] if isinstance(response.json(), list) else response.json()

        return _format_falcon_response(response_data.get("generated_text", ""), llm_request)
     
     
    except httpx.TimeoutException:
        llm_logger.error("Hugging Face API timeout")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Hugging Face API timeout"
        )
    except Exception as e:
        llm_logger.error("Hugging Face API call failed", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hugging Face service unavailable"
        )

async def _call_groq(llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """Handle Groq API calls"""
    try:
        # Get timeframe from context if available
        timeframe = llm_request.context.get("timeframe", {}) if llm_request.context else {}
        start_date = timeframe.get("start_date")
        end_date = timeframe.get("end_date")

        # Generate the content
        generator = groq_executor.get_generator()
        generated_text = generator.generate_roadmap(
            llm_request.prompt,
            start_date=start_date,
            end_date=end_date
        )
        
        # Parse and format the output to match the existing schema
        parsed_output = _parse_llm_output(generated_text, llm_request.format)

        # Ensure we have the required target entities
        if isinstance(parsed_output, LLMStructuredOutput):
            if hasattr(llm_request, "target_entities"):
                if parsed_output.creations is None:
                    parsed_output.creations = {}
                for entity in llm_request.target_entities:
                    if entity.value not in parsed_output.creations:
                        parsed_output.creations[entity.value] = []
        
        return LLMGenerationResponse(
            request_id=f"groq_{hash(generated_text)}",
            action=llm_request.action,
            output=parsed_output,
            model_metadata={
                "model": llm_request.model,
                "provider": "groq",
                "engine": groq_executor.generator.model_name
            }
        )
    except Exception as e:
        llm_logger.error("Groq generation failed", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Groq generation failed: {str(e)}"
        )
       

def _call_mock_service(llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """Mock service for testing that mimics real LLM behavior

    Args:
        llm_request: The generation request with all parameters

    Returns:
        LLMGenerationResponse: Structured mock response matching your schema
    """
    from faker import Faker
    from random import choice, randint
    from datetime import datetime, timedelta
    from copy import deepcopy

    fake = Faker()
    request_id = f"mock_{fake.uuid4()}"

    # Base response structure
    response_data = {
        "request_id": request_id,
        "action": llm_request.action.value,
        "output": {
            "creations": {},
            "updates": [],
            "progressive_updates": [],
            "analysis": "Mock analysis response",
            "resources": [
                {"title": f"Resource about {fake.word()}", "url": fake.url()}
            ],
            "safety_report": {
                "violations": [],
                "passes": True,
                "requires_human_review": False,
            },
        },
        "model_metadata": {
            "model": llm_request.model,
            "provider": "mock",
            "mock_timestamp": datetime.utcnow().isoformat(),
            "request_parameters": llm_request.model_dump(),
        },
        "safety_check": {
            "violations": [],
            "passes": True,
            "requires_human_review": False,
        },
    }

    # Generate mock creations based on requested target entities
    if llm_request.target_entities:
        creations = {}

        if LLMTargetEntity.GOALS in llm_request.target_entities:
            creations["goals"] = [
                {
                    "title": f"Learn {fake.job()}",
                    "description": fake.sentence(),
                    "type": choice(list(GoalType)).value,
                    "difficulty": choice(list(GoalDifficulty)).value,
                    "importance": randint(1, 5),
                    "tags": [fake.word() for _ in range(randint(0, 3))],
                    "start_date": (datetime.now() + timedelta(days=1)).isoformat(),
                    "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                }
            ]

        if LLMTargetEntity.ROADMAPS in llm_request.target_entities:
            creations["roadmaps"] = [
                {
                    "title": f"Roadmap for {fake.job()} mastery",
                    "description": fake.paragraph(),
                    "visibility": choice(list(RoadmapVisibility)).value,
                    "status": choice(list(RoadmapStatus)).value,
                    "tags": [fake.word() for _ in range(randint(0, 5))],
                }
            ]

        if LLMTargetEntity.CARDS in llm_request.target_entities:
            creations["cards"] = [
                {
                    "title": f"Task: {fake.bs()}",
                    "description": fake.sentence(),
                    "status": choice(list(CardStatus)).value,
                    "priority": choice(list(CardPriority)).value,
                    "due_date": (
                        datetime.now() + timedelta(days=randint(1, 14))
                    ).isoformat(),
                }
                for _ in range(randint(1, 3))
            ]

        response_data["output"]["creations"] = creations

    # Validate against your response model
    try:
        return LLMGenerationResponse.model_validate(response_data)
    except Exception as e:
        # Fallback to minimal valid response if validation fails
        return LLMGenerationResponse(
            request_id=request_id,
            action=llm_request.action.value,
            output=LLMStructuredOutput(
                analysis="Mock response validation failed",
                safety_report=SafetyReport(
                    violations=[
                        SafetyViolation(
                            type=SafetyViolationType.SYSTEM,
                            message=str(e),
                            severity="warning",
                        )
                    ]
                ),
            ),
            model_metadata={"model": "mock", "error": str(e)},
        )

# @lru_cache(maxsize=100)
def _build_system_prompt(llm_request: LLMGenerationRequest) -> str:
    """Build standardized system prompt for goal/roadmap/card generation"""
    base_prompt = f"""
    You are a goal planning assistant. Follow these rules:
    1. Action: {llm_request.action.value}
    2. Context: {json.dumps(llm_request.context, indent=2)}
    3. Constraints: {json.dumps(llm_request.update_constraints, indent=2)}
    4. Response Format: {llm_request.format}
    5. User Intent: {llm_request.user_intent or "general"}
    """

    # Add generation targets if specified
    if hasattr(llm_request, "target_entities"):
        generation_instructions = "\n6. Generate these entities:"

        if LLMTargetEntity.GOALS in llm_request.target_entities:
            generation_instructions += """
            - MAIN GOAL (required):
              * title: Clear, specific title
              * difficulty: very_easy/easy/medium/hard/very_hard  
              * description: 1-2 sentences
              * type: skill/project/career/personal"""

        if LLMTargetEntity.ROADMAPS in llm_request.target_entities:
            generation_instructions += """
            - ROADMAP (if requested):
              * title: Descriptive name
              * timeline: Phases with durations
              * connected_goals: List of goal IDs or titles"""

        if LLMTargetEntity.CARDS in llm_request.target_entities:
            generation_instructions += """
            - CARDS (if requested):
              * title: Actionable task name
              * status: todo/in_progress/done
              * due_date: YYYY-MM-DD (optional)"""

        base_prompt += generation_instructions

    # Add output structure requirement
    base_prompt += """
    
    OUTPUT STRUCTURE:
    {
      "creations": {
        "goals": [...],
        "roadmaps": [...],
        "cards": [...]
      },
      "updates": [...],
      "analysis": "..." 
    }"""

    return base_prompt.strip()


def _build_falcon_prompt(llm_request: LLMGenerationRequest) -> str:
    """Format optimized prompt for Falcon-7b-instruct"""
    system_prompt = _build_system_prompt(llm_request)
    
    return f"""The following is a conversation between a user and an AI assistant.
    The assistant is designed to help with goal planning and task management.

    System Instructions:
    {system_prompt}

    User: {llm_request.prompt}
    Assistant:"""


def _format_openai_response(response, llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """Format OpenAI response with comprehensive validation"""
    try:
        # Validate basic response structure
        if not response.choices or not response.choices[0].message.content:
            raise ValueError("Empty OpenAI response content")
            
        content = response.choices[0].message.content
        output = _parse_llm_output(content, llm_request.format)
        
        # Validate and normalize enum values in creations
        if isinstance(output, LLMStructuredOutput) and output.creations:
            for entity_type, entities in output.creations.items():
                for entity in entities:
                    if "difficulty" in entity:
                        entity["difficulty"] = validate_enum(
                            entity["difficulty"],
                            GoalDifficulty,
                            default=GoalDifficulty.EASY
                        )
                    if "type" in entity and entity_type == "goals":
                        entity["type"] = validate_enum(
                            entity["type"],
                            GoalType,
                            default=GoalType.SKILL
                        )
        
        return LLMGenerationResponse(
            request_id=response.id,
            action=llm_request.action.value,
            output=output,
            model_metadata={
                "model": response.model,
                "usage": dict(response.usage),
                "provider": "openai",
                "response_time": getattr(response, "response_ms", None),
            }
        )
        
    except Exception as e:
        llm_logger.error(
            "Failed to format OpenAI response",
            exc_info=e,
            extra={
                "request_id": getattr(response, 'id', None),
                "model": getattr(response, 'model', None)
            }
        )
        raise ValueError(f"OpenAI response formatting failed: {str(e)}") from e


def _format_anthropic_response(message, llm_request: LLMGenerationRequest) -> LLMGenerationResponse:
    """Format Anthropic response with complete validation"""
    try:
        # Validate basic response structure
        if not message.content:
            raise ValueError("Empty Anthropic response content")
            
        content = "".join(block.text for block in message.content)
        output = _parse_llm_output(content, llm_request.format)
        
        return LLMGenerationResponse(
            request_id=message.id,
            action=llm_request.action.value,
            output=output,
            model_metadata={
                "model": message.model,
                "usage": {
                    "input_tokens": message.usage.input_tokens,
                    "output_tokens": message.usage.output_tokens,
                },
                "provider": "anthropic",
                "stop_reason": getattr(message, "stop_reason", None),
            }
        )
        
    except Exception as e:
        llm_logger.error(
            "Failed to format Anthropic response",
            exc_info=e,
            extra={
                "request_id": getattr(message, 'id', None),
                "model": getattr(message, 'model', None)
            }
        )
        raise ValueError(f"Anthropic response formatting failed: {str(e)}") from e


def _format_falcon_response(
    output: Any, 
    llm_request: LLMGenerationRequest
) -> LLMGenerationResponse:
    """Process and validate Falcon-7b output with comprehensive error handling."""
    try:
        # Handle both single string and list/tuple outputs
        full_response = (
            "".join(output) if isinstance(output, (list, tuple)) else str(output)
        ).strip()
        
        request_id = f"falcon_{hash(full_response)}"

        # Parse and validate the output
        parsed_output = _parse_llm_output(full_response, llm_request.format)

        # Validate requested entities were generated
        if isinstance(parsed_output, LLMStructuredOutput):
            if hasattr(llm_request, "target_entities"):
                missing_entities = [
                    t.value
                    for t in llm_request.target_entities
                    if not parsed_output.creations.get(t.value)
                ]

                if missing_entities:
                    llm_logger.warning(
                        "Missing target entities in Falcon response",
                        extra={"missing": missing_entities, "request_id": request_id},
                    )
                    if not parsed_output.analysis:
                        parsed_output.analysis = ""
                    parsed_output.analysis += f"\nWARNING: Missing expected entities: {', '.join(missing_entities)}"

            # Ensure creations match the schema
            if parsed_output.creations:
                validated_creations = {}
                for entity_type, items in parsed_output.creations.items():
                    try:
                        if entity_type == "goals":
                            validated_creations[entity_type] = [
                                validate_goal(g) for g in items
                            ]
                        elif entity_type == "roadmaps":
                            validated_creations[entity_type] = [
                                validate_roadmap(r) for r in items
                            ]
                        elif entity_type == "cards":
                            validated_creations[entity_type] = [
                                validate_card(c) for c in items
                            ]
                    except Exception as e:
                        llm_logger.warning(
                            f"Failed to validate {entity_type}",
                            exc_info=e,
                            extra={"request_id": request_id},
                        )
                        continue

                parsed_output.creations = validated_creations

        return LLMGenerationResponse(
            request_id=request_id,
            action=llm_request.action,
            output=parsed_output,
            model_metadata={
                "model": llm_request.model,
                "provider": "huggingface",
                "engine": "falcon-7b",
                "tokens_used": len(full_response.split()),  # Approximate
            },
        )

    except json.JSONDecodeError as e:
        llm_logger.error(
            "Failed to parse Falcon JSON output",
            exc_info=e,
            extra={"response_sample": str(output)[:200], "request_id": request_id},
        )
        return LLMGenerationResponse(
            request_id=request_id,
            action=llm_request.action,
            output=LLMStructuredOutput(
                analysis=full_response,
                safety_report=SafetyReport(
                    violations=[
                        SafetyViolation(
                            type=SafetyViolationType.SYSTEM,
                            message="JSON parsing failed",
                            severity="blocker",
                        )
                    ]
                ),
            ),
            model_metadata={
                "model": llm_request.model,
                "provider": "huggingface",
                "error": "JSON decode error",
                "raw_response": str(output)[:500],
            },
        )
    except Exception as e:
        llm_logger.error(
            "Unexpected error formatting Falcon response",
            exc_info=e,
            extra={"request_id": request_id},
        )
        raise ValueError(f"Failed to format Falcon response: {str(e)}") from e


def _parse_llm_output(
    content: str, 
    format: str,
    llm_request: Optional[LLMGenerationRequest] = None
) -> Union[LLMStructuredOutput, str]:
    """Parse and validate LLM output with comprehensive safety checking"""
    if format != "structured":
        return content.strip()

    try:
        # Initial parse attempt
        try:
            data = json.loads(content)
        except json.JSONDecodeError as je:
            # Fallback to markdown extraction
            llm_logger.debug(
                f"Initial JSON parse failed, trying markdown extraction: {str(je)}"
            )

            if (data := extract_json_from_markdown(content)) is None:
                llm_logger.warning(
                    "Returning raw content after JSON parse failure",
                    extra={"content_sample": content[:200]},
                )
                return LLMStructuredOutput(
                    analysis=content.strip(),
                    safety_report=SafetyReport(
                        violations=[
                            SafetyViolation(
                                type=SafetyViolationType.SYSTEM,
                                message="JSON parse failure",
                                severity="blocker",
                                entity_type=[LLMTargetEntity.SYSTEM],
                            )
                        ],
                        passes=False,
                        requires_human_review=True
                    ),
                )

        output = LLMStructuredOutput(**data)
        violations = []

        if output.creations:
            processed_creations = {}
            all_dates = []
            all_entities = []
            
            # Process boards first to extract cards from lists
            if "boards" in output.creations:
                processed_creations["boards"] = []
                processed_creations["cards"] = []  # Initialize cards collection
                
                for board_data in output.creations["boards"]:
                    try:
                        # Convert to dict if needed
                        if hasattr(board_data, "model_dump"):
                            board_data = board_data.model_dump()
                        
                        # Basic validation
                        if not isinstance(board_data, dict):
                            raise ValueError("Board data must be a dictionary")
                            
                        # Required fields check
                        required_fields = ["title", "description"]
                        for field in required_fields:
                            if field not in board_data:
                                raise ValueError(f"Board missing required field: {field}")
                        
                        # Type validation
                        if not isinstance(board_data.get("title"), str):
                            raise ValueError("Board title must be a string")
                            
                        # Add default values if needed
                        board_data.setdefault("visibility", "private")
                        board_data.setdefault("status", "active")
                        
                        # Process lists and their cards
                        if "lists" in board_data:
                            for list_data in board_data["lists"]:
                                if "cards" in list_data:
                                    for card_data in list_data["cards"]:
                                        try:
                                            # Ensure card status matches list status
                                            if "status" in list_data:
                                                card_data["status"] = list_data["status"]
                                            
                                            validated = validate_card(card_data)
                                            
                                            # Track due dates
                                            if validated.get("due_date"):
                                                all_dates.append(validated["due_date"])
                                            
                                            processed_creations["cards"].append(validated)
                                            all_entities.append((
                                                validated.get("id"),
                                                LLMTargetEntity.CARDS,
                                                validated.get("title")
                                            ))
                                        except Exception as e:
                                            violations.append(
                                                SafetyViolation(
                                                    type=SafetyViolationType.SYSTEM,
                                                    message=str(e),
                                                    severity="blocker",
                                                    entity_type=[LLMTargetEntity.CARDS],
                                                    affected_entities=[card_data.get("id") or 0],
                                                    suggested_action={
                                                        "fix_type": "content_review",
                                                        "original_data": card_data
                                                    }
                                                )
                                            )
                        
                        processed_creations["boards"].append(board_data)
                        all_entities.append((
                            board_data.get("id"),
                            LLMTargetEntity.BOARDS,
                            board_data.get("title", "Untitled Board")
                        ))
                        
                    except ValueError as e:
                        violations.append(
                            SafetyViolation(
                                type=SafetyViolationType.SYSTEM,
                                message=str(e),
                                severity="blocker",
                                entity_type=[LLMTargetEntity.BOARDS],
                                affected_entities=[board_data.get("id") or 0],
                                suggested_action={
                                    "fix_type": "content_review",
                                    "original_data": board_data
                                }
                            )
                        )

            # Process goals with validation
            if "goals" in output.creations:
                processed_creations["goals"] = []
                for goal_data in output.creations["goals"]:
                    try:
                        # Ensure we're working with a dictionary
                        if hasattr(goal_data, 'model_dump'):
                            goal_data = goal_data.model_dump()
                            
                        validated = validate_goal(goal_data)
                        
                        # Validate required fields
                        if not validated.get("title"):
                            raise ValueError("Goal missing title")
                            
                        # Date validation
                        start_date = validated.get("start_date")
                        target_date = validated.get("target_date")
                        if start_date and target_date and start_date > target_date:
                            raise ValueError(f"Goal '{validated.get('title')}': Dates invalid")
                        
                        if start_date and target_date:
                            all_dates.extend([start_date, target_date])
                            
                        processed_creations["goals"].append(validated)
                        all_entities.append((
                            validated.get("id"),
                            LLMTargetEntity.GOALS,
                            validated.get("title")
                        ))
                    except ValueError as e:
                        violation_type = (
                            SafetyViolationType.TIMING if "date" in str(e).lower()
                            else SafetyViolationType.SYSTEM
                        )
                        violations.append(
                            SafetyViolation(
                                type=violation_type,
                                message=str(e),
                                severity="blocker",
                                entity_type=[LLMTargetEntity.GOALS],
                                affected_entities=[goal_data.get("id") or 0],
                                suggested_action={
                                    "fix_type": "date_adjustment" if violation_type == SafetyViolationType.TIMING else "content_review",
                                    "original_data": goal_data
                                }
                            )
                        )

            # Process roadmaps with validation
            if "roadmaps" in output.creations:
                processed_creations["roadmaps"] = []
                for roadmap_data in output.creations["roadmaps"]:
                    try:
                        # Ensure we're working with a dictionary
                        if hasattr(roadmap_data, 'model_dump'):
                            roadmap_data = roadmap_data.model_dump()
                            
                        validated = validate_roadmap(roadmap_data)
                        
                        # Validate required fields
                        if not validated.get("title"):
                            raise ValueError("Roadmap missing title")
                            
                        # Set default status if not provided
                        if not validated.get("status"):
                            validated["status"] = RoadmapStatus.DRAFT.value
                            
                        # Validate dates
                        start_date = validated.get("start_date")
                        target_date = validated.get("target_date")
                        if start_date and target_date and start_date > target_date:
                            raise ValueError("Roadmap start date cannot be after target date")
                        
                        if start_date and target_date:
                            all_dates.extend([start_date, target_date])
                            
                        processed_creations["roadmaps"].append(validated)
                        all_entities.append((
                            validated.get("id"),
                            LLMTargetEntity.ROADMAPS,
                            validated.get("title", "Untitled Roadmap")
                        ))
                    except ValueError as e:
                        violation_type = (
                            SafetyViolationType.TIMING if "date" in str(e).lower()
                            else SafetyViolationType.SYSTEM
                        )
                        violations.append(
                            SafetyViolation(
                                type=violation_type,
                                message=str(e),
                                severity="blocker",
                                entity_type=[LLMTargetEntity.ROADMAPS],
                                affected_entities=[roadmap_data.get("id") or 0],
                                suggested_action={
                                    "fix_type": "date_adjustment" if violation_type == SafetyViolationType.TIMING else "content_review",
                                    "original_data": roadmap_data
                                }
                            )
                        )

            output.creations = processed_creations

            #TODO [Rest of the existing timeframe validation and conflict detection code...]

        return output

    except Exception as e:
        llm_logger.error("Structured output validation failed", exc_info=e)
        return LLMStructuredOutput(
            analysis=content.strip(),
            safety_report=SafetyReport(
                violations=[
                    SafetyViolation(
                        type=SafetyViolationType.SYSTEM,
                        message=f"Output validation failed: {str(e)}",
                        severity="blocker",
                        entity_type=[LLMTargetEntity.GOALS, LLMTargetEntity.CARDS, LLMTargetEntity.ROADMAPS]
                    )
                ],
                passes=False,
                requires_human_review=True
            ),
        )