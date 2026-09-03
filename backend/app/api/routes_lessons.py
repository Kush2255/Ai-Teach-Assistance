from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from app.schemas.schemas import LessonPlanRequest, LessonPlanResponse, AnswerSubmissionRequest, AnswerEvaluationResponse, LanguageSwitchRequest, AssessmentResponse
from app.ai.lesson_planner import lesson_planner
from app.ai.teacher_agent import teacher_agent
from app.rag.rag_service import rag_service
from app.video.video_generator import video_generator

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])

# Memory cache for active lessons in MVP
LESSON_CACHE: Dict[str, Dict[str, Any]] = {}

@router.post("/create", response_model=LessonPlanResponse)
async def create_lesson(req: LessonPlanRequest):
    rag_context = ""
    if req.topic:
        rag_context = rag_service.get_relevant_context(req.topic)
    
    plan = await lesson_planner.create_plan(
        topic=req.topic or "Electricity & Ohm's Law",
        profile=req.profile,
        rag_context=rag_context
    )

    LESSON_CACHE[plan["id"]] = plan
    teacher_agent.initialize_lesson(plan, language=req.profile.preferred_language)

    return LessonPlanResponse(**plan)

@router.get("/{lesson_id}")
async def get_lesson(lesson_id: str):
    if lesson_id in LESSON_CACHE:
        return LESSON_CACHE[lesson_id]
    raise HTTPException(status_code=404, detail="Lesson not found")

@router.post("/{lesson_id}/start")
async def start_lesson(lesson_id: str):
    if lesson_id not in LESSON_CACHE:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    lesson = LESSON_CACHE[lesson_id]
    first_section = lesson["sections"][0]
    
    # Generate audio & video package for section
    video_pkg = video_generator.generate_section_video(
        script=first_section["explanation"],
        language=lesson.get("language", "English")
    )

    return {
        "lesson_id": lesson_id,
        "section_index": 0,
        "total_sections": len(lesson["sections"]),
        "section": first_section,
        "video": video_pkg,
        "state": teacher_agent.get_state()
    }

@router.post("/{lesson_id}/answer", response_model=AnswerEvaluationResponse)
async def submit_answer(lesson_id: str, req: AnswerSubmissionRequest):
    if lesson_id not in LESSON_CACHE:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    lesson = LESSON_CACHE[lesson_id]
    target_section = None
    for sec in lesson["sections"]:
        if sec["id"] == req.section_id:
            target_section = sec
            break
            
    if not target_section:
        target_section = lesson["sections"][0]

    eval_result = await teacher_agent.process_student_answer(
        section_data=target_section,
        student_answer=req.student_answer
    )

    return AnswerEvaluationResponse(**eval_result)

@router.post("/{lesson_id}/switch-language")
async def switch_language(lesson_id: str, req: LanguageSwitchRequest):
    if lesson_id in LESSON_CACHE:
        LESSON_CACHE[lesson_id]["language"] = req.new_language
    teacher_agent.switch_language(req.new_language)
    return {"status": "success", "new_language": req.new_language}

@router.post("/{lesson_id}/generate-video")
async def generate_video(lesson_id: str, section_id: str):
    if lesson_id not in LESSON_CACHE:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    lesson = LESSON_CACHE[lesson_id]
    section = next((s for s in lesson["sections"] if s["id"] == section_id), lesson["sections"][0])
    
    video_pkg = video_generator.generate_section_video(
        script=section["explanation"],
        language=lesson.get("language", "English")
    )
    return video_pkg

@router.post("/{lesson_id}/assessment", response_model=AssessmentResponse)
async def generate_assessment(lesson_id: str):
    state = teacher_agent.get_state()
    struggling = state.get("concepts_struggling", ["Resistance", "Ohm's Law"])
    
    overall = 82.0 if not struggling else (65.0 if len(struggling) > 1 else 78.0)
    
    return AssessmentResponse(
        assessment_id=f"assess_{lesson_id}",
        overall_score=overall,
        concept_scores={
            "Voltage": 95.0,
            "Current": 88.0,
            "Resistance": 60.0 if "Resistance" in struggling else 85.0,
            "Ohm's Law Calculation": 70.0 if "Ohm's Law" in struggling else 90.0
        },
        weak_areas=["Resistance concept", "Inverse proportionality in Ohm's Law"] if struggling else ["Complex Circuit Analysis"],
        strong_areas=["Voltage fundamentals", "Direct proportion in Voltage vs Current"],
        recommended_revisions=["Ohm's Law water pipe analogy", "Resistance calculations under constant voltage"],
        next_recommended_topic="Electrical Power & Energy (P = V × I)"
    )

@router.get("/{lesson_id}/report")
async def get_report(lesson_id: str):
    return await generate_assessment(lesson_id)
