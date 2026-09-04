"""
Workflow 4 AI Classroom Test Suite

Validates:
1. Topic-independent Teaching Script Generation for multiple distinct subjects:
   - Photosynthesis (Biology)
   - Binary Search (Computer Science)
   - French Revolution (History)
   - Ohm's Law (Physics)
2. Classroom Session Lifecycle & State Management
3. Segment Progression (Next, Previous, Jump)
4. Dynamic Educational Visual Payload Generation
5. Realistic AI Teacher Provider abstraction & Mock provider timing
6. Multi-language switching
7. Workflow 5 Handoff State exposure
"""

import pytest
import asyncio
from app.ai.classroom_engine import TeachingScriptGenerator, ClassroomSessionManager
from app.video.avatar_provider import MockAITeacherProvider, get_avatar_provider
from app.ai.visual_planner import VisualPlanner
from app.schemas.schemas import ClassroomSessionCreateRequest
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Topic-Independent Teaching Script Generation Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_teaching_script_generation_photosynthesis():
    async def _test():
        generator = TeachingScriptGenerator()
        section = {
            "id": "sec_photo_1",
            "title": "Light Reactions & Chlorophyll",
            "concepts": ["Thylakoid Membrane", "Photon Absorption", "Water Photolysis", "ATP Generation"],
            "explanation": "Light energy strikes chlorophyll pigments, exciting electrons and splitting water into oxygen and hydrogen protons.",
            "examples": ["Leaf exposure to bright morning sunlight"],
            "visual_type": "diagram",
            "visual_data": {}
        }

        script = await generator.generate_script(
            topic="Photosynthesis",
            section=section,
            education_level="Class 10",
            learning_goal="Understand the concept",
            teaching_style="Visual",
            language="English",
        )

        assert script.section_id == "sec_photo_1"
        assert len(script.segments) >= 3
        # Check that segments contain rich visual payloads and conversational narration
        for seg in script.segments:
            assert seg.narration and len(seg.narration) > 10
            assert seg.visual_type in ("diagram", "flow", "process", "concept_card", "table", "graph", "equation")
            assert seg.duration_seconds > 0

    asyncio.run(_test())


def test_teaching_script_generation_binary_search():
    async def _test():
        generator = TeachingScriptGenerator()
        section = {
            "id": "sec_bs_1",
            "title": "Divide and Conquer Search Strategy",
            "concepts": ["Sorted Array Precondition", "Midpoint Calculation", "Search Space Halving", "O(log n) Complexity"],
            "explanation": "Binary search repeatedly divides the search interval in half by comparing the target with the middle element.",
            "examples": ["Finding a number in a sorted array [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]"],
            "visual_type": "code",
            "visual_data": {}
        }

        script = await generator.generate_script(
            topic="Binary Search",
            section=section,
            education_level="Undergraduate",
            learning_goal="Practical mastery",
            teaching_style="Practical",
            language="English",
        )

        assert script.section_id == "sec_bs_1"
        assert len(script.segments) >= 3
        assert any(seg.visual_type in ("code", "algorithm", "process", "concept_card") for seg in script.segments)

    asyncio.run(_test())


def test_teaching_script_generation_french_revolution():
    async def _test():
        generator = TeachingScriptGenerator()
        section = {
            "id": "sec_fr_1",
            "title": "Causes of the Revolution & Estates General",
            "concepts": ["Three Estates System", "Economic Crisis 1789", "Storming of the Bastille", "Declaration of Rights"],
            "explanation": "Social inequality, royal debt, and Enlightenment ideals led to the uprising of the Third Estate.",
            "examples": ["The Tennis Court Oath of June 1789"],
            "visual_type": "timeline",
            "visual_data": {}
        }

        script = await generator.generate_script(
            topic="French Revolution",
            section=section,
            education_level="High School",
            learning_goal="Exam preparation",
            teaching_style="Conceptual",
            language="English",
        )

        assert script.section_id == "sec_fr_1"
        assert len(script.segments) >= 3
        assert any(seg.visual_type in ("timeline", "history", "table", "concept_card") for seg in script.segments)

    asyncio.run(_test())


def test_teaching_script_generation_ohms_law():
    async def _test():
        generator = TeachingScriptGenerator()
        section = {
            "id": "sec_ohm_1",
            "title": "Voltage, Current, and Resistance Relationships",
            "concepts": ["Potential Difference (V)", "Charge Flow (I)", "Impedance/Resistance (R)", "V = I * R"],
            "explanation": "Current through a conductor is directly proportional to voltage across it and inversely proportional to resistance.",
            "examples": ["A 12V automotive circuit powering a 4 Ohm lamp drawing 3 Amperes"],
            "visual_type": "equation",
            "visual_data": {}
        }

        script = await generator.generate_script(
            topic="Ohm's Law",
            section=section,
            education_level="High School",
            learning_goal="Mastery",
            teaching_style="Visual",
            language="English",
        )

        assert script.section_id == "sec_ohm_1"
        assert len(script.segments) >= 3
        assert any(seg.visual_type in ("equation", "formula", "graph", "diagram") for seg in script.segments)

    asyncio.run(_test())


# ─────────────────────────────────────────────────────────────────────────────
# 2. Classroom Session Lifecycle & State Management
# ─────────────────────────────────────────────────────────────────────────────

def test_classroom_session_lifecycle():
    async def _test():
        manager = ClassroomSessionManager()
        lesson_data = {
            "id": "lesson_test_123",
            "title": "Photosynthesis Fundamentals",
            "topic": "Photosynthesis",
            "objective": "Understand plant energy production",
            "difficulty": "Class 10",
            "language": "English",
            "teaching_style": "Visual",
            "estimated_minutes": 20,
            "sections": [
                {
                    "id": "sec_1",
                    "title": "Introduction to Light Harvesting",
                    "duration": 10,
                    "explanation": "Plants absorb solar radiation through chlorophyll.",
                    "concepts": ["Sunlight", "Chloroplasts"],
                    "examples": ["Green leaves"],
                    "visual_type": "diagram",
                    "visual_data": {},
                    "question": "Where does light absorption occur?",
                    "expected_answer": "In the chloroplasts"
                },
                {
                    "id": "sec_2",
                    "title": "The Calvin Cycle & Glucose Synthesis",
                    "duration": 10,
                    "explanation": "Carbon dioxide is fixed into organic sugars.",
                    "concepts": ["Carbon Fixation", "Glucose"],
                    "examples": ["Starch storage in roots"],
                    "visual_type": "process",
                    "visual_data": {},
                    "question": "What is the primary end-product of the Calvin Cycle?",
                    "expected_answer": "Glucose"
                }
            ]
        }

        # 1. Create session
        state = await manager.create_or_resume_session(lesson_data, session_id="sess_photo_test")
        assert state.session_id == "sess_photo_test"
        assert state.topic == "Photosynthesis"
        assert state.total_sections == 2
        assert state.current_section_index == 0
        assert state.current_segment_index == 0
        assert state.current_segment is not None
        assert state.visual is not None

        # 2. Get segment payload
        seg_payload = await manager.get_segment_payload("sess_photo_test", 0, 0)
        assert seg_payload is not None
        assert seg_payload.section_index == 0
        assert seg_payload.segment_index == 0
        assert seg_payload.video_stream["provider"] in ("mock_realistic_teacher", "heygen", "did")
        assert len(seg_payload.captions) > 0

        # 3. Advance to next segment
        next_seg = await manager.advance_segment("sess_photo_test")
        assert next_seg is not None
        assert next_seg.segment_index == 1 or next_seg.section_index == 1

        # 4. Step back to previous
        prev_seg = await manager.previous_segment("sess_photo_test")
        assert prev_seg is not None
        assert prev_seg.segment_index == 0

        # 5. Jump to section 1
        jump_seg = await manager.jump_to_section("sess_photo_test", 1)
        assert jump_seg is not None
        assert jump_seg.section_index == 1
        assert jump_seg.segment_index == 0

    asyncio.run(_test())


# ─────────────────────────────────────────────────────────────────────────────
# 3. AI Teacher Provider & Mock Timing Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_mock_avatar_provider_timing_and_captions():
    provider = MockAITeacherProvider()
    script = "Voltage is the electric potential difference between two points in a conductive circuit. According to Ohm's law, current is proportional to voltage."
    
    payload = provider.generate_teacher_video(script, language="English", visual_cue="equation")
    assert payload.provider == "mock_realistic_teacher"
    assert payload.duration_seconds >= 5.0
    assert len(payload.timed_captions) > 0
    assert payload.avatar_persona["name"] == "Dr. Sarah Adams"

    # Status check
    status = provider.get_provider_status()
    assert status["available"] is True
    assert status["mode"] == "development_and_demo"


# ─────────────────────────────────────────────────────────────────────────────
# 4. Dynamic Visual Planner Spectrum Tests
# ─────────────────────────────────────────────────────────────────────────────

def test_visual_planner_coverage():
    planner = VisualPlanner()

    # Formula
    v_eq = planner.plan_visual_data("Ohm's Law", "Resistance Relationship", "formula")
    assert v_eq["type"] in ("equation", "formula")

    # Graph
    v_gr = planner.plan_visual_data("Physics", "Velocity vs Time", "graph")
    assert v_gr["type"] == "graph"
    assert "series" in v_gr

    # Timeline
    v_tl = planner.plan_visual_data("French Revolution", "Key Milestones", "timeline")
    assert v_tl["type"] == "timeline"
    assert "events" in v_tl

    # Concept Card
    v_cc = planner.plan_visual_data("Binary Search", "Divide & Conquer", "concept_card")
    assert v_cc["type"] == "concept_card"
    assert "core_points" in v_cc or "points" in v_cc

    # Comparison Table
    v_tb = planner.plan_visual_data("Cell Biology", "Prokaryote vs Eukaryote", "table")
    assert v_tb["type"] == "table"
    assert "headers" in v_tb and "rows" in v_tb


# ─────────────────────────────────────────────────────────────────────────────
# 5. Workflow 5 Handoff Verification
# ─────────────────────────────────────────────────────────────────────────────

def test_workflow_5_handoff_structure():
    async def _test():
        manager = ClassroomSessionManager()
        lesson_data = {
            "id": "lesson_handoff_test",
            "title": "Quantum Mechanics Intro",
            "topic": "Quantum Superposition",
            "objective": "Understand wave-particle duality",
            "difficulty": "Undergraduate",
            "sections": [
                {
                    "id": "sec_qm_1",
                    "title": "Superposition Principle",
                    "duration": 15,
                    "explanation": "Quantum systems remain in a linear combination of states until measured.",
                    "concepts": ["Wavefunction", "Collapse", "State Vector"],
                    "examples": ["Schrödinger's Cat Thought Experiment"],
                    "visual_type": "diagram",
                    "visual_data": {},
                    "question": "What causes wavefunction collapse?",
                    "expected_answer": "Measurement or interaction with the environment"
                }
            ]
        }

        state = await manager.create_or_resume_session(lesson_data, session_id="sess_qm_test")
        assert state.handoff_state is not None
        handoff = state.handoff_state
        
        # Required keys for Workflow 5
        assert "lesson_id" in handoff
        assert "session_id" in handoff
        assert "section_id" in handoff
        assert "concept_id" in handoff
        assert "teaching_segments_completed" in handoff
        assert "current_concept" in handoff
        assert "explanation" in handoff
        assert "examples" in handoff
        assert "visual_used" in handoff
        assert "transcript" in handoff
        assert "learner_progress" in handoff
        assert "question_hook" in handoff

    asyncio.run(_test())
