from fastapi import APIRouter
from app.schemas.schemas import LearnerProfileSchema, DashboardSummaryResponse

router = APIRouter(prefix="/api/student", tags=["Student Profile & Analytics"])

@router.get("/profile", response_model=LearnerProfileSchema)
async def get_profile():
    return LearnerProfileSchema(
        name="Alex Student",
        education_level="Beginner",
        current_knowledge="Basic physics concepts",
        learning_goal="Understand fundamentals",
        preferred_language="English",
        teaching_style="Simple & Friendly",
        available_time="20 minutes",
        desired_depth="Balanced"
    )

@router.get("/progress", response_model=DashboardSummaryResponse)
async def get_progress():
    return DashboardSummaryResponse(
        total_lessons=4,
        completed_lessons=3,
        streak_days=5,
        average_score=84.5,
        weak_concepts=["Resistance calculation", "Inverse proportionality"],
        strong_concepts=["Voltage potential", "Current flow", "Circuit loops"],
        recommended_topics=["Electrical Power", "Kirchhoff's Laws", "AC/DC Circuits"]
    )

@router.get("/learning-path")
async def get_learning_path():
    return {
        "subject": "Physics & Electronics",
        "modules": [
            {
                "id": "mod_1",
                "title": "1. Charge & Voltage",
                "status": "completed",
                "score": 92.0,
                "description": "Electric charges, potential difference, and field vectors."
            },
            {
                "id": "mod_2",
                "title": "2. Electricity & Ohm's Law",
                "status": "in_progress",
                "score": 82.0,
                "description": "V = I × R relationships, resistance, and current flow."
            },
            {
                "id": "mod_3",
                "title": "3. Electrical Power (P = VI)",
                "status": "unlocked",
                "score": 0.0,
                "description": "Energy dissipation, wattage, and Joule heating."
            },
            {
                "id": "mod_4",
                "title": "4. Series & Parallel Circuits",
                "status": "locked",
                "score": 0.0,
                "description": "Equivalent resistance and voltage dividers."
            },
            {
                "id": "mod_5",
                "title": "5. Kirchhoff's Voltage & Current Laws",
                "status": "locked",
                "score": 0.0,
                "description": "Nodal analysis and mesh current methods."
            }
        ]
    }
