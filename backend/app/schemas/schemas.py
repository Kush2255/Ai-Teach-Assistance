from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class LearnerProfileSchema(BaseModel):
    name: str = "Learner"
    education_level: str = "Undergraduate" # Elementary, High School, Undergraduate, Professional, Self-Taught
    current_knowledge: Optional[str] = ""
    learning_goal: str = "Foundational understanding" # Exam preparation, practical skill acquisition, foundational understanding, mastery
    preferred_language: str = "English" # English, Hindi, Hinglish, Telugu
    teaching_style: str = "Socratic" # Socratic, First Principles, Project-Based, Storytelling, Direct Instruction, Simple & Friendly, Visual, Technical, Exam-focused
    available_time: str = "30 minutes"
    desired_depth: str = "Deep dive" # High-level overview, Deep dive, Mastery, Modular reference

class LessonPlanRequest(BaseModel):
    topic: Optional[str] = "Electricity & Ohm's Law"
    document_id: Optional[str] = None
    profile: LearnerProfileSchema

class SectionSchema(BaseModel):
    id: str
    title: str
    duration: int = 5
    objective: Optional[str] = None
    explanation: Optional[str] = None
    concepts: List[str] = []
    guided_exercise: Optional[str] = None
    knowledge_check: Optional[str] = None
    examples: List[str] = []
    visual_type: str = "diagram"
    visual_data: Optional[Dict[str, Any]] = None
    question: Optional[str] = None
    question_type: str = "conceptual"
    question_options: Optional[List[str]] = None
    expected_answer: Optional[str] = None

class LessonPlanResponse(BaseModel):
    id: str
    title: str
    topic: str
    objective: Optional[str] = None
    overview: Optional[str] = None
    education_level: Optional[str] = None
    learning_goal: Optional[str] = None
    teaching_style: Optional[str] = None
    available_time: Optional[str] = None
    desired_depth: Optional[str] = None
    estimated_minutes: int = 20
    difficulty: str = "Undergraduate"
    language: str = "English"
    sections: List[SectionSchema]
    next_steps: Optional[Dict[str, Any]] = None
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
