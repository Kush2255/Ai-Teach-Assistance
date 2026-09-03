import uuid
from typing import Dict, Any, Optional
from app.ai.llm_provider import llm_client
from app.ai.prompts import LESSON_PLANNER_PROMPT, SYSTEM_TEACHER_PROMPT
from app.ai.visual_planner import VisualPlanner
from app.schemas.schemas import LearnerProfileSchema

class LessonPlanner:
    """Generates structured, time-bounded lesson plans aligned with learner profile."""

    async def create_plan(
        self,
        topic: str,
        profile: LearnerProfileSchema,
        rag_context: Optional[str] = ""
    ) -> Dict[str, Any]:
        prompt = LESSON_PLANNER_PROMPT.format(
            topic=topic,
            context=rag_context or "General topic learning",
            level=profile.education_level,
            goal=profile.learning_goal,
            language=profile.preferred_language,
            style=profile.teaching_style,
            time=profile.available_time,
            depth=profile.desired_depth
        )

        plan_data = await llm_client.generate_json(prompt, SYSTEM_TEACHER_PROMPT)

        if "error" in plan_data or "sections" not in plan_data:
            # Fallback structure
            lesson_id = f"lesson_{uuid.uuid4().hex[:8]}"
            return {
                "id": lesson_id,
                "title": f"Mastering {topic}",
                "topic": topic,
                "objective": f"Understand the core principles and practical applications of {topic}.",
                "estimated_minutes": 20,
                "difficulty": profile.education_level.lower(),
                "language": profile.preferred_language,
                "sections": [
                    {
                        "id": f"sec_1_{uuid.uuid4().hex[:4]}",
                        "title": f"Introduction to {topic}",
                        "duration": 5,
                        "explanation": f"Welcome to our session on {topic}! We will start by building intuitive foundations before diving deeper.",
                        "concepts": [f"Basic {topic} Principles", "Core Terminology"],
                        "examples": ["Relatable everyday analogy"],
                        "visual_type": "graph",
                        "visual_data": VisualPlanner.generate_visual_payload(topic, "graph", "Basic Relationship"),
                        "question": f"In your own words, why is understanding {topic} important?",
                        "question_type": "conceptual",
                        "question_options": None,
                        "expected_answer": f"It explains how fundamental mechanisms work in {topic} systems."
                    },
                    {
                        "id": f"sec_2_{uuid.uuid4().hex[:4]}",
                        "title": f"Core Mechanics & Mathematical Formulation",
                        "duration": 8,
                        "explanation": "Now let's examine the exact relationship and equations governing this system.",
                        "concepts": ["Mathematical Formulation", "Quantitative Analysis"],
                        "examples": ["Calculated step-by-step problem"],
                        "visual_type": "equation",
                        "visual_data": VisualPlanner.generate_visual_payload(topic, "equation", "Mathematical Rule"),
                        "question": "What happens to output when input is doubled while constraints remain constant?",
                        "question_type": "problem_solving",
                        "question_options": None,
                        "expected_answer": "Output doubles due to direct proportionality."
                    }
                ]
            }

        # Enrich plan with visual payloads if missing
        lesson_id = f"lesson_{uuid.uuid4().hex[:8]}"
        plan_data["id"] = lesson_id
        plan_data["topic"] = topic
        plan_data["language"] = profile.preferred_language
        
        for idx, sec in enumerate(plan_data.get("sections", [])):
            if "id" not in sec:
                sec["id"] = f"sec_{idx+1}_{uuid.uuid4().hex[:4]}"
            vtype = sec.get("visual_type", "diagram")
            c_name = sec.get("concepts", [topic])[0] if sec.get("concepts") else topic
            if not sec.get("visual_data"):
                sec["visual_data"] = VisualPlanner.generate_visual_payload(topic, vtype, c_name)

        return plan_data

lesson_planner = LessonPlanner()
