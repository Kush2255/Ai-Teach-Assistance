"""
AI Classroom API Routes (Workflow 4)

Endpoints powering the interactive AI Classroom:
- Session lifecycle (create, resume, state)
- Micro-segment delivery (teacher video/stream + dynamic educational visuals)
- Navigation (next, previous, jump, pause, replay)
- Real-time language switching
- Workflow 5 evaluation/adaptation handoff
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Lesson, LearningSession
from app.schemas.schemas import (
    ClassroomSessionCreateRequest,
    ClassroomSessionStateResponse,
    ClassroomSegmentResponse,
    LanguageSwitchRequest,
    VideoGenerationRequest,
    VideoGenerationResponse,
    VideoStatusResponse,
)
from app.ai.classroom_engine import classroom_manager
from app.video.video_provider import video_provider, VIDEO_CACHE
from app.api.routes_lessons import LESSON_CACHE

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/classroom", tags=["Classroom"])


@router.post("/session", response_model=ClassroomSessionStateResponse, summary="Workflow 4: Start or Resume Classroom Session")
async def create_classroom_session(
    req: ClassroomSessionCreateRequest,
    db: Session = Depends(get_db),
):
    """
    Workflow 4 Entry Point:
    Initializes an interactive AI Classroom session from a Workflow 3 Lesson Plan.
    Generates structured teaching scripts and visual sync payloads for every section.
    """
    lesson_data = None

    # Check in-memory lesson cache first
    if req.lesson_id in LESSON_CACHE:
        lesson_data = LESSON_CACHE[req.lesson_id]
    else:
        # Query DB
        try:
            lesson_db = db.query(Lesson).filter(Lesson.id == req.lesson_id).first()
            if lesson_db:
                sections = []
                for s in lesson_db.sections:
                    sections.append({
                        "id": s.id,
                        "title": s.title,
                        "duration": s.duration_minutes,
                        "explanation": s.explanation_script,
                        "concepts": s.concepts or [],
                        "examples": s.examples or [],
                        "visual_type": s.visual_type,
                        "visual_data": s.visual_data or {},
                        "question": s.question,
                        "question_type": s.question_type,
                        "expected_answer": s.expected_answer,
                    })
                lesson_data = {
                    "id": lesson_db.id,
                    "title": lesson_db.title,
                    "topic": lesson_db.topic,
                    "objective": lesson_db.objective,
                    "difficulty": lesson_db.difficulty,
                    "language": lesson_db.language,
                    "teaching_style": lesson_db.teaching_style,
                    "estimated_minutes": lesson_db.estimated_minutes,
                    "sections": sections,
                }
                LESSON_CACHE[lesson_db.id] = lesson_data
        except Exception as db_err:
            logger.warning(f"[ClassroomAPI] Lesson DB query error: {db_err}")

    if not lesson_data:
        raise HTTPException(
            status_code=404,
            detail=f"Lesson '{req.lesson_id}' not found. Please create a lesson plan first via Workflow 3."
        )

    try:
        session_state = await classroom_manager.create_or_resume_session(
            lesson_data=lesson_data,
            session_id=req.session_id,
            language=req.language or lesson_data.get("language", "English"),
            teaching_style=req.teaching_style or lesson_data.get("teaching_style", "Visual"),
        )
        return session_state
    except Exception as e:
        logger.error(f"[ClassroomAPI] Failed to initialize classroom session: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Classroom initialization failed: {str(e)}"
        )


@router.get("/session/{session_id}", response_model=ClassroomSessionStateResponse, summary="Get Classroom Session State")
async def get_classroom_session(session_id: str):
    """Retrieve the current state, progress, and active section of a classroom session."""
    state = classroom_manager.get_session_state(session_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"Classroom session '{session_id}' not found.")
    return state


@router.get(
    "/session/{session_id}/segment/{section_idx}/{segment_idx}",
    response_model=ClassroomSegmentResponse,
    summary="Get Specific Teaching Segment Payload"
)
async def get_teaching_segment(session_id: str, section_idx: int, segment_idx: int):
    """Get the synchronized teacher video and dynamic visual payload for a specific segment."""
    payload = await classroom_manager.get_segment_payload(session_id, section_idx, segment_idx)
    if not payload:
        raise HTTPException(
            status_code=404,
            detail=f"Segment ({section_idx}, {segment_idx}) not found in session '{session_id}'."
        )
    return payload


@router.post("/session/{session_id}/next", response_model=ClassroomSegmentResponse, summary="Advance to Next Segment")
async def advance_classroom(session_id: str):
    """Advance the classroom playback to the next teaching segment or section."""
    payload = await classroom_manager.advance_segment(session_id)
    if not payload:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' completed or not found.")
    return payload


@router.post("/session/{session_id}/previous", response_model=ClassroomSegmentResponse, summary="Step Back to Previous Segment")
async def previous_classroom(session_id: str):
    """Step back to the previous teaching segment or section."""
    payload = await classroom_manager.previous_segment(session_id)
    if not payload:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return payload


@router.post("/session/{session_id}/jump/{section_idx}", response_model=ClassroomSegmentResponse, summary="Jump to Section")
async def jump_section(session_id: str, section_idx: int):
    """Jump directly to a specific section in the curriculum."""
    payload = await classroom_manager.jump_to_section(session_id, section_idx)
    if not payload:
        raise HTTPException(status_code=404, detail=f"Section {section_idx} not found in session '{session_id}'.")
    return payload


@router.post("/session/{session_id}/switch-language", response_model=ClassroomSessionStateResponse, summary="Switch Spoken & Visual Language")
async def switch_classroom_language(session_id: str, req: LanguageSwitchRequest):
    """Switch language on the fly; translates scripts and re-renders visual metadata."""
    res = await classroom_manager.switch_language(session_id, req.new_language)
    if not res:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return res


@router.get("/session/{session_id}/handoff", summary="Workflow 5 Evaluation Handoff Hook")
async def get_classroom_handoff(session_id: str):
    """
    Exposes structured handoff state for future Workflow 5 (evaluation, misconception detection, adaptive remediation).
    """
    state = classroom_manager.get_session_state(session_id)
    if not state or not state.handoff_state:
        raise HTTPException(status_code=404, detail="Handoff state not available for this session.")
    return {
        "status": "ready_for_workflow_5",
        "handoff_data": state.handoff_state
    }


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 4 — Dedicated Video Generation Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/video/generate", response_model=VideoGenerationResponse, summary="Generate Complete AI Teaching Video")
async def generate_teaching_video(req: VideoGenerationRequest, db: Session = Depends(get_db)):
    """
    Workflow 4 Video Pipeline:
    Generates dynamic teaching script -> scene plan -> educational visuals -> composed video.
    """
    lesson_data = LESSON_CACHE.get(req.lesson_id)
    if not lesson_data:
        try:
            lesson_db = db.query(Lesson).filter(Lesson.id == req.lesson_id).first()
            if lesson_db:
                lesson_data = {
                    "id": lesson_db.id,
                    "title": lesson_db.title,
                    "topic": lesson_db.topic,
                    "objective": lesson_db.objective,
                    "difficulty": lesson_db.difficulty,
                    "language": lesson_db.language,
                    "teaching_style": lesson_db.teaching_style,
                }
        except Exception as err:
            logger.warning(f"Could not load lesson from DB: {err}")

    if not lesson_data:
        lesson_data = {
            "id": req.lesson_id,
            "title": f"Complete Guide to {req.topic}",
            "topic": req.topic,
            "language": req.language or "English",
            "teaching_style": req.teaching_style or "Visual",
            "difficulty": req.education_level or "Intermediate",
        }

    section_data = None
    if req.section_id and lesson_data.get("sections"):
        for s in lesson_data["sections"]:
            if s.get("id") == req.section_id:
                section_data = s
                break

    learner_profile = {
        "preferred_language": req.language or lesson_data.get("language", "English"),
        "teaching_style": req.teaching_style or lesson_data.get("teaching_style", "Visual"),
        "education_level": req.education_level or lesson_data.get("difficulty", "Intermediate"),
        "learning_goal": req.learning_goal or "Foundational understanding",
        "desired_depth": req.desired_depth or "Deep dive",
    }

    res = await video_provider.generate_teaching_video(
        topic=req.topic,
        lesson_data=lesson_data,
        section_data=section_data,
        learner_profile=learner_profile,
    )

    return VideoGenerationResponse(
        video_id=res["video_id"],
        status=res.get("status", "processing"),
        progress_step=res.get("progress_step", "Preparing lesson..."),
        progress_percentage=res.get("progress_percentage", 20),
    )


@router.get("/video/{video_id}", response_model=VideoStatusResponse, summary="Get Teaching Video Status & Scenes")
async def get_video_status(video_id: str):
    """Poll progress status or retrieve completed AI teaching video scenes and captions."""
    record = await video_provider.get_video_status(video_id)
    if not record or record.get("status") == "not_found":
        raise HTTPException(status_code=404, detail=f"Teaching video '{video_id}' not found.")
    return VideoStatusResponse(**record)

