from __future__ import annotations
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class LearnerProfileNormalized(BaseModel):
    education_level: str
    learning_goal: str
    language: str = "English"
    teaching_style: str
    available_time_minutes: int = 30
    desired_depth: str
    prior_knowledge_summary: Optional[str] = None


class RetrievedChunk(BaseModel):
    chunk_id: str
    text: str
    source: str
    page: int = 1
    section: str = ""
    relevance_score: float = 0.0
    citation: str = ""


class KnowledgeSource(BaseModel):
    type: str
    documents: List[Dict[str, Any]] = Field(default_factory=list)
    grounding_available: bool = False


class TopicUnderstanding(BaseModel):
    summary: str
    core_concepts: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)
    important_relationships: List[str] = Field(default_factory=list)
    likely_learning_scope: List[str] = Field(default_factory=list)
    source_type: str = "general_knowledge"


class TeachingConstraints(BaseModel):
    language: str = "English"
    style: str = "Socratic"
    time_minutes: int = 30
    depth: str = "Balanced"


class LearningContext(BaseModel):
    session_id: Optional[str] = None
    topic: str
    learner_profile: LearnerProfileNormalized
    knowledge_source: KnowledgeSource
    topic_understanding: TopicUnderstanding
    retrieved_context: List[RetrievedChunk] = Field(default_factory=list)
    teaching_constraints: TeachingConstraints
    formatted_rag_context: str = ""

    def to_rag_context_string(self) -> str:
        if not self.retrieved_context:
            ctx_parts = [
                "[General Topic Knowledge]",
                f"Topic: {self.topic}",
                f"Summary: {self.topic_understanding.summary}",
                "",
                "Core Concepts:",
            ]
            for c in self.topic_understanding.core_concepts:
                ctx_parts.append(f"  - {c}")
            if self.topic_understanding.prerequisites:
                ctx_parts.append("\nPrerequisites:")
                for p in self.topic_understanding.prerequisites:
                    ctx_parts.append(f"  - {p}")
            return "\n".join(ctx_parts)
        parts = []
        for chunk in self.retrieved_context:
            parts.append(f"[{chunk.citation}]\n{chunk.text}")
        return "\n\n".join(parts)
