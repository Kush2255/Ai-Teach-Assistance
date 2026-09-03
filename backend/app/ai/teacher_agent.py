from typing import Dict, Any, List, Optional
from app.ai.evaluator import evaluator
from app.ai.llm_provider import llm_client

class TeacherAgent:
    """Stateful AI Teacher Agent orchestrating the teaching loop."""

    def __init__(self):
        self.state = {
            "current_lesson_id": None,
            "current_section_index": 0,
            "concepts_covered": [],
            "concepts_understood": [],
            "concepts_struggling": [],
            "misconceptions": [],
            "current_strategy": "direct",
            "difficulty": "beginner",
            "language": "English",
            "mastery_score": 0.5
        }

    def initialize_lesson(self, lesson_data: Dict[str, Any], language: str = "English"):
        self.state["current_lesson_id"] = lesson_data.get("id")
        self.state["current_section_index"] = 0
        self.state["concepts_covered"] = []
        self.state["concepts_understood"] = []
        self.state["concepts_struggling"] = []
        self.state["misconceptions"] = []
        self.state["current_strategy"] = "direct"
        self.state["difficulty"] = lesson_data.get("difficulty", "beginner")
        self.state["language"] = language
        self.state["mastery_score"] = 0.5

    async def process_student_answer(
        self,
        section_data: Dict[str, Any],
        student_answer: str
    ) -> Dict[str, Any]:
        concept = section_data.get("concepts", ["Main Concept"])[0] if section_data.get("concepts") else "Main Concept"
        question = section_data.get("question", "")
        expected = section_data.get("expected_answer", "")

        eval_result = await evaluator.evaluate_answer(
            concept=concept,
            question=question,
            expected_answer=expected,
            student_answer=student_answer,
            current_strategy=self.state["current_strategy"]
        )

        # Update teaching state
        if eval_result["correct"]:
            if concept not in self.state["concepts_understood"]:
                self.state["concepts_understood"].append(concept)
            self.state["mastery_score"] = min(1.0, self.state["mastery_score"] + 0.15)
        else:
            if concept not in self.state["concepts_struggling"]:
                self.state["concepts_struggling"].append(concept)
            if eval_result.get("detected_misconception"):
                self.state["misconceptions"].append(eval_result["detected_misconception"])
            
            # Switch teaching strategy
            new_strategy = eval_result.get("recommended_strategy", "analogy")
            self.state["current_strategy"] = new_strategy
            self.state["mastery_score"] = max(0.1, self.state["mastery_score"] - 0.15)

        return eval_result

    def switch_language(self, new_language: str):
        self.state["language"] = new_language

    def get_state(self) -> Dict[str, Any]:
        return self.state

teacher_agent = TeacherAgent()
