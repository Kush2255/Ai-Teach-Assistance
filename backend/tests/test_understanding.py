"""
test_understanding.py — Tests for Workflow 2: AI Understanding Layer

Test Coverage:
  1. LearningContext schema validation
  2. Learner profile normalization
  3. Fallback understanding (3 profiles from spec)
  4. Async topic understanding (topic-only path)
  5. Document-grounded path (graceful degradation)
  6. Schema validation (UnderstandRequest)
"""

import pytest
import asyncio
import sys
import os

# Ensure backend package is on path when running from tests/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.ai.learner_context import (
    LearningContext,
    LearnerProfileNormalized,
    KnowledgeSource,
    TopicUnderstanding,
    TeachingConstraints,
    RetrievedChunk,
)
from app.ai.topic_analyzer import TopicAnalyzer
from app.schemas.schemas import LearnerProfileSchema, UnderstandRequest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_profile(**kwargs) -> LearnerProfileSchema:
    defaults = dict(
        name="Test Learner",
        education_level="Undergraduate",
        current_knowledge="Basic science foundations",
        learning_goal="Foundational understanding",
        preferred_language="English",
        teaching_style="Socratic",
        available_time="30 minutes",
        desired_depth="Deep dive",
    )
    defaults.update(kwargs)
    return LearnerProfileSchema(**defaults)


# ---------------------------------------------------------------------------
# 1. LearningContext Schema
# ---------------------------------------------------------------------------

class TestLearningContextSchema:
    def test_minimal_context_creation(self):
        ctx = LearningContext(
            session_id="test_001",
            topic="Electricity and Ohm's Law",
            learner_profile=LearnerProfileNormalized(
                education_level="Undergraduate",
                learning_goal="Foundational understanding",
                language="English",
                teaching_style="Socratic",
                available_time_minutes=30,
                desired_depth="Deep dive",
            ),
            knowledge_source=KnowledgeSource(type="topic", documents=[], grounding_available=False),
            topic_understanding=TopicUnderstanding(
                summary="Ohm's Law relates voltage, current and resistance.",
                core_concepts=["Voltage", "Current", "Resistance", "V=IR"],
                prerequisites=["Basic physics", "Algebra"],
                important_relationships=["V = I * R"],
                likely_learning_scope=["Voltage basics", "Current flow", "Resistance", "Ohm's Law"],
            ),
            teaching_constraints=TeachingConstraints(
                language="English", style="Socratic", time_minutes=30, depth="Deep dive"
            ),
        )
        assert ctx.topic == "Electricity and Ohm's Law"
        assert ctx.session_id == "test_001"
        assert ctx.learner_profile.available_time_minutes == 30
        assert len(ctx.topic_understanding.core_concepts) == 4

    def test_to_rag_context_string_topic_only(self):
        ctx = LearningContext(
            topic="Newton's Laws",
            learner_profile=LearnerProfileNormalized(
                education_level="High School",
                learning_goal="Exam preparation",
                language="Hindi",
                teaching_style="Simple & Friendly",
                available_time_minutes=20,
                desired_depth="Core concepts",
            ),
            knowledge_source=KnowledgeSource(type="topic", documents=[], grounding_available=False),
            topic_understanding=TopicUnderstanding(
                summary="Newton's three laws of motion.",
                core_concepts=["Inertia", "F = ma", "Action-Reaction"],
                prerequisites=["Basic physics"],
                important_relationships=["F = ma"],
                likely_learning_scope=["First Law", "Second Law", "Third Law"],
            ),
            teaching_constraints=TeachingConstraints(
                language="Hindi", style="Simple & Friendly", time_minutes=20, depth="Core concepts"
            ),
        )
        rag = ctx.to_rag_context_string()
        assert "Newton's Laws" in rag
        assert "Inertia" in rag

    def test_to_rag_context_string_with_chunks(self):
        chunk = RetrievedChunk(
            chunk_id="doc_001_chunk_1",
            text="Ohm's Law: V = IR where V is voltage, I is current, R is resistance.",
            source="physics_textbook.pdf",
            page=42,
            section="Chapter 3: Circuits",
            relevance_score=0.95,
            citation="Source: physics_textbook.pdf, Page 42 (Chapter 3: Circuits)",
        )
        ctx = LearningContext(
            topic="Electricity",
            learner_profile=LearnerProfileNormalized(
                education_level="Undergraduate",
                learning_goal="Foundational understanding",
                language="English",
                teaching_style="Socratic",
                available_time_minutes=30,
                desired_depth="Deep dive",
            ),
            knowledge_source=KnowledgeSource(
                type="uploaded_material", documents=[{"id": "doc_001"}], grounding_available=True
            ),
            topic_understanding=TopicUnderstanding(
                summary="Electricity fundamentals.",
                core_concepts=["Voltage", "Current"],
                prerequisites=[],
                important_relationships=["V = IR"],
                likely_learning_scope=["Basic circuits"],
                source_type="uploaded_material",
            ),
            teaching_constraints=TeachingConstraints(
                language="English", style="Socratic", time_minutes=30, depth="Deep dive"
            ),
            retrieved_context=[chunk],
        )
        rag = ctx.to_rag_context_string()
        assert "physics_textbook.pdf" in rag
        assert "V = IR" in rag

    def test_serialization_to_dict(self):
        ctx = LearningContext(
            topic="React",
            learner_profile=LearnerProfileNormalized(
                education_level="Intermediate",
                learning_goal="Technical interview",
                language="English",
                teaching_style="Project-Based",
                available_time_minutes=60,
                desired_depth="Deep dive",
            ),
            knowledge_source=KnowledgeSource(type="topic", documents=[], grounding_available=False),
            topic_understanding=TopicUnderstanding(
                summary="React is a JS library for building UIs.",
                core_concepts=["Components", "Props", "State", "Hooks"],
                prerequisites=["JavaScript", "HTML"],
                important_relationships=["Unidirectional data flow"],
                likely_learning_scope=["Components", "State management", "Hooks"],
            ),
            teaching_constraints=TeachingConstraints(
                language="English", style="Project-Based", time_minutes=60, depth="Deep dive"
            ),
        )
        d = ctx.model_dump()
        assert d["topic"] == "React"
        assert d["learner_profile"]["available_time_minutes"] == 60
        assert "core_concepts" in d["topic_understanding"]


# ---------------------------------------------------------------------------
# 2. Learner Profile Normalization
# ---------------------------------------------------------------------------

class TestProfileNormalization:
    def setup_method(self):
        self.analyzer = TopicAnalyzer()

    def test_normalize_standard_profile(self):
        normalized = self.analyzer._normalize_profile(make_profile(available_time="30 minutes"))
        assert normalized.available_time_minutes == 30
        assert normalized.language == "English"
        assert normalized.teaching_style == "Socratic"

    def test_normalize_time_parsing(self):
        cases = [
            ("20 minutes", 20),
            ("45 minutes", 45),
            ("60", 60),
            ("10 minutes", 10),
        ]
        for time_str, expected in cases:
            result = self.analyzer._parse_time_minutes(time_str)
            assert result == expected, f"'{time_str}' should parse to {expected}, got {result}"

    def test_normalize_empty_prior_knowledge(self):
        normalized = self.analyzer._normalize_profile(make_profile(current_knowledge=""))
        assert normalized.prior_knowledge_summary is None

    def test_normalize_hindi_language(self):
        normalized = self.analyzer._normalize_profile(make_profile(preferred_language="Hindi"))
        assert normalized.language == "Hindi"

    def test_normalize_all_fields_preserved(self):
        profile = make_profile(
            education_level="High School",
            learning_goal="Exam preparation",
            preferred_language="Hindi",
            teaching_style="Direct Instruction",
            available_time="20 minutes",
            desired_depth="Core concepts",
        )
        n = self.analyzer._normalize_profile(profile)
        assert n.education_level == "High School"
        assert n.learning_goal == "Exam preparation"
        assert n.teaching_style == "Direct Instruction"
        assert n.available_time_minutes == 20
        assert n.desired_depth == "Core concepts"


# ---------------------------------------------------------------------------
# 3. Fallback Understanding
# ---------------------------------------------------------------------------

class TestFallbackUnderstanding:
    def setup_method(self):
        self.analyzer = TopicAnalyzer()

    def test_fallback_electricity(self):
        """Spec Example 1: Electricity & Ohm's Law"""
        profile = make_profile()
        n = self.analyzer._normalize_profile(profile)
        result = self.analyzer._build_fallback_understanding("Electricity & Ohm's Law", n, "general_knowledge")
        assert "Electricity & Ohm's Law" in result.summary
        assert len(result.core_concepts) > 0
        assert result.source_type == "general_knowledge"

    def test_fallback_scales_with_depth(self):
        """Deeper depth produces more concepts."""
        n_shallow = self.analyzer._normalize_profile(make_profile(desired_depth="High-level overview"))
        n_deep = self.analyzer._normalize_profile(make_profile(desired_depth="Deep dive"))
        r_shallow = self.analyzer._build_fallback_understanding("React", n_shallow, "general_knowledge")
        r_deep = self.analyzer._build_fallback_understanding("React", n_deep, "general_knowledge")
        assert len(r_deep.core_concepts) >= len(r_shallow.core_concepts)

    def test_fallback_newton_hindi(self):
        """Spec Example 2: Newton's Laws, Hindi"""
        profile = make_profile(
            education_level="Class 8",
            learning_goal="Exam preparation",
            preferred_language="Hindi",
            teaching_style="Simple & Friendly",
            available_time="20 minutes",
            desired_depth="Core concepts",
        )
        n = self.analyzer._normalize_profile(profile)
        result = self.analyzer._build_fallback_understanding("Newton's Laws", n, "general_knowledge")
        assert "Newton's Laws" in result.summary
        assert len(result.core_concepts) > 0

    def test_fallback_react(self):
        """Spec Example 3: React, Project-Based"""
        profile = make_profile(
            education_level="Intermediate",
            learning_goal="Technical interview",
            preferred_language="English",
            teaching_style="Project-Based",
            available_time="60 minutes",
            desired_depth="Deep dive",
        )
        n = self.analyzer._normalize_profile(profile)
        result = self.analyzer._build_fallback_understanding("React", n, "general_knowledge")
        assert "React" in result.summary
        assert len(result.core_concepts) > 0

    def test_fallback_does_not_hardcode_topic(self):
        """Fallback must work for any topic, not just predefined ones."""
        topics = ["Quantum Mechanics", "Ottoman History", "Machine Learning", "Jazz Music Theory"]
        n = self.analyzer._normalize_profile(make_profile())
        for topic in topics:
            result = self.analyzer._build_fallback_understanding(topic, n, "general_knowledge")
            assert topic in result.summary
            assert len(result.core_concepts) > 0


# ---------------------------------------------------------------------------
# 4. Async Topic Understanding
# ---------------------------------------------------------------------------

class TestTopicAnalyzerAsync:
    def setup_method(self):
        self.analyzer = TopicAnalyzer()

    def _run(self, coro):
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()

    def test_understand_electricity_topic_only(self):
        """Spec Example 1: Electricity & Ohm's Law"""
        profile = make_profile(
            education_level="Undergraduate",
            learning_goal="Foundational understanding",
            preferred_language="English",
            teaching_style="Socratic",
            available_time="30 minutes",
            desired_depth="Deep dive",
        )
        ctx = self._run(self.analyzer.understand("Electricity & Ohm's Law", profile, None))
        assert ctx.topic == "Electricity & Ohm's Law"
        assert ctx.knowledge_source.type == "topic"
        assert ctx.knowledge_source.grounding_available is False
        assert len(ctx.retrieved_context) == 0
        assert ctx.session_id is not None and ctx.session_id.startswith("session_")
        assert len(ctx.topic_understanding.core_concepts) > 0
        assert ctx.teaching_constraints.language == "English"
        assert ctx.teaching_constraints.time_minutes == 30
        assert ctx.teaching_constraints.style == "Socratic"

    def test_understand_newton_hindi(self):
        """Spec Example 2: Newton's Laws, Hindi"""
        profile = make_profile(
            education_level="Class 8",
            learning_goal="Exam preparation",
            preferred_language="Hindi",
            teaching_style="Simple & Friendly",
            available_time="20 minutes",
            desired_depth="Core concepts",
        )
        ctx = self._run(self.analyzer.understand("Newton's Laws", profile, None))
        assert ctx.topic == "Newton's Laws"
        assert ctx.teaching_constraints.language == "Hindi"
        assert ctx.teaching_constraints.time_minutes == 20

    def test_understand_react_project_based(self):
        """Spec Example 3: React, Project-Based, 60 minutes"""
        profile = make_profile(
            education_level="Intermediate",
            learning_goal="Technical interview",
            preferred_language="English",
            teaching_style="Project-Based",
            available_time="60 minutes",
            desired_depth="Deep dive",
        )
        ctx = self._run(self.analyzer.understand("React", profile, None))
        assert ctx.topic == "React"
        assert ctx.teaching_constraints.time_minutes == 60
        assert ctx.teaching_constraints.style == "Project-Based"

    def test_understand_produces_valid_serializable_context(self):
        """LearningContext must serialize correctly for API response."""
        ctx = self._run(self.analyzer.understand("Cell Division in Biology", make_profile(), None))
        d = ctx.model_dump()
        assert isinstance(d, dict)
        assert "topic_understanding" in d
        assert "learner_profile" in d
        assert "teaching_constraints" in d
        assert "knowledge_source" in d
        assert "retrieved_context" in d

    def test_understand_document_path_graceful_without_data(self):
        """Fake doc_id: no vector store data → empty retrieved_context, no crash."""
        ctx = self._run(self.analyzer.understand("Photosynthesis", make_profile(), "doc_nonexistent"))
        assert ctx.topic == "Photosynthesis"
        assert ctx.knowledge_source.type == "uploaded_material"
        # No crash even if vector store is empty

    def test_understand_formatted_rag_context_populated(self):
        """formatted_rag_context should be a non-empty string after understanding."""
        ctx = self._run(self.analyzer.understand("Machine Learning", make_profile(), None))
        assert isinstance(ctx.formatted_rag_context, str)
        assert len(ctx.formatted_rag_context) > 10

    def test_understand_arbitrary_topic(self):
        """Must work for any topic without hardcoding."""
        for topic in ["Ottoman Empire History", "Jazz Music Theory", "Quantum Entanglement"]:
            ctx = self._run(self.analyzer.understand(topic, make_profile(), None))
            assert ctx.topic == topic
            assert len(ctx.topic_understanding.core_concepts) > 0


# ---------------------------------------------------------------------------
# 5. Schema Validation
# ---------------------------------------------------------------------------

class TestSchemas:
    def test_understand_request_empty_topic_invalid(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            UnderstandRequest(topic="")

    def test_understand_request_single_char_invalid(self):
        from pydantic import ValidationError
        with pytest.raises(ValidationError):
            UnderstandRequest(topic="x")

    def test_understand_request_valid_minimal(self):
        req = UnderstandRequest(topic="Electricity & Ohm's Law")
        assert req.topic == "Electricity & Ohm's Law"
        assert req.preferred_language == "English"
        assert req.document_id is None

    def test_understand_request_with_document_id(self):
        req = UnderstandRequest(topic="Physics", document_id="doc_abc123")
        assert req.document_id == "doc_abc123"

    def test_understand_request_to_learner_profile_conversion(self):
        req = UnderstandRequest(
            topic="Newton's Laws",
            education_level="High School",
            learning_goal="Exam preparation",
            preferred_language="Hindi",
            teaching_style="Simple & Friendly",
            available_time="20 minutes",
            desired_depth="Core concepts",
        )
        profile = req.to_learner_profile()
        assert profile.education_level == "High School"
        assert profile.preferred_language == "Hindi"
        assert profile.teaching_style == "Simple & Friendly"
        assert profile.available_time == "20 minutes"
