from fastapi import APIRouter
from app.api.routes_lessons import LESSON_CACHE
from app.ai.teacher_agent import teacher_agent
from app.ai.visual_planner import VisualPlanner

router = APIRouter(prefix="/api/demo", tags=["Demo Mode"])

@router.post("/start")
async def start_demo_scenario():
    """Initializes a pre-built Electricity hackathon demonstration lesson."""
    demo_lesson_id = "demo_electricity_101"
    demo_plan = {
        "id": demo_lesson_id,
        "title": "Interactive Physics: Electricity & Ohm's Law",
        "topic": "Electricity & Ohm's Law",
        "objective": "Understand how Voltage, Current, and Resistance interact, and resolve common misconceptions.",
        "estimated_minutes": 20,
        "difficulty": "beginner",
        "language": "English",
        "sections": [
            {
                "id": "sec_demo_1",
                "title": "1. What is Ohm's Law?",
                "duration": 5,
                "explanation": "Welcome! I'm your AI Teacher. Today we are exploring Ohm's Law. Think of voltage as pressure pushing electric charges through a wire, and resistance as the friction opposing them.",
                "concepts": ["Ohm's Law", "Voltage", "Current", "Resistance"],
                "examples": ["Water pipe pressure analogy", "Standard flashlight circuit"],
                "visual_type": "graph",
                "visual_data": VisualPlanner.generate_visual_payload("Electricity", "graph", "Voltage vs Current (V-I Curve)"),
                "question": "What happens to the current flowing through a circuit if resistance increases while voltage stays constant?",
                "question_type": "conceptual",
                "question_options": [
                    "Current increases",
                    "Current decreases",
                    "Current stays the same",
                    "Voltage doubles"
                ],
                "expected_answer": "Current decreases because resistance opposes charge flow."
            },
            {
                "id": "sec_demo_2",
                "title": "2. Formula Derivation & Quantitative Calculation",
                "duration": 8,
                "explanation": "Great progress! Now let's analyze the exact formula: I = V / R. Notice how Voltage is in the numerator and Resistance is in the denominator.",
                "concepts": ["Formula Derivation", "Quantitative Resistance"],
                "examples": ["Calculating current for a 12V battery across a 4 Ohm resistor"],
                "visual_type": "equation",
                "visual_data": VisualPlanner.generate_visual_payload("Electricity", "equation", "I = V / R"),
                "question": "If Voltage V = 12 Volts and Resistance R = 4 Ohms, what is the Current I in Amperes?",
                "question_type": "problem_solving",
                "question_options": ["1 Ampere", "3 Amperes", "8 Amperes", "48 Amperes"],
                "expected_answer": "3 Amperes (I = 12 / 4 = 3A)"
            }
        ]
    }

    LESSON_CACHE[demo_lesson_id] = demo_plan
    teacher_agent.initialize_lesson(demo_plan, language="English")

    return {
        "status": "success",
        "demo_lesson_id": demo_lesson_id,
        "plan": demo_plan
    }
