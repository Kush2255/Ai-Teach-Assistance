"""
AI Teaching Script Engine & Classroom Session Manager (Workflow 4)

Transforms Workflow 3 curriculum into an interactive, synchronized classroom experience:
- Generates realistic, conversational teaching scripts divided into micro-segments
- Synchronizes teacher narration with dynamic educational visuals (formulas, charts, diagrams, timelines, code, process cards)
- Manages classroom playback state, segment progression, and multi-language transitions
- Generates structured handoff state for future evaluation & adaptive workflows (Workflow 5)
"""

import logging
import uuid
from typing import Dict, Any, List, Optional
from app.ai.llm_provider import LLMProvider
from app.ai.visual_planner import VisualPlanner
from app.video.avatar_provider import avatar_provider, get_avatar_provider
from app.schemas.schemas import (
    TeachingSegmentSchema,
    TeachingScriptSchema,
    ClassroomSessionStateResponse,
    ClassroomSegmentResponse,
)

logger = logging.getLogger(__name__)


class TeachingScriptGenerator:
    """Generates structured, natural conversational teaching scripts for lesson sections."""

    def __init__(self, llm_provider: Optional[LLMProvider] = None):
        self.llm = llm_provider or LLMProvider()
        self.visual_planner = VisualPlanner()

    async def generate_script(
        self,
        topic: str,
        section: Dict[str, Any],
        education_level: str = "Undergraduate",
        learning_goal: str = "Foundational understanding",
        teaching_style: str = "Visual",
        language: str = "English",
        desired_depth: str = "Deep dive",
    ) -> TeachingScriptSchema:
        """
        Produce a pedagogically structured teaching sequence for a section.
        Sounds like a real human teacher (dialogue, analogies, verbal guidance to visual aids).
        """
        sec_title = section.get("title", "Concept Overview")
        sec_id = section.get("id", f"sec_{uuid.uuid4().hex[:8]}")
        concepts = section.get("concepts", [])
        explanation = section.get("explanation", "")
        examples = section.get("examples", [])
        vtype = section.get("visual_type", "diagram")
        vdata = section.get("visual_data", {})

        prompt = f"""
You are a world-class, empathetic AI Master Educator delivering a live lesson in the AI Classroom.
Generate a structured, natural, conversational teaching script for the following lesson section.

TOPIC: {topic}
SECTION TITLE: {sec_title}
SECTION CONCEPTS: {', '.join(concepts) if concepts else 'Core topic fundamentals'}
BASE EXPLANATION: {explanation}
EXAMPLES: {', '.join(examples) if examples else 'Standard illustrative examples'}
LEARNER PROFILE:
- Education Level: {education_level}
- Learning Goal: {learning_goal}
- Teaching Style: {teaching_style} (e.g. Visual, Socratic, Practical, Conceptual, Exam-focused)
- Desired Depth: {desired_depth}
- Target Spoken Language: {language}

CRITICAL TEACHING GUIDELINES:
1. Tone & Style: Sound like a passionate, supportive human educator. Do NOT say "Section 1 contains three concepts".
   Say: "Welcome! Let's explore how this works. Before looking at formulas, imagine..."
2. Multi-Language: Generate all narration, titles, and explanations strictly in {language}.
3. Micro-Segmentation: Break the section into 3 to 4 sequential teaching segments:
   - Segment 1: Engaging Introduction & Intuitive Hook (with introductory visual/concept card)
   - Segment 2: Core Concept Breakdown (with formula, diagram, or process visual)
   - Segment 3: Worked Example / Real-World Application (with example/code/graph visual)
   - Segment 4: Synthesis & Key Takeaway Recap (with summary comparison or checklist visual)
4. Dynamic Visual Sync: For each segment, specify the exact visual_type (one of: formula, graph, diagram, timeline, code, process, concept_card, table, flow) and a structured visual_data payload that the frontend can render immediately.
5. Emphasis: Highlight 2-4 critical terms/phrases per segment for subtitle emphasis.

Respond with valid JSON matching this exact structure:
{{
  "section_id": "{sec_id}",
  "section_title": "{sec_title}",
  "introduction": "Engaging conversational teacher opening in {language}...",
  "segments": [
    {{
      "segment_id": "{sec_id}_seg_1",
      "segment_type": "intro",
      "title": "Introduction to Concept",
      "narration": "Teacher speech in {language}...",
      "visual_type": "concept_card",
      "visual_title": "Visual Title",
      "visual_description": "Description of the visual",
      "visual_data": {{ "title": "...", "description": "...", "points": ["..."] }},
      "emphasis": ["key term 1", "key term 2"],
      "duration_seconds": 35
    }},
    {{
      "segment_id": "{sec_id}_seg_2",
      "segment_type": "concept",
      "title": "Detailed Breakdown",
      "narration": "Teacher explanation in {language}...",
      "visual_type": "{vtype}",
      "visual_title": "Visual Title",
      "visual_description": "Description of the visual",
      "visual_data": {{ }},
      "emphasis": ["key principle"],
      "duration_seconds": 50
    }},
    {{
      "segment_id": "{sec_id}_seg_3",
      "segment_type": "example",
      "title": "Worked Example",
      "narration": "Teacher worked example in {language}...",
      "visual_type": "process",
      "visual_title": "Step-by-Step Example",
      "visual_description": "Step by step illustration",
      "visual_data": {{ "steps": ["Step 1...", "Step 2..."] }},
      "emphasis": ["result"],
      "duration_seconds": 45
    }},
    {{
      "segment_id": "{sec_id}_seg_4",
      "segment_type": "recap",
      "title": "Recap & Synthesis",
      "narration": "Teacher concluding recap in {language}...",
      "visual_type": "table",
      "visual_title": "Summary Insights",
      "visual_description": "Key takeaways",
      "visual_data": {{ "headers": ["Concept", "Key Rule"], "rows": [["...", "..."]] }},
      "emphasis": ["summary"],
      "duration_seconds": 30
    }}
  ],
  "example": {{
    "narration": "Detailed walkthrough of the application...",
    "visual_type": "process",
    "content": "Step by step application"
  }},
  "recap": "Concise 2-sentence summary of this section in {language}.",
  "estimated_duration": 160
}}
"""
        try:
            llm_res = await self.llm.generate_json(prompt)
            if isinstance(llm_res, dict) and "segments" in llm_res and len(llm_res["segments"]) > 0:
                # Ensure all segments have visual_data
                for idx, seg in enumerate(llm_res.get("segments", [])):
                    if not seg.get("visual_data"):
                        seg["visual_data"] = self.visual_planner.plan_visual_data(
                            topic=topic,
                            concept=seg.get("title") or concepts[min(idx, len(concepts)-1)] if concepts else sec_title,
                            visual_type=seg.get("visual_type", vtype)
                        )
                return TeachingScriptSchema(**llm_res)
        except Exception as e:
            logger.warning(f"[ClassroomEngine] LLM teaching script generation failed ({e}), using fallback builder.")

        # Deterministic fallback script builder
        return self._build_fallback_script(
            topic=topic,
            section=section,
            sec_id=sec_id,
            sec_title=sec_title,
            concepts=concepts,
            explanation=explanation,
            examples=examples,
            vtype=vtype,
            vdata=vdata,
            language=language,
            teaching_style=teaching_style,
        )

    def _build_fallback_script(
        self,
        topic: str,
        section: Dict[str, Any],
        sec_id: str,
        sec_title: str,
        concepts: List[str],
        explanation: str,
        examples: List[str],
        vtype: str,
        vdata: Dict[str, Any],
        language: str,
        teaching_style: str,
    ) -> TeachingScriptSchema:
        """Deterministic topic-independent script builder."""
        concept_main = concepts[0] if concepts else sec_title
        concept_sec = concepts[1] if len(concepts) > 1 else concept_main
        example_str = examples[0] if examples else f"a practical scenario illustrating {concept_main}"

        # Visual payloads for each micro-segment
        intro_vdata = self.visual_planner.plan_visual_data(topic, concept_main, "concept_card")
        concept_vdata = vdata if vdata else self.visual_planner.plan_visual_data(topic, concept_main, vtype)
        example_vdata = self.visual_planner.plan_visual_data(topic, f"{concept_main} Example", "process")
        recap_vdata = self.visual_planner.plan_visual_data(topic, f"{concept_main} Summary", "table")

        segments = [
            TeachingSegmentSchema(
                segment_id=f"{sec_id}_seg_1",
                segment_type="intro",
                title=f"Introduction: {concept_main}",
                narration=(
                    f"Welcome to our exploration of {sec_title}. Before we dive into the technical details, "
                    f"let's build an intuitive mental model of {concept_main}. Look at the key principles displayed on your screen."
                ),
                visual_type="concept_card",
                visual_title=f"Core Concept: {concept_main}",
                visual_description=f"Overview and foundational definition of {concept_main}",
                visual_data=intro_vdata,
                emphasis=[concept_main, topic],
                duration_seconds=35,
            ),
            TeachingSegmentSchema(
                segment_id=f"{sec_id}_seg_2",
                segment_type="concept",
                title=f"Mechanism & Principles: {concept_sec}",
                narration=(
                    f"{explanation if explanation else f'Here is the core mechanism of {concept_sec}. Notice how each component directly interacts with the system.'} "
                    f"Observe the structure shown on the right."
                ),
                visual_type=vtype,
                visual_title=f"Detailed Model: {sec_title}",
                visual_description=f"Visual representation of {concept_sec}",
                visual_data=concept_vdata,
                emphasis=[concept_sec, "relationship", "mechanism"],
                duration_seconds=55,
            ),
            TeachingSegmentSchema(
                segment_id=f"{sec_id}_seg_3",
                segment_type="example",
                title=f"Real-World Application",
                narration=(
                    f"Let's see this in action with a concrete example. Consider {example_str}. "
                    f"Notice how each step logically follows from the principles we just discussed."
                ),
                visual_type="process",
                visual_title=f"Step-by-Step Walkthrough",
                visual_description=f"Real-world application of {concept_main}",
                visual_data=example_vdata,
                emphasis=["Step 1", "outcome", "application"],
                duration_seconds=45,
            ),
            TeachingSegmentSchema(
                segment_id=f"{sec_id}_seg_4",
                segment_type="recap",
                title=f"Key Takeaways & Synthesis",
                narration=(
                    f"To wrap up this section on {sec_title}, let's review the fundamental rules. "
                    f"Remember: {concept_main} forms the building block for what we will explore next."
                ),
                visual_type="table",
                visual_title=f"Section Summary Matrix",
                visual_description=f"Key insights and comparison points for {sec_title}",
                visual_data=recap_vdata,
                emphasis=["Takeaway", concept_main, "Next Step"],
                duration_seconds=30,
            ),
        ]

        return TeachingScriptSchema(
            section_id=sec_id,
            section_title=sec_title,
            introduction=f"Let's explore {sec_title} together.",
            segments=segments,
            example={
                "narration": f"In this worked example, we apply {concept_main} to {example_str}.",
                "visual_type": "process",
                "content": example_str,
                "visual_data": example_vdata,
            },
            recap=f"We have mastered the essentials of {sec_title}. Next, we will put this knowledge into practice.",
            estimated_duration=165,
        )


class ClassroomSessionManager:
    """State manager for active classroom teaching sessions."""

    def __init__(self):
        self.script_generator = TeachingScriptGenerator()
        # In-memory session store
        self._sessions: Dict[str, Dict[str, Any]] = {}

    async def create_or_resume_session(
        self,
        lesson_data: Dict[str, Any],
        session_id: Optional[str] = None,
        language: Optional[str] = None,
        teaching_style: Optional[str] = None,
    ) -> ClassroomSessionStateResponse:
        """Initialize or retrieve a classroom session from a Workflow 3 lesson plan."""
        lesson_id = lesson_data.get("id", str(uuid.uuid4()))
        sid = session_id or f"classroom_{lesson_id}"
        lang = language or lesson_data.get("language", "English")
        style = teaching_style or lesson_data.get("teaching_style", "Visual")
        topic = lesson_data.get("topic", "General Topic")
        title = lesson_data.get("title", f"Lesson on {topic}")
        sections = lesson_data.get("sections", [])

        if sid in self._sessions:
            session = self._sessions[sid]
            # Update language or style if changed
            if language and language != session["language"]:
                session["language"] = language
            return self._build_session_response(session)

        # Build initial teaching scripts for all sections
        section_scripts: List[TeachingScriptSchema] = []
        for sec in sections:
            script = await self.script_generator.generate_script(
                topic=topic,
                section=sec,
                education_level=lesson_data.get("difficulty", "Undergraduate"),
                learning_goal=lesson_data.get("objective", "Foundational understanding"),
                teaching_style=style,
                language=lang,
                desired_depth=lesson_data.get("desired_depth", "Deep dive"),
            )
            section_scripts.append(script)

        # Provider initialization
        prov = get_avatar_provider()
        prov_status = prov.get_provider_status()

        session = {
            "session_id": sid,
            "lesson_id": lesson_id,
            "topic": topic,
            "title": title,
            "language": lang,
            "teaching_style": style,
            "sections": sections,
            "section_scripts": [s.model_dump() for s in section_scripts],
            "current_section_index": 0,
            "current_segment_index": 0,
            "status": "ready",
            "provider_status": prov_status,
            "history": [],
        }

        self._sessions[sid] = session
        return self._build_session_response(session)

    def get_session_state(self, session_id: str) -> Optional[ClassroomSessionStateResponse]:
        """Fetch current state of classroom session."""
        session = self._sessions.get(session_id)
        if not session:
            return None
        return self._build_session_response(session)

    async def get_segment_payload(
        self,
        session_id: str,
        section_idx: Optional[int] = None,
        segment_idx: Optional[int] = None,
    ) -> Optional[ClassroomSegmentResponse]:
        """Retrieve video, audio, visual and transcript payload for a teaching segment."""
        session = self._sessions.get(session_id)
        if not session:
            return None

        sec_i = section_idx if section_idx is not None else session["current_section_index"]
        seg_i = segment_idx if segment_idx is not None else session["current_segment_index"]

        sec_scripts = session["section_scripts"]
        if sec_i >= len(sec_scripts):
            sec_i = len(sec_scripts) - 1

        target_script = sec_scripts[sec_i]
        segments = target_script.get("segments", [])
        if not segments:
            return None

        if seg_i >= len(segments):
            seg_i = len(segments) - 1

        current_seg_data = segments[seg_i]
        segment_schema = TeachingSegmentSchema(**current_seg_data)

        # Generate teacher video / stream payload
        prov = get_avatar_provider()
        video_payload = prov.generate_teacher_video(
            script=segment_schema.narration,
            language=session["language"],
            visual_cue=segment_schema.visual_type,
            options={
                "teaching_style": session["teaching_style"],
                "topic": session["topic"],
            }
        )

        visual_payload = {
            "type": segment_schema.visual_type,
            "title": segment_schema.visual_title or segment_schema.title,
            "description": segment_schema.visual_description,
            "data": segment_schema.visual_data or {},
            "emphasis": segment_schema.emphasis,
        }

        is_last_seg = (seg_i == len(segments) - 1)
        is_last_sec = (sec_i == len(sec_scripts) - 1) and is_last_seg

        # Structured handoff state for future Workflow 5
        handoff = self._generate_handoff_state(session, sec_i, seg_i, segment_schema, visual_payload)

        # Update session pointer
        session["current_section_index"] = sec_i
        session["current_segment_index"] = seg_i

        return ClassroomSegmentResponse(
            session_id=session_id,
            section_index=sec_i,
            segment_index=seg_i,
            total_segments_in_section=len(segments),
            segment=segment_schema,
            visual=visual_payload,
            video_stream=video_payload.to_dict(),
            captions=segment_schema.narration,
            is_section_completed=is_last_seg,
            is_lesson_completed=is_last_sec,
            handoff_state=handoff,
        )

    async def advance_segment(self, session_id: str) -> Optional[ClassroomSegmentResponse]:
        """Advance to next segment or next section."""
        session = self._sessions.get(session_id)
        if not session:
            return None

        sec_i = session["current_section_index"]
        seg_i = session["current_segment_index"]
        sec_scripts = session["section_scripts"]

        current_script = sec_scripts[sec_i]
        segments = current_script.get("segments", [])

        if seg_i + 1 < len(segments):
            session["current_segment_index"] = seg_i + 1
        elif sec_i + 1 < len(sec_scripts):
            session["current_section_index"] = sec_i + 1
            session["current_segment_index"] = 0
        else:
            session["status"] = "completed"

        return await self.get_segment_payload(
            session_id,
            session["current_section_index"],
            session["current_segment_index"]
        )

    async def previous_segment(self, session_id: str) -> Optional[ClassroomSegmentResponse]:
        """Step back to previous segment or previous section."""
        session = self._sessions.get(session_id)
        if not session:
            return None

        sec_i = session["current_section_index"]
        seg_i = session["current_segment_index"]

        if seg_i > 0:
            session["current_segment_index"] = seg_i - 1
        elif sec_i > 0:
            session["current_section_index"] = sec_i - 1
            prev_script = session["section_scripts"][sec_i - 1]
            session["current_segment_index"] = max(0, len(prev_script.get("segments", [])) - 1)

        return await self.get_segment_payload(
            session_id,
            session["current_section_index"],
            session["current_segment_index"]
        )

    async def jump_to_section(self, session_id: str, section_idx: int) -> Optional[ClassroomSegmentResponse]:
        """Jump to specific section in the curriculum."""
        session = self._sessions.get(session_id)
        if not session:
            return None

        sec_scripts = session["section_scripts"]
        if 0 <= section_idx < len(sec_scripts):
            session["current_section_index"] = section_idx
            session["current_segment_index"] = 0

        return await self.get_segment_payload(
            session_id,
            session["current_section_index"],
            0
        )

    async def switch_language(self, session_id: str, new_language: str) -> Optional[ClassroomSessionStateResponse]:
        """Translate teaching scripts and visuals to new language in real-time."""
        session = self._sessions.get(session_id)
        if not session:
            return None

        session["language"] = new_language
        topic = session["topic"]
        sections = session["sections"]

        # Regenerate scripts in the new language
        new_scripts = []
        for sec in sections:
            script = await self.script_generator.generate_script(
                topic=topic,
                section=sec,
                education_level="Undergraduate",
                learning_goal="Mastery",
                teaching_style=session["teaching_style"],
                language=new_language,
            )
            new_scripts.append(script)

        session["section_scripts"] = [s.model_dump() for s in new_scripts]
        return self._build_session_response(session)

    def _generate_handoff_state(
        self,
        session: Dict[str, Any],
        sec_i: int,
        seg_i: int,
        segment: TeachingSegmentSchema,
        visual: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Expose structured handoff data required for Workflow 5 (evaluation/adaptation)."""
        sec = session["sections"][sec_i] if sec_i < len(session["sections"]) else {}
        total_secs = max(1, len(session["sections"]))
        progress = round(((sec_i + (seg_i + 1) / max(1, len(session["section_scripts"][sec_i].get("segments", [1])))) / total_secs) * 100, 1)

        return {
            "lesson_id": session["lesson_id"],
            "session_id": session["session_id"],
            "section_id": sec.get("id", f"sec_{sec_i}"),
            "section_index": sec_i,
            "segment_index": seg_i,
            "concept_id": segment.title or sec.get("title", ""),
            "teaching_segments_completed": seg_i + 1,
            "current_concept": segment.title,
            "explanation": segment.narration,
            "examples": sec.get("examples", []),
            "visual_used": visual,
            "transcript": segment.narration,
            "learner_progress": min(100.0, progress),
            "question_hook": {
                "question": sec.get("question", f"How would you explain {segment.title}?"),
                "question_type": sec.get("question_type", "conceptual"),
                "expected_answer": sec.get("expected_answer", ""),
            }
        }

    def _build_session_response(self, session: Dict[str, Any]) -> ClassroomSessionStateResponse:
        sec_i = session["current_section_index"]
        seg_i = session["current_segment_index"]
        sec_scripts = session["section_scripts"]

        target_script = sec_scripts[sec_i] if sec_i < len(sec_scripts) else (sec_scripts[0] if sec_scripts else {})
        segments = target_script.get("segments", [])
        current_seg_dict = segments[seg_i] if seg_i < len(segments) else (segments[0] if segments else None)
        current_segment = TeachingSegmentSchema(**current_seg_dict) if current_seg_dict else None

        visual = None
        if current_segment:
            visual = {
                "type": current_segment.visual_type,
                "title": current_segment.visual_title or current_segment.title,
                "description": current_segment.visual_description,
                "data": current_segment.visual_data or {},
                "emphasis": current_segment.emphasis,
            }

        total_secs = max(1, len(session["sections"]))
        progress = round(((sec_i + (seg_i + 1) / max(1, len(segments))) / total_secs) * 100, 1)

        sections_summary = []
        for idx, s in enumerate(session["sections"]):
            status = "completed" if idx < sec_i else ("active" if idx == sec_i else "upcoming")
            sections_summary.append({
                "index": idx,
                "id": s.get("id", f"sec_{idx}"),
                "title": s.get("title", f"Section {idx+1}"),
                "duration": s.get("duration", 10),
                "status": status,
                "visual_type": s.get("visual_type", "diagram"),
                "total_segments": len(sec_scripts[idx].get("segments", [])) if idx < len(sec_scripts) else 3,
            })

        handoff = None
        if current_segment and visual:
            handoff = self._generate_handoff_state(session, sec_i, seg_i, current_segment, visual)

        return ClassroomSessionStateResponse(
            session_id=session["session_id"],
            lesson_id=session["lesson_id"],
            topic=session["topic"],
            title=session["title"],
            current_section_index=sec_i,
            current_segment_index=seg_i,
            total_sections=len(session["sections"]),
            total_segments_in_section=len(segments),
            status=session["status"],
            language=session["language"],
            teaching_style=session["teaching_style"],
            teacher_info={
                "name": "Dr. Sarah Adams",
                "role": "Lead AI Professor",
                "avatar_type": "Realistic Digital Human",
                "provider": avatar_provider.get_provider_status().get("provider", "mock"),
            },
            current_section=session["sections"][sec_i] if sec_i < len(session["sections"]) else {},
            current_segment=current_segment,
            visual=visual,
            transcript=[
                {
                    "segment_id": seg.get("segment_id"),
                    "title": seg.get("title"),
                    "text": seg.get("narration"),
                    "type": seg.get("segment_type")
                }
                for seg in segments
            ],
            progress_percentage=min(100.0, progress),
            sections_summary=sections_summary,
            handoff_state=handoff,
        )


# Global singleton instance
classroom_manager = ClassroomSessionManager()
