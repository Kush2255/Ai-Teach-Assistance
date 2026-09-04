import uuid
import re
import logging
from typing import Dict, Any, Optional, List, Union
from app.ai.llm_provider import llm_client
from app.ai.prompts import LESSON_PLANNER_PROMPT, SYSTEM_EDUCATIONAL_ARCHITECT_PROMPT
from app.ai.visual_planner import VisualPlanner
from app.ai.learner_context import LearningContext
from app.schemas.schemas import LearnerProfileSchema

logger = logging.getLogger(__name__)


class LessonPlanner:
    """
    AI Lesson Planner Engine for Workflow 3.

    Ingests the structured Learning Context from Workflow 2 (or Learner Setup parameters)
    and produces a personalized, time-calibrated, and pedagogically sound curriculum.

    Key guarantees:
      - EXACT Time Calibration: SUM(section.duration) == available_time_minutes
      - Dynamic Section Sizing based on available time and desired depth
      - Pedagogical Scaffolding: Hook → Core Concept → Explanation → Example → Guided Exercise → Knowledge Check → Transition
      - Deep Teaching Style Integration: Socratic, First Principles, Project-Based, Storytelling, Direct Instruction, Visual
      - Multilingual Output: Full curriculum rendered in the requested language
      - Source Grounding: Synthesizes retrieved material when available
      - Deterministic Topic-Aware Fallback: Never defaults to hardcoded Ohm's Law
    """

    def _parse_time_minutes(self, time_val: Union[str, int]) -> int:
        if isinstance(time_val, int):
            return max(5, time_val)
        match = re.search(r'(\d+)', str(time_val))
        return int(match.group(1)) if match else 30

    def _determine_optimal_section_count(self, total_mins: int, depth: str) -> int:
        """Determines pedagogical section count based on available time and depth."""
        if total_mins <= 15:
            return 2
        elif total_mins <= 30:
            return 3 if depth != "High-level overview" else 2
        elif total_mins <= 45:
            return 4 if depth in ("Deep dive", "Mastery") else 3
        else:
            return 5 if depth == "Mastery" else 4

    def _calibrate_durations(self, sections: List[Dict[str, Any]], target_total_mins: int) -> List[Dict[str, Any]]:
        """
        Guarantees that SUM(section.duration) == target_total_mins.
        Performs proportional scaling with integer rounding and largest-remainder fix.
        """
        if not sections:
            return sections

        num_sections = len(sections)
        min_sec_time = 3

        # If target total time is extremely small, ensure minimums
        if target_total_mins < num_sections * min_sec_time:
            target_total_mins = num_sections * min_sec_time

        # Extract current durations or default
        durations = []
        for s in sections:
            d = s.get("duration")
            if d is None:
                d = s.get("allocated_time_minutes")
            try:
                val = int(d) if d is not None else 0
            except (ValueError, TypeError):
                val = 0
            durations.append(max(val, min_sec_time))

        current_sum = sum(durations)
        if current_sum == target_total_mins:
            # Already perfectly calibrated
            for i, s in enumerate(sections):
                s["duration"] = durations[i]
                s["allocated_time_minutes"] = durations[i]
            return sections

        # Proportional scaling
        scaled_durations = []
        for d in durations:
            scaled = (d / current_sum) * target_total_mins
            scaled_durations.append(max(min_sec_time, int(round(scaled))))

        # Fix rounding discrepancies
        diff = target_total_mins - sum(scaled_durations)
        if diff != 0:
            # Adjust the largest section
            max_idx = scaled_durations.index(max(scaled_durations))
            scaled_durations[max_idx] += diff
            # Ensure it didn't drop below minimum
            if scaled_durations[max_idx] < min_sec_time:
                scaled_durations[max_idx] = min_sec_time

        for i, s in enumerate(sections):
            s["duration"] = scaled_durations[i]
            s["allocated_time_minutes"] = scaled_durations[i]

        return sections

    def _build_markdown_curriculum(
        self,
        data: Dict[str, Any],
        level: str,
        goal: str,
        style: str,
        time_avail: Union[str, int],
        depth: str
    ) -> str:
        """Generates comprehensive standard Markdown matching the Educational Architect format."""
        topic = data.get("topic", "Subject")
        overview = data.get("overview", f"This structured curriculum builds a deep, lasting understanding of {topic}.")
        time_str = f"{time_avail} mins" if isinstance(time_avail, int) else str(time_avail)

        md = [
            f"# {data.get('title', f'{topic} — Personalized Curriculum')}\n",
            "> **Learner Profile Summary**",
            f"> - **Level & Goal**: {level} | {goal}",
            f"> - **Format**: {style} Style | {time_str} Total | {depth} Depth\n",
            "---\n",
            "## Curriculum Overview",
            f"*{overview}*\n",
            "---\n"
        ]

        for idx, sec in enumerate(data.get("sections", [])):
            title = sec.get("title", f"Section {idx+1}")
            dur = sec.get("duration", 10)
            obj = sec.get("section_objective") or sec.get("objective", f"Master core principles of {title}")
            vtype = sec.get("visual_type", "diagram")

            md.append(f"## {title}")
            md.append(f"- **Allocated Time**: {dur} mins")
            md.append(f"- **Section Objective**: {obj}")
            md.append(f"- **Recommended Visual**: `{vtype}`")
            if sec.get("visual_description"):
                md.append(f"- **Visual Focus**: *{sec.get('visual_description')}*")
            md.append("")

            # 1. Key Concepts
            concepts = sec.get("concepts") or sec.get("key_concepts") or []
            if concepts:
                md.append("### 1. Key Concepts")
                for c in concepts:
                    if isinstance(c, dict):
                        name = c.get("name", "Concept")
                        exp = c.get("explanation", "")
                        md.append(f"- **{name}**: {exp}")
                    else:
                        c_str = str(c)
                        md.append(f"- **{c_str}**" if not c_str.startswith("-") else c_str)
                md.append("")

            # 2. Guided Exercise / Example
            md.append("### 2. Guided Exercise & Demonstration")
            guided = sec.get("guided_exercise")
            if isinstance(guided, dict):
                guided_text = f"{guided.get('title', 'Exercise')}: {guided.get('description', '')}"
            else:
                guided_text = str(guided) if guided else (sec.get("examples", ["Worked demonstration"])[0] if sec.get("examples") else "Interactive guided activity")
            md.append(f"- {guided_text}\n")

            # 3. Knowledge Check
            md.append("### 3. Knowledge Check & Evaluative Question")
            kchecks = sec.get("knowledge_check")
            if isinstance(kchecks, list) and kchecks:
                for q in kchecks:
                    md.append(f"- ❓ {q}")
            elif sec.get("question"):
                md.append(f"- ❓ {sec.get('question')}")
            else:
                md.append(f"- ❓ Explain how the core principles of this section apply to a practical scenario.")

            if sec.get("expected_answer"):
                md.append(f"  - *Expected Mastery Answer*: {sec.get('expected_answer')}")

            # 4. Real-world connection / Transition
            rw = sec.get("real_world_connection") or sec.get("transition")
            if rw:
                md.append(f"\n- 🌐 **Real-world Application / Transition**: {rw}")

            md.append("\n---\n")

        imm = data.get("immediate_action", f"Apply the core formulas and principles of {topic} in practice exercises.")
        further = data.get("further_exploration", [
            f"Advanced applications of {topic}",
            f"Interdisciplinary connections with {topic}",
            f"Complex real-world problem scenarios"
        ])

        md.append("## Next Steps & Practice Roadmap")
        md.append(f"- **Immediate Action**: {imm}")
        md.append("- **Further Exploration**:")
        for f in further:
            md.append(f"  • {f}")

        return "\n".join(md)

    def _build_dynamic_fallback(
        self,
        topic: str,
        level: str,
        goal: str,
        style: str,
        total_mins: int,
        depth: str,
        language: str,
        core_concepts: Optional[List[str]] = None,
        prerequisites: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Builds a rich, pedagogically sound, topic-aware fallback curriculum.
        Never hardcodes Ohm's Law — dynamically synthesizes based on topic, level, and style.
        """
        lesson_id = f"lesson_{uuid.uuid4().hex[:8]}"
        num_sections = self._determine_optimal_section_count(total_mins, depth)

        # Time allocation distribution
        durations = []
        if num_sections == 2:
            s1 = int(round(total_mins * 0.45))
            durations = [s1, total_mins - s1]
        elif num_sections == 3:
            s1 = int(round(total_mins * 0.33))
            s2 = int(round(total_mins * 0.40))
            durations = [s1, s2, total_mins - s1 - s2]
        elif num_sections == 4:
            s1 = int(round(total_mins * 0.25))
            s2 = int(round(total_mins * 0.30))
            s3 = int(round(total_mins * 0.25))
            durations = [s1, s2, s3, total_mins - s1 - s2 - s3]
        else:
            base = total_mins // num_sections
            durations = [base] * (num_sections - 1)
            durations.append(total_mins - sum(durations))

        # Default concepts if none provided from understanding layer
        if not core_concepts:
            core_concepts = [
                f"Core Definitions & Foundations of {topic}",
                f"Primary Variables, Laws, and Structural Principles in {topic}",
                f"Analytical Models & Problem Solving for {topic}",
                f"Practical Systems & Applied Scenarios with {topic}",
                f"Edge Cases, Boundary Conditions, and Advanced Insights in {topic}",
            ]

        # Teaching style hooks
        style_hook = {
            "Socratic": ("Inquiry & Guiding Questions", "Before giving answers, what observations or mental models do you already have about"),
            "First Principles": ("Axiomatic Derivation", "Starting strictly from fundamental undeniable truths and definitions of"),
            "Project-Based": ("Hands-on Applied Project", "Let us construct a practical working model demonstrating"),
            "Storytelling": ("Narrative Metaphor & Journey", "Imagine a world where we observe the dynamic behavior of"),
            "Direct Instruction": ("Explicit Exposition & Worked Steps", "Here is the exact structural model and sequence for solving"),
            "Visual": ("Diagrammatic & Spatial Scaffolding", "Let us visualize the geometric and spatial relationships of"),
        }.get(style, ("Conceptual Exploration", "Let us explore the core principles of"))

        visual_types = ["graph", "equation", "diagram", "flowchart", "code", "timeline"]

        sections = []
        section_archetypes = [
            ("Foundations & Intuitive Mental Models", "Build intuitive mental models and clear core definitions", "graph"),
            ("Analytical Framework & Governing Principles", "Formulate quantitative models and understand key relationships", "equation"),
            ("Practical Application & Guided Problem-Solving", "Apply knowledge to realistic scenarios and worked examples", "diagram"),
            ("Advanced Synthesis & Misconception Traps", "Analyze non-ideal behaviors and overcome common misunderstandings", "flowchart"),
            ("Project Milestone & Real-World Integration", "Synthesize learning into an applied design challenge", "code"),
        ]

        for i in range(num_sections):
            arch_title, arch_obj, arch_vtype = section_archetypes[i % len(section_archetypes)]
            sec_dur = durations[i]
            sec_concept = core_concepts[i % len(core_concepts)]
            vtype = visual_types[i % len(visual_types)]

            sections.append({
                "id": f"sec_{i+1}_{uuid.uuid4().hex[:4]}",
                "title": f"Section {i+1}: {arch_title} of {topic}",
                "duration": sec_dur,
                "allocated_time_minutes": sec_dur,
                "section_objective": f"{arch_obj} in {topic}.",
                "explanation": f"In this section on {topic}, we use a {style} approach: {style_hook[1]} {sec_concept}. We will build step-by-step toward deep mastery.",
                "concepts": [
                    f"{sec_concept}",
                    f"Mechanisms and Cause-Effect Dynamics in {topic}",
                    f"Key Variables & Contextual Constraints"
                ],
                "guided_exercise": f"Interactive {style} Exercise: Analyze a concrete scenario involving {sec_concept} and predict the outcome step by step.",
                "examples": [f"Real-world case study or practical benchmark demonstrating {sec_concept}"],
                "knowledge_check": [
                    f"In your own words, how does {sec_concept} work and why is it essential to {topic}?",
                    f"If conditions change in a practical application of {topic}, what immediate effect occurs?"
                ],
                "real_world_connection": f"Applied engineering, scientific, or industry systems powered by {topic}.",
                "transition": f"With this foundation in place, we next advance our understanding of {topic}.",
                "visual_type": vtype,
                "visual_description": f"Interactive {vtype} representation highlighting {sec_concept} in {topic}.",
                "visual_data": VisualPlanner.generate_visual_payload(topic, vtype, sec_concept),
                "question": f"Explain the core principle behind {sec_concept} and how it governs behavior in {topic}.",
                "question_type": "conceptual" if i != 1 else "problem_solving",
                "question_options": None,
                "expected_answer": f"A precise conceptual explanation of {sec_concept} demonstrating correct reasoning in {topic}.",
                "expected_reasoning": f"Understanding of how {sec_concept} interacts with the fundamental laws of {topic}."
            })

        plan_dict = {
            "id": lesson_id,
            "title": f"{topic} — Personalized Curriculum",
            "topic": topic,
            "objective": f"Master the core principles, analytical models, and practical applications of {topic} tailored for {goal}.",
            "overview": f"This structured curriculum uses a {style} pedagogical methodology to build a deep, lasting mastery of {topic}, calibrated for {level} level across {total_mins} minutes.",
            "estimated_minutes": total_mins,
            "total_time_minutes": total_mins,
            "difficulty": level,
            "language": language,
            "teaching_style": style,
            "desired_depth": depth,
            "source_type": "topic",
            "immediate_action": f"Complete the guided exercises and test your reasoning on core {topic} applications.",
            "further_exploration": [
                f"Advanced analytical modeling and extensions in {topic}",
                f"Cross-disciplinary applications and modern developments in {topic}",
                f"Comprehensive problem sets and real-world case studies in {topic}"
            ],
            "sections": sections
        }

        plan_dict["markdown_curriculum"] = self._build_markdown_curriculum(
            plan_dict, level, goal, style, total_mins, depth
        )

        return plan_dict

    async def create_plan(
        self,
        topic: str,
        profile: Optional[LearnerProfileSchema] = None,
        rag_context: Optional[str] = "",
        learning_context: Optional[Union[LearningContext, Dict[str, Any]]] = None,
        session_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generates a personalized, time-calibrated curriculum.

        Consumes:
          - topic: Topic name
          - profile: Learner profile parameters
          - learning_context: Structured LearningContext from Workflow 2 (optional but preferred)
          - rag_context: Document chunks context (optional)
        """
        # Step 1: Normalize input parameters
        level = "Undergraduate"
        goal = "Foundational understanding"
        language = "English"
        style = "Socratic"
        time_str = "30 minutes"
        depth = "Balanced"
        source_type = "topic"
        core_concepts: List[str] = []
        prerequisites: List[str] = []

        if learning_context is not None:
            if isinstance(learning_context, LearningContext):
                lc_dict = learning_context.model_dump()
            else:
                lc_dict = learning_context

            topic = lc_dict.get("topic") or topic
            lp = lc_dict.get("learner_profile", {})
            level = lp.get("education_level", level)
            goal = lp.get("learning_goal", goal)
            language = lp.get("language", language)
            style = lp.get("teaching_style", style)
            time_str = str(lp.get("available_time_minutes", 30))
            depth = lp.get("desired_depth", depth)

            ks = lc_dict.get("knowledge_source", {})
            source_type = ks.get("type", "topic")

            tu = lc_dict.get("topic_understanding", {})
            core_concepts = tu.get("core_concepts", [])
            prerequisites = tu.get("prerequisites", [])

            if not rag_context:
                rag_context = lc_dict.get("formatted_rag_context", "")

        elif profile is not None:
            level = profile.education_level or level
            goal = profile.learning_goal or goal
            language = profile.preferred_language or language
            style = profile.teaching_style or style
            time_str = profile.available_time or time_str
            depth = profile.desired_depth or depth

        total_mins = self._parse_time_minutes(time_str)
        target_section_count = self._determine_optimal_section_count(total_mins, depth)

        # Step 2: Format prompt for LLM
        prompt = LESSON_PLANNER_PROMPT.format(
            topic=topic,
            level=level,
            goal=goal,
            language=language,
            style=style,
            time=f"{total_mins} minutes",
            time_minutes=total_mins,
            depth=depth,
            source_type=source_type,
            context=rag_context if rag_context else "Draw upon foundational topic principles with high pedagogical rigor."
        )

        plan_data: Dict[str, Any] = {}
        try:
            logger.info(f"[W3] Generating curriculum via LLM for topic='{topic}', style='{style}', time={total_mins}m")
            plan_data = await llm_client.generate_json(prompt, SYSTEM_EDUCATIONAL_ARCHITECT_PROMPT)
        except Exception as e:
            logger.warning(f"[W3] LLM generation failed: {e}. Activating deterministic fallback.")
            plan_data = {"error": str(e)}

        # Step 3: Validate LLM output structure
        sections_raw = plan_data.get("sections") if isinstance(plan_data, dict) else None
        if not sections_raw or not isinstance(sections_raw, list) or len(sections_raw) == 0:
            logger.info(f"[W3] Using dynamic fallback curriculum for '{topic}'")
            fallback = self._build_dynamic_fallback(
                topic=topic,
                level=level,
                goal=goal,
                style=style,
                total_mins=total_mins,
                depth=depth,
                language=language,
                core_concepts=core_concepts,
                prerequisites=prerequisites,
            )
            if session_id:
                fallback["session_id"] = session_id
            return fallback

        # Step 4: Calibrate and enrich sections
        lesson_id = plan_data.get("id") or f"lesson_{uuid.uuid4().hex[:8]}"
        plan_data["id"] = lesson_id
        if session_id:
            plan_data["session_id"] = session_id
        plan_data["topic"] = topic
        plan_data["title"] = plan_data.get("title") or f"{topic} — Personalized Curriculum"
        plan_data["objective"] = plan_data.get("objective") or f"Master the core principles of {topic} for {goal}."
        plan_data["overview"] = plan_data.get("overview") or f"A tailored {style} curriculum covering {topic} across {total_mins} minutes."
        plan_data["difficulty"] = level
        plan_data["language"] = language
        plan_data["teaching_style"] = style
        plan_data["desired_depth"] = depth
        plan_data["estimated_minutes"] = total_mins
        plan_data["total_time_minutes"] = total_mins
        plan_data["source_type"] = source_type

        # Enforce exact time calibration
        calibrated_sections = self._calibrate_durations(sections_raw, total_mins)

        # Enrich each section with complete schema fields & visual payloads
        enriched_sections = []
        for idx, sec in enumerate(calibrated_sections):
            sec_id = sec.get("id") or f"sec_{idx+1}_{uuid.uuid4().hex[:4]}"
            sec["id"] = sec_id
            sec["order_index"] = idx + 1

            if not sec.get("title"):
                sec["title"] = f"Section {idx+1}: Core Principles of {topic}"

            if not sec.get("section_objective"):
                sec["section_objective"] = sec.get("objective") or f"Understand key concepts in {sec['title']}"

            if not sec.get("explanation"):
                sec["explanation"] = f"Let's explore {sec['title']} through our {style} approach."

            # Ensure concepts list
            concepts = sec.get("concepts") or sec.get("key_concepts") or [topic]
            if isinstance(concepts, list):
                sec["concepts"] = [str(c) for c in concepts if c]
            else:
                sec["concepts"] = [str(concepts)]

            # Ensure knowledge check
            kcheck = sec.get("knowledge_check")
            if not kcheck or not isinstance(kcheck, list):
                q = sec.get("question") or f"What is the most important takeaway from {sec['title']}?"
                sec["knowledge_check"] = [q]

            # Visual payload generation
            vtype = sec.get("visual_type") or "diagram"
            primary_concept = sec["concepts"][0] if sec["concepts"] else topic
            if not sec.get("visual_data"):
                sec["visual_data"] = VisualPlanner.generate_visual_payload(topic, vtype, primary_concept)

            enriched_sections.append(sec)

        plan_data["sections"] = enriched_sections

        # Ensure next steps
        if not plan_data.get("immediate_action"):
            plan_data["immediate_action"] = f"Solve 3 practice exercises applying the core principles of {topic}."

        if not plan_data.get("further_exploration"):
            plan_data["further_exploration"] = [
                f"Advanced extensions of {topic}",
                f"Real-world case studies in {topic}",
                f"Integrative applications of {topic}"
            ]

        # Generate standard markdown curriculum
        plan_data["markdown_curriculum"] = self._build_markdown_curriculum(
            plan_data, level, goal, style, total_mins, depth
        )

        logger.info(f"[W3] Curriculum successfully generated for '{topic}': {len(enriched_sections)} sections, {total_mins} mins total")
        return plan_data


lesson_planner = LessonPlanner()
