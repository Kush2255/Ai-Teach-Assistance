from typing import Dict, Any
from app.ai.misconception_detector import misconception_detector

class Evaluator:
    """Evaluates student answers and calculates concept mastery score."""

    async def evaluate_answer(
        self,
        concept: str,
        question: str,
        expected_answer: str,
        student_answer: str,
        current_strategy: str = "direct"
    ) -> Dict[str, Any]:
        result = await misconception_detector.detect(
            concept=concept,
            question=question,
            expected_answer=expected_answer,
            student_answer=student_answer,
            current_strategy=current_strategy
        )

        # Dynamic mastery update
        if result["correct"]:
            result["mastery_score"] = min(1.0, result.get("mastery_score", 0.75) + 0.15)
        else:
            result["mastery_score"] = max(0.1, result.get("mastery_score", 0.40) - 0.15)

        return result

evaluator = Evaluator()
