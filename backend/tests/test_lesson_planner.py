import pytest
import asyncio
from app.ai.lesson_planner import lesson_planner
from app.ai.learner_context import (
    LearningContext,
    LearnerProfileNormalized,
    KnowledgeSource,
    TopicUnderstanding,
    TeachingConstraints,
    RetrievedChunk
)
from app.schemas.schemas import LearnerProfileSchema, LessonPlanRequest, LessonPlanResponse, SectionSchema


class TestTimeCalibration:
    """Explicitly verify: Available Time == SUM(section allocated times)."""

    @pytest.mark.parametrize("target_mins", [10, 15, 20, 30, 45, 60, 90])
    def test_duration_calibration_exact_sum(self, target_mins):
        dummy_sections = [
            {"title": "Section 1", "duration": 10},
            {"title": "Section 2", "duration": 15},
            {"title": "Section 3", "duration": 20},
        ]
        calibrated = lesson_planner._calibrate_durations(dummy_sections, target_mins)
        total = sum(s["duration"] for s in calibrated)
        assert total == target_mins, f"Expected total {target_mins}, got {total}"
        for s in calibrated:
            assert s["duration"] >= 3
            assert s["allocated_time_minutes"] == s["duration"]

    def test_determine_optimal_section_count(self):
        assert lesson_planner._determine_optimal_section_count(15, "Balanced") == 2
        assert lesson_planner._determine_optimal_section_count(30, "Balanced") == 3
        assert lesson_planner._determine_optimal_section_count(45, "Deep dive") == 4
        assert lesson_planner._determine_optimal_section_count(60, "Mastery") == 5


class TestDynamicFallback:
    """Verify fallback is genuinely topic-aware and never defaults to hardcoded Ohm's Law."""

    @pytest.mark.parametrize("topic", [
        "Photosynthesis",
        "Newton's Laws of Motion",
        "Python Asyncio",
        "Linear Regression in Machine Learning",
        "Ancient Roman Architecture"
    ])
    def test_fallback_topic_awareness(self, topic):
        fallback = lesson_planner._build_dynamic_fallback(
            topic=topic,
            level="High School",
            goal="Foundational understanding",
            style="Socratic",
            total_mins=30,
            depth="Balanced",
            language="English"
        )
        assert topic.lower() in fallback["title"].lower()
        assert topic.lower() in fallback["overview"].lower()
        assert len(fallback["sections"]) >= 2
        total_time = sum(s["duration"] for s in fallback["sections"])
        assert total_time == 30
        for sec in fallback["sections"]:
            assert topic.lower() in sec["title"].lower() or topic.lower() in sec["explanation"].lower() or topic.lower() in sec["question"].lower()
            assert "visual_data" in sec

    def test_fallback_scales_with_time(self):
        for mins in [15, 30, 45, 60]:
            fallback = lesson_planner._build_dynamic_fallback(
                topic="Quantum Entanglement",
                level="Undergraduate",
                goal="Concept mastery",
                style="First Principles",
                total_mins=mins,
                depth="Mastery",
                language="English"
            )
            total_time = sum(s["duration"] for s in fallback["sections"])
            assert total_time == mins
            assert fallback["estimated_minutes"] == mins


class TestLessonPlannerAsync:
    """Full async testing of lesson creation with LearningContext and LearnerProfile."""

    def _run(self, coro):
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()

    def test_create_plan_with_learning_context(self):
        ctx = LearningContext(
            session_id="test_sess_001",
            topic="Photosynthesis",
            learner_profile=LearnerProfileNormalized(
                education_level="High School",
                learning_goal="Master light reactions and Calvin cycle",
                language="English",
                teaching_style="Visual",
                available_time_minutes=30,
                desired_depth="Balanced"
            ),
            knowledge_source=KnowledgeSource(type="topic", documents=[]),
            topic_understanding=TopicUnderstanding(
                summary="Photosynthesis is the process of converting light energy into chemical energy.",
                core_concepts=["Light-Dependent Reactions", "Calvin Cycle", "Chloroplast Anatomy"],
                prerequisites=["Basic cell structure", "Energy carriers"],
                source_type="general_knowledge"
            ),
            retrieved_context=[],
            teaching_constraints=TeachingConstraints(
                language="English",
                style="Visual",
                time_minutes=30,
                depth="Balanced"
            ),
            formatted_rag_context="[General Topic Knowledge]\nTopic: Photosynthesis"
        )

        plan = self._run(lesson_planner.create_plan(
            topic="Photosynthesis",
            learning_context=ctx,
            session_id="test_sess_001"
        ))

        assert plan["topic"] == "Photosynthesis"
        assert plan["session_id"] == "test_sess_001"
        assert len(plan["sections"]) >= 2
        total_time = sum(s["duration"] for s in plan["sections"])
        assert total_time == 30
        assert "markdown_curriculum" in plan
        assert len(plan["markdown_curriculum"]) > 100

        # Validate with Pydantic
        validated = LessonPlanResponse(**plan)
        assert validated.topic == "Photosynthesis"
        assert validated.estimated_minutes == 30

    def test_create_plan_rag_grounded(self):
        chunks = [
            RetrievedChunk(
                chunk_id="c1",
                text="Ohm's law states that current through a conductor is proportional to potential difference.",
                source="Physics_Chapter_4.pdf",
                page=42,
                citation="Physics Chapter 4, Page 42"
            )
        ]
        ctx = LearningContext(
            session_id="test_sess_rag",
            topic="Electricity and Ohm's Law",
            learner_profile=LearnerProfileNormalized(
                education_level="Undergraduate",
                learning_goal="Exam preparation",
                language="English",
                teaching_style="First Principles",
                available_time_minutes=45,
                desired_depth="Deep dive"
            ),
            knowledge_source=KnowledgeSource(
                type="uploaded_material",
                documents=[{"id": "doc_123"}],
                grounding_available=True
            ),
            topic_understanding=TopicUnderstanding(
                summary="Study of electric circuits based on uploaded notes.",
                core_concepts=["Potential Difference", "Charge Drift Velocity", "Material Resistivity"],
                source_type="uploaded_material"
            ),
            retrieved_context=chunks,
            teaching_constraints=TeachingConstraints(
                language="English",
                style="First Principles",
                time_minutes=45,
                depth="Deep dive"
            ),
            formatted_rag_context="[Physics Chapter 4, Page 42]\nOhm's law states that current..."
        )

        plan = self._run(lesson_planner.create_plan(
            topic="Electricity and Ohm's Law",
            learning_context=ctx,
            session_id="test_sess_rag"
        ))

        assert plan["source_type"] == "uploaded_material"
        total_time = sum(s["duration"] for s in plan["sections"])
        assert total_time == 45
        assert len(plan["sections"]) >= 3

    def test_create_plan_teaching_styles(self):
        styles = ["Socratic", "First Principles", "Project-Based", "Storytelling", "Direct Instruction", "Visual"]
        for style in styles:
            profile = LearnerProfileSchema(
                education_level="Undergraduate",
                learning_goal="Foundational understanding",
                preferred_language="English",
                teaching_style=style,
                available_time="20 minutes",
                desired_depth="Balanced"
            )
            plan = self._run(lesson_planner.create_plan(
                topic="Sorting Algorithms",
                profile=profile
            ))
            assert plan["teaching_style"] == style
            assert sum(s["duration"] for s in plan["sections"]) == 20

    def test_create_plan_hindi_language(self):
        profile = LearnerProfileSchema(
            education_level="High School",
            learning_goal="Exam preparation",
            preferred_language="Hindi",
            teaching_style="Socratic",
            available_time="30 minutes",
            desired_depth="Balanced"
        )
        plan = self._run(lesson_planner.create_plan(
            topic="गुरुत्वाकर्षण (Gravity)",
            profile=profile
        ))
        assert plan["language"] == "Hindi"
        assert sum(s["duration"] for s in plan["sections"]) == 30


class TestSchemaValidation:
    """Test strict Pydantic schemas for Lesson Planning."""

    def test_lesson_plan_request_validation(self):
        req = LessonPlanRequest(
            topic="Machine Learning",
            session_id="sess_123",
            profile=LearnerProfileSchema(
                education_level="Professional",
                learning_goal="Practical skill acquisition",
                preferred_language="English",
                teaching_style="Project-Based",
                available_time="60 minutes",
                desired_depth="Mastery"
            )
        )
        assert req.topic == "Machine Learning"
        assert req.profile.available_time == "60 minutes"

    def test_section_schema_validation(self):
        sec = SectionSchema(
            id="sec_1",
            title="Section 1: Foundations",
            duration=15,
            section_objective="Understand fundamentals",
            concepts=["Concept 1", "Concept 2"],
            visual_type="diagram",
            visual_description="System architecture block diagram",
            question="What is the key principle?",
            expected_answer="Mastery answer",
            expected_reasoning="Causal logic"
        )
        assert sec.duration == 15
        assert sec.visual_type == "diagram"
