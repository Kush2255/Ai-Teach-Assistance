from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True) # e.g. default_user
    name = Column(String, default="Learner")
    education_level = Column(String, default="Beginner")
    current_knowledge = Column(Text, nullable=True)
    learning_goal = Column(String, default="Understand fundamentals")
    preferred_language = Column(String, default="English")
    teaching_style = Column(String, default="Simple & Friendly")
    available_time = Column(String, default="20 minutes")
    desired_depth = Column(String, default="Balanced")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    mastery_records = relationship("ConceptMastery", back_populates="user", cascade="all, delete-orphan")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    total_pages = Column(Integer, default=1)
    chunk_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

class Lesson(Base):
    __tablename__ = "lessons"
    
    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    objective = Column(Text, nullable=True)
    education_level = Column(String, default="Beginner")
    language = Column(String, default="English")
    teaching_style = Column(String, default="Simple & Friendly")
    estimated_minutes = Column(Integer, default=20)
    difficulty = Column(String, default="beginner")
    status = Column(String, default="created") # created, in_progress, completed
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    sections = relationship("LessonSection", back_populates="lesson", cascade="all, delete-orphan")
    responses = relationship("StudentResponse", back_populates="lesson", cascade="all, delete-orphan")

class LessonSection(Base):
    __tablename__ = "lesson_sections"
    
    id = Column(String, primary_key=True)
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=False)
    order_index = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=4)
    explanation_script = Column(Text, nullable=True)
    concepts = Column(JSON, default=list) # list of concept strings
    examples = Column(JSON, default=list)
    visual_type = Column(String, default="diagram") # diagram, equation, graph, code, timeline, concept_map
    visual_data = Column(JSON, default=dict)
    question = Column(Text, nullable=True)
    question_type = Column(String, default="conceptual")
    question_options = Column(JSON, nullable=True)
    expected_answer = Column(Text, nullable=True)
    
    lesson = relationship("Lesson", back_populates="sections")

class StudentResponse(Base):
    __tablename__ = "student_responses"
    
    id = Column(String, primary_key=True)
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=False)
    section_id = Column(String, nullable=False)
    student_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=False)
    confidence = Column(Float, default=0.0)
    detected_misconception = Column(Text, nullable=True)
    misconception_severity = Column(String, nullable=True)
    feedback_given = Column(Text, nullable=True)
    strategy_used = Column(String, default="direct")
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    lesson = relationship("Lesson", back_populates="responses")

class ConceptMastery(Base):
    __tablename__ = "concept_mastery"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    concept_name = Column(String, nullable=False)
    mastery_score = Column(Float, default=0.0) # 0.0 to 1.0
    attempts_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="mastery_records")

class Assessment(Base):
    __tablename__ = "assessments"
    
    id = Column(String, primary_key=True)
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=False)
    overall_score = Column(Float, default=0.0)
    concept_scores = Column(JSON, default=dict)
    weak_areas = Column(JSON, default=list)
    strong_areas = Column(JSON, default=list)
    recommended_revisions = Column(JSON, default=list)
    next_recommended_topic = Column(String, nullable=True)
    questions_answers = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class LearningPath(Base):
    __tablename__ = "learning_paths"
    
    id = Column(String, primary_key=True)
    subject = Column(String, nullable=False)
    modules = Column(JSON, default=list) # [{id, title, status, score, description}]
    created_at = Column(DateTime, default=datetime.utcnow)


class LearningSession(Base):
    """
    Persists the LearningContext produced by Workflow 2.

    Connects the workflow chain:
      Learner Setup → Learning Context → Lesson Plan → Classroom
    """
    __tablename__ = "learning_sessions"

    id = Column(String, primary_key=True)  # session_id from LearningContext
    topic = Column(String, nullable=False)
    education_level = Column(String, nullable=True)
    learning_goal = Column(String, nullable=True)
    language = Column(String, default="English")
    teaching_style = Column(String, nullable=True)
    available_time_minutes = Column(Integer, default=30)
    desired_depth = Column(String, nullable=True)
    document_id = Column(String, nullable=True)  # FK to documents if uploaded
    source_type = Column(String, default="topic")  # "uploaded_material" | "topic"
    learning_context_json = Column(JSON, default=dict)  # full LearningContext serialized
    lesson_id = Column(String, ForeignKey("lessons.id"), nullable=True)  # linked when lesson created
    created_at = Column(DateTime, default=datetime.utcnow)
