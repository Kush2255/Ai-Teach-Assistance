from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LearnerProfileSchema(BaseModel):
    name: str = "Learner"
    education_level: str = "Intermediate" # Elementary, High School, Undergraduate, Professional, Self-Taught
    current_knowledge: Optional[str] = ""
    learning_goal: str = "Foundational understanding" # Exam preparation, practical skill acquisition, foundational understanding, mastery
    preferred_language: str = "English" # English, Hindi, Hinglish, Telugu
    teaching_style: str = "Socratic" # Socratic, First Principles, Project-Based, Storytelling, Direct Instruction, Visual, Technical
    available_time: str = "30 minutes"
    desired_depth: str = "Deep dive" # High-level overview, Deep dive, Mastery, Modular reference

class LessonPlanRequest(BaseModel):
    topic: Optional[str] = None
    session_id: Optional[str] = None
    document_id: Optional[str] = None
    profile: Optional[LearnerProfileSchema] = None
    learning_context: Optional[Dict[str, Any]] = None

class SectionSchema(BaseModel):
    id: str
    title: str
    duration: int = 10
    section_objective: Optional[str] = None
    explanation: Optional[str] = None
    concepts: List[str] = []
    examples: List[str] = []
    guided_exercise: Optional[str] = None
    knowledge_check: Optional[List[str]] = None
    real_world_connection: Optional[str] = None
    transition: Optional[str] = None
    visual_type: str = "diagram"
    visual_description: Optional[str] = None
    visual_data: Optional[Dict[str, Any]] = None
    question: Optional[str] = None
    question_type: str = "conceptual"
    question_options: Optional[List[str]] = None
    expected_answer: Optional[str] = None
    expected_reasoning: Optional[str] = None

class LessonPlanResponse(BaseModel):
    id: str
    session_id: Optional[str] = None
    title: str
    topic: str
    objective: str
    overview: Optional[str] = None
    estimated_minutes: int
    total_time_minutes: Optional[int] = None
    difficulty: str
    language: str
    teaching_style: Optional[str] = None
    desired_depth: Optional[str] = None
    source_type: Optional[str] = "topic"
    sections: List[SectionSchema]
    immediate_action: Optional[str] = None
    further_exploration: Optional[List[str]] = None
    markdown_curriculum: Optional[str] = None

class AnswerSubmissionRequest(BaseModel):
    section_id: str
    student_answer: str

class AnswerEvaluationResponse(BaseModel):
    correct: bool
    confidence: float
    detected_misconception: Optional[str] = None
    severity: Optional[str] = None
    feedback: str
    recommended_strategy: str
    next_question: Optional[str] = None
    mastery_score: float

class LanguageSwitchRequest(BaseModel):
    new_language: str # English, Hindi, Hinglish, Telugu

class AssessmentQuestion(BaseModel):
    id: str
    question: str
    question_type: str
    options: Optional[List[str]] = None
    concept: str

class AssessmentResponse(BaseModel):
    assessment_id: str
    overall_score: float
    concept_scores: Dict[str, float]
    weak_areas: List[str]
    strong_areas: List[str]
    recommended_revisions: List[str]
    next_recommended_topic: str

class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    total_pages: int
    chunks_indexed: int
    sample_text: str

class DashboardSummaryResponse(BaseModel):
    total_lessons: int
    completed_lessons: int
    streak_days: int
    average_score: float
    weak_concepts: List[str]
    strong_concepts: List[str]
    recommended_topics: List[str]


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 2 — AI Understanding Layer Schemas
# ─────────────────────────────────────────────────────────────────────────────

class UnderstandRequest(BaseModel):
    """Request body for POST /api/lessons/understand (Workflow 2 entry point)."""
    topic: str = Field(..., min_length=2, description="The topic the learner wants to study.")
    education_level: str = Field(default="Intermediate")
    learning_goal: str = Field(default="Foundational understanding")
    preferred_language: str = Field(default="English")
    teaching_style: str = Field(default="Socratic")
    available_time: str = Field(default="30 minutes")
    desired_depth: str = Field(default="Balanced")
    current_knowledge: Optional[str] = Field(default=None)
    document_id: Optional[str] = Field(
        default=None,
        description="ID of a previously uploaded document (from POST /api/documents/upload)."
    )

    def to_learner_profile(self) -> "LearnerProfileSchema":
        """Convert to LearnerProfileSchema for compatibility with existing lesson planner."""
        return LearnerProfileSchema(
            name="Learner",
            education_level=self.education_level,
            current_knowledge=self.current_knowledge or "",
            learning_goal=self.learning_goal,
            preferred_language=self.preferred_language,
            teaching_style=self.teaching_style,
            available_time=self.available_time,
            desired_depth=self.desired_depth,
        )


class LearningContextResponse(BaseModel):
    """Response from POST /api/lessons/understand."""
    success: bool = True
    session_id: Optional[str] = None
    topic: str = ""
    learning_context: Dict[str, Any] = Field(
        description="The full structured LearningContext object as a JSON-serializable dict."
    )
    # Convenience summary fields for frontend progress display
    has_document_grounding: bool = False
    retrieved_chunks_count: int = 0
    core_concepts_count: int = 0
    source_type: str = "topic"


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 4 — AI Classroom & Teaching Script Schemas
# ─────────────────────────────────────────────────────────────────────────────

class TeachingSegmentSchema(BaseModel):
    segment_id: str
    segment_type: str = "concept"  # intro, concept, example, recap, question
    title: str = ""
    narration: str
    visual_type: str = "diagram"  # formula, graph, diagram, timeline, code, process, concept_card, table
    visual_title: Optional[str] = None
    visual_description: Optional[str] = None
    visual_data: Optional[Dict[str, Any]] = None
    emphasis: List[str] = []
    duration_seconds: int = 45


class TeachingScriptSchema(BaseModel):
    section_id: str
    section_title: str
    introduction: str
    segments: List[TeachingSegmentSchema] = []
    example: Optional[Dict[str, Any]] = None
    recap: Optional[str] = None
    estimated_duration: int = 180


class ClassroomSessionCreateRequest(BaseModel):
    lesson_id: str
    session_id: Optional[str] = None
    language: Optional[str] = "English"
    teaching_style: Optional[str] = "Visual"


class ClassroomSessionStateResponse(BaseModel):
    session_id: str
    lesson_id: str
    topic: str
    title: str
    current_section_index: int = 0
    current_segment_index: int = 0
    total_sections: int = 1
    total_segments_in_section: int = 1
    status: str = "ready"  # ready, speaking, paused, completed, error
    language: str = "English"
    teaching_style: str = "Visual"
    teacher_info: Dict[str, Any] = {}
    current_section: Dict[str, Any] = {}
    current_segment: Optional[TeachingSegmentSchema] = None
    visual: Optional[Dict[str, Any]] = None
    transcript: List[Dict[str, Any]] = []
    progress_percentage: float = 0.0
    sections_summary: List[Dict[str, Any]] = []
    handoff_state: Optional[Dict[str, Any]] = None


class ClassroomSegmentResponse(BaseModel):
    session_id: str
    section_index: int
    segment_index: int
    total_segments_in_section: int
    segment: TeachingSegmentSchema
    visual: Dict[str, Any]
    video_stream: Dict[str, Any]
    captions: str
    is_section_completed: bool = False
    is_lesson_completed: bool = False
    handoff_state: Optional[Dict[str, Any]] = None


# ─────────────────────────────────────────────────────────────────────────────
# WORKFLOW 4 — Full Teaching Video Generation & Scene Schemas
# ─────────────────────────────────────────────────────────────────────────────

class VideoSceneSchema(BaseModel):
    scene_id: str
    scene_type: str = "TEACHER_EXPLANATION" # TEACHER_INTRO, TEACHER_EXPLANATION, CONCEPT_VISUAL, DIAGRAM, FORMULA, WORKED_EXAMPLE, CODE_EXAMPLE, CHART, TIMELINE, MAP, COMPARISON, SUMMARY, KNOWLEDGE_CHECK
    duration: int = 10
    teacher_narration: str
    visual_type: str = "diagram"
    visual_prompt: Optional[str] = None
    on_screen_text: Optional[str] = None
    visual_data: Optional[Dict[str, Any]] = None
    transition: str = "smooth"


class VideoGenerationRequest(BaseModel):
    lesson_id: str
    section_id: Optional[str] = None
    topic: str
    language: Optional[str] = "English"
    teaching_style: Optional[str] = "Visual"
    education_level: Optional[str] = "Intermediate"
    learning_goal: Optional[str] = "Foundational understanding"
    desired_depth: Optional[str] = "Deep dive"


class VideoGenerationResponse(BaseModel):
    video_id: str
    status: str = "processing"
    progress_step: str = "Preparing lesson..."
    progress_percentage: int = 15


class VideoStatusResponse(BaseModel):
    video_id: str
    lesson_id: str
    section_id: Optional[str] = None
    topic: str
    language: str = "English"
    status: str = "completed" # processing, completed, failed
    progress_step: Optional[str] = "Video ready"
    progress_percentage: int = 100
    video_url: Optional[str] = None
    duration: int = 120
    teacher_profile: Dict[str, Any] = {}
    scenes: List[VideoSceneSchema] = []
    timed_captions: List[Dict[str, Any]] = []
    error_message: Optional[str] = None
    created_at: Optional[str] = None

