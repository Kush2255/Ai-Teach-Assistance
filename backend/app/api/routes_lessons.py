import logging
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.schemas.schemas import (
    LessonPlanRequest, LessonPlanResponse,
    AnswerSubmissionRequest, AnswerEvaluationResponse,
    LanguageSwitchRequest, AssessmentResponse,
    UnderstandRequest, LearningContextResponse,
)
from app.ai.lesson_planner import lesson_planner
from app.ai.teacher_agent import teacher_agent
from app.ai.topic_analyzer import topic_analyzer
from app.rag.rag_service import rag_service
from app.video.video_generator import video_generator
from app.database import get_db
from app.models.models import LearningSession, Lesson, LessonSection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/lessons", tags=["Lessons"])

# Memory cache for active lessons in MVP
LESSON_CACHE: Dict[str, Dict[str, Any]] = {}


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 2: AI Understanding Layer
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/understand", response_model=LearningContextResponse, summary="Workflow 2: AI Understanding")
async def understand_learner(
    req: UnderstandRequest,
    db: Session = Depends(get_db),
):
    """
    Workflow 2: AI Understanding Layer.

    Accepts learner setup + optional document_id and produces a structured
    LearningContext that the Lesson Planner (Workflow 3) will consume.

    PATH A: topic only -> LLM topic understanding
    PATH B: document_id -> RAG retrieval -> source-grounded LLM understanding
    """
    if not req.topic or not req.topic.strip():
        raise HTTPException(status_code=422, detail="Topic cannot be empty.")

    profile = req.to_learner_profile()

    try:
        context = await topic_analyzer.understand(
            topic=req.topic.strip(),
            profile=profile,
            document_id=req.document_id,
        )
    except Exception as e:
        logger.error(f"[W2] Understanding failed for topic='{req.topic}': {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI Understanding failed: {str(e)}. Please try again or remove the uploaded document."
        )

    # Persist learning session to DB
    try:
        session_record = LearningSession(
            id=context.session_id,
            topic=context.topic,
            education_level=context.learner_profile.education_level,
            learning_goal=context.learner_profile.learning_goal,
            language=context.learner_profile.language,
            teaching_style=context.learner_profile.teaching_style,
            available_time_minutes=context.learner_profile.available_time_minutes,
            desired_depth=context.learner_profile.desired_depth,
            document_id=req.document_id,
            source_type=context.knowledge_source.type,
            learning_context_json=context.model_dump(),
        )
        db.add(session_record)
        db.commit()
    except Exception as db_err:
        logger.warning(f"[W2] DB persist failed (non-critical): {db_err}")

    return LearningContextResponse(
        success=True,
        session_id=context.session_id,
        topic=context.topic,
        learning_context=context.model_dump(),
        has_document_grounding=context.knowledge_source.grounding_available,
        retrieved_chunks_count=len(context.retrieved_context),
        core_concepts_count=len(context.topic_understanding.core_concepts),
        source_type=context.knowledge_source.type,
    )


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 3: AI Lesson Planner — Personalized Curriculum Generation
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/create", response_model=LessonPlanResponse, summary="Workflow 3: AI Lesson Planner")
async def create_lesson(
    req: LessonPlanRequest,
    db: Session = Depends(get_db),
):
    """
    Workflow 3: AI Lesson Planner.

    Generates a personalized, time-calibrated curriculum based on:
      1. Direct LearningContext from Workflow 2 (if provided in body or DB via session_id)
      2. Or topic + profile + document_id parameters.
    """
    learning_context_data = req.learning_context
    session_id = req.session_id

    # If session_id provided but no learning_context payload, retrieve from DB
    if session_id and not learning_context_data:
        try:
            sess = db.query(LearningSession).filter(LearningSession.id == session_id).first()
            if sess and sess.learning_context_json:
                learning_context_data = sess.learning_context_json
        except Exception as db_err:
            logger.warning(f"[W3] Session lookup failed: {db_err}")

    # Determine topic
    topic = req.topic
    if not topic and learning_context_data:
        topic = learning_context_data.get("topic")
    if not topic:
        topic = "General Study Topic"

    # Determine RAG context
    rag_context = ""
    if req.document_id:
        rag_context = rag_service.get_relevant_context(topic)

    plan = await lesson_planner.create_plan(
        topic=topic,
        profile=req.profile,
        rag_context=rag_context,
        learning_context=learning_context_data,
        session_id=session_id,
    )

    preferred_lang = plan.get("language", "English")
    teacher_agent.initialize_lesson(plan, language=preferred_lang)

    # Persist Lesson to Database
    try:
        lesson_db = Lesson(
            id=plan["id"],
            title=plan["title"],
            topic=plan["topic"],
            objective=plan.get("objective", ""),
            education_level=plan.get("difficulty", "Undergraduate"),
            language=preferred_lang,
            teaching_style=plan.get("teaching_style", "Socratic"),
            estimated_minutes=plan.get("estimated_minutes", 30),
            difficulty=plan.get("difficulty", "Undergraduate"),
            status="created",
            document_id=req.document_id,
        )
        db.add(lesson_db)

        # Persist Sections
        for idx, sec in enumerate(plan.get("sections", [])):
            sec_db = LessonSection(
                id=sec.get("id", f"sec_{idx}_{plan['id']}"),
                lesson_id=plan["id"],
                order_index=idx + 1,
                title=sec.get("title", f"Section {idx+1}"),
                duration_minutes=sec.get("duration", 10),
                explanation_script=sec.get("explanation", ""),
                concepts=sec.get("concepts", []),
                examples=sec.get("examples", []),
                visual_type=sec.get("visual_type", "diagram"),
                visual_data=sec.get("visual_data", {}),
                question=sec.get("question", ""),
                question_type=sec.get("question_type", "conceptual"),
                question_options=sec.get("question_options"),
                expected_answer=sec.get("expected_answer", ""),
            )
            db.add(sec_db)

        # Link to session if present
        if session_id:
            sess = db.query(LearningSession).filter(LearningSession.id == session_id).first()
            if sess:
                sess.lesson_id = plan["id"]

        db.commit()
    except Exception as db_err:
        logger.warning(f"[W3] Lesson DB persistence error (non-critical): {db_err}")

    # Cache for live classroom execution
    LESSON_CACHE[plan["id"]] = plan

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
        lesson = LESSON_CACHE[lesson_id]
        lesson["language"] = req.new_language
        teacher_agent.switch_language(req.new_language)

        # Translate ALL sections so the entire lesson switches language
        translated_sections = []
        for sec in lesson.get("sections", []):
            translated_sec = await teacher_agent.translate_section(sec, req.new_language)
            translated_sections.append(translated_sec)
        lesson["sections"] = translated_sections

        # Return the first (current) section for the classroom to display immediately
        current_section = translated_sections[0] if translated_sections else {}

        return {
            "status": "success",
            "new_language": req.new_language,
            "section": current_section,
            "all_sections_translated": True
        }

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
