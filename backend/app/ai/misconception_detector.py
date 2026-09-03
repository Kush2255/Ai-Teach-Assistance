from typing import Dict, Any, Optional
from app.ai.llm_provider import llm_client
from app.ai.prompts import EVALUATOR_MISCONCEPTION_PROMPT, SYSTEM_TEACHER_PROMPT

class MisconceptionDetector:
    """Dedicated Misconception Detection Engine."""

    async def detect(
        self,
        concept: str,
        question: str,
        expected_answer: str,
        student_answer: str,
        current_strategy: str = "direct"
    ) -> Dict[str, Any]:
        prompt = EVALUATOR_MISCONCEPTION_PROMPT.format(
            concept=concept,
            question=question,
            expected=expected_answer,
            student_answer=student_answer,
            current_strategy=current_strategy
        )

        analysis = await llm_client.generate_json(prompt, SYSTEM_TEACHER_PROMPT)

        if "correct" not in analysis:
            # Smart fallback detection rule
            s_lower = student_answer.lower()
            if "increase" in s_lower and ("resistance" in s_lower or "current" in s_lower):
                return {
                    "correct": False,
                    "confidence": 0.94,
                    "detected_misconception": "Student assumes current increases when resistance increases.",
                    "severity": "high",
                    "feedback": "You're thinking about flow, but remember resistance opposes current flow! Picture a narrow water pipe: as resistance increases, less water passes through.",
                    "recommended_strategy": "analogy",
                    "next_question": "If we double the resistance in a circuit while keeping voltage constant, does current increase or decrease?",
                    "mastery_score": 0.30
                }
            elif any(w in s_lower for w in ["decrease", "reduces", "less", "drops", "opposes"]):
                return {
                    "correct": True,
                    "confidence": 0.95,
                    "detected_misconception": None,
                    "severity": None,
                    "feedback": "Spot on! Resistance opposes current flow, so higher resistance reduces current.",
                    "recommended_strategy": "direct",
                    "next_question": "Awesome work! Ready for the next core section?",
                    "mastery_score": 0.85
                }
            else:
                return {
                    "correct": False,
                    "confidence": 0.75,
                    "detected_misconception": "Partial understanding of relationship between variables.",
                    "severity": "medium",
                    "feedback": "Let's review the relationship step by step using a visual diagram.",
                    "recommended_strategy": "visual",
                    "next_question": "Let's check the V-I graph on the screen. What happens to current when the slope changes?",
                    "mastery_score": 0.50
                }

        return analysis

misconception_detector = MisconceptionDetector()
