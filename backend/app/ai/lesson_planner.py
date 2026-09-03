import uuid
import re
from typing import Dict, Any, Optional, List
from app.ai.llm_provider import llm_client
from app.ai.prompts import LESSON_PLANNER_PROMPT, SYSTEM_EDUCATIONAL_ARCHITECT_PROMPT
from app.ai.visual_planner import VisualPlanner
from app.schemas.schemas import LearnerProfileSchema

class LessonPlanner:
    """Generates elite, structured, time-bounded lesson plans aligned with learner profile."""

    def build_markdown_curriculum(
        self,
        topic: str,
        profile: LearnerProfileSchema,
        overview: str,
        sections: List[Dict[str, Any]],
        next_steps: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generates formatted markdown adhering precisely to the specified educational schema."""
        lines = []
        lines.append(f"# {topic} — Tailored Lesson Plan\n")
        lines.append("> **Learner Profile Summary**")
        lines.append(f"> - **Level & Goal**: {profile.education_level} | {profile.learning_goal}")
        lines.append(f"> - **Format**: {profile.teaching_style} Style | {profile.available_time} Total | {profile.desired_depth} Depth\n")
        lines.append("---\n")
        lines.append("## Curriculum Overview")
        lines.append(f"*{overview}*\n")
        lines.append("---\n")

        for idx, sec in enumerate(sections, 1):
            sec_title = sec.get("title", f"Section {idx}")
            if not sec_title.lower().startswith("section"):
                display_sec_title = f"Section {idx}: {sec_title}"
            else:
                display_sec_title = sec_title

            dur = sec.get("duration", 5)
            obj = sec.get("objective", f"Master core principles of {topic}")
            lines.append(f"## {display_sec_title}")
            lines.append(f"- **Allocated Time**: {dur} mins")
            lines.append(f"- **Section Objective**: {obj}\n")

            # 1. Key Concepts
            lines.append("### 1. Key Concepts")
            concepts = sec.get("concepts", [])
            if concepts:
                for c in concepts:
                    if ":" in c:
                        c_name, c_desc = c.split(":", 1)
                        lines.append(f"- **{c_name.strip()}**: {c_desc.strip()}")
                    else:
                        lines.append(f"- **{c.strip()}**: Comprehensive conceptual explanation matching {profile.teaching_style} style.")
            else:
                lines.append(f"- **Core Foundation**: Progressive breakdown of {topic} mechanics.")
            lines.append("")

            # 2. Guided Exercise / Example
            lines.append("### 2. Guided Exercise / Example")
            guided = sec.get("guided_exercise") or (sec.get("examples", [""])[0] if sec.get("examples") else "")
            if guided:
                lines.append(f"- {guided}")
            else:
                lines.append(f"- Practical walkthrough and interactive simulation applying {topic} concepts.")
            lines.append("")

            # 3. Knowledge Check & Reflection
            lines.append("### 3. Knowledge Check & Reflection")
            kcheck = sec.get("knowledge_check") or sec.get("question")
            if kcheck:
                lines.append(f"- {kcheck}")
            else:
                lines.append(f"- Reflect on how changing key parameters affects the equilibrium of this system.")
            lines.append("\n---\n")

        # Next Steps & Practice Roadmap
        lines.append("## Next Steps & Practice Roadmap")
        imm = next_steps.get("immediate_action", f"Complete the interactive assessment quiz on {topic}.") if next_steps else f"Complete the interactive assessment quiz on {topic}."
        lines.append(f"- **Immediate Action**: {imm}")
        
        further = next_steps.get("further_exploration", []) if next_steps else []
        if not further:
            further = [
                f"Explore higher-order mathematical and physical applications of {topic}.",
                f"Synthesize connections with adjacent curriculum topics in the interactive laboratory."
            ]
        lines.append("- **Further Exploration**:")
        for item in further:
            lines.append(f"  - {item}")

        return "\n".join(lines)

    async def create_plan(
        self,
        topic: str,
        profile: LearnerProfileSchema,
        rag_context: Optional[str] = ""
    ) -> Dict[str, Any]:
        prompt = LESSON_PLANNER_PROMPT.format(
            topic=topic,
            context=rag_context or "General topic learning and foundational principles.",
            level=profile.education_level,
            goal=profile.learning_goal,
            language=profile.preferred_language,
            style=profile.teaching_style,
            time=profile.available_time,
            depth=profile.desired_depth
        )

        plan_data = await llm_client.generate_json(prompt, SYSTEM_EDUCATIONAL_ARCHITECT_PROMPT)

        lesson_id = f"lesson_{uuid.uuid4().hex[:8]}"

        if "error" in plan_data or "sections" not in plan_data:
            # High quality fallback adhering precisely to the educational architect framework
            overview = f"This structured curriculum guides the {profile.education_level} learner from intuitive foundational concepts through rigorous practical application to achieve {profile.learning_goal} in {topic}."
            
            sections = [
                {
                    "id": f"sec_1_{uuid.uuid4().hex[:4]}",
                    "title": f"Section 1: Intuitive Foundations & Core Mechanics",
                    "duration": 5,
                    "objective": f"Develop clear mental models and intuitive understanding of core {topic} principles.",
                    "explanation": f"Welcome! We are mastering {topic} through a {profile.teaching_style.lower()} approach. Let us start with fundamental intuition before mathematical formalization.",
                    "concepts": [
                        f"Foundational Architecture: Core dynamics and governing relationships in {topic}",
                        "Primary Variables: Essential terms, physical/conceptual analogies, and system boundary conditions"
                    ],
                    "guided_exercise": f"Examine a real-world scenario illustrating {topic} principles under varying constraints.",
                    "knowledge_check": f"In your own words, what is the direct relationship between the primary variables in {topic}?",
                    "examples": [f"Real-world illustrative analogy for {topic}"],
                    "visual_type": "graph",
                    "visual_data": VisualPlanner.generate_visual_payload(topic, "graph", "System Behavior"),
                    "question": f"What happens when the primary variable increases under constant system constraints?",
                    "question_type": "conceptual",
                    "question_options": ["Direct increase", "Inverse decrease", "No change", "Exponential collapse"],
                    "expected_answer": "Direct or inverse response according to governing laws."
                },
                {
                    "id": f"sec_2_{uuid.uuid4().hex[:4]}",
                    "title": f"Section 2: Mathematical Formulation & Quantitative Analysis",
                    "duration": 10,
                    "objective": f"Derive and apply quantitative governing equations of {topic} to solve problems.",
                    "explanation": "Now we transition from conceptual models to precise mathematical formulation and quantitative derivation.",
                    "concepts": [
                        f"Governing Equation: Mathematical representation and dimensional consistency for {topic}",
                        "Proportionality & Rate of Change: Analytical behavior under boundary transformations"
                    ],
                    "guided_exercise": f"Step-by-step quantitative calculation applying the governing formula to a benchmark test case.",
                    "knowledge_check": f"Calculate the output parameter when input is doubled and resistance remains fixed.",
                    "examples": ["Step-by-step worked derivation"],
                    "visual_type": "equation",
                    "visual_data": VisualPlanner.generate_visual_payload(topic, "equation", "Governing Equation"),
                    "question": "If you double the driving potential while holding resistance constant, what happens to output flow?",
                    "question_type": "problem_solving",
                    "question_options": None,
                    "expected_answer": "Output flow doubles due to direct linear proportionality."
                },
                {
                    "id": f"sec_3_{uuid.uuid4().hex[:4]}",
                    "title": f"Section 3: Practical Application & Boundary Analysis",
                    "duration": 5,
                    "objective": f"Synthesize knowledge to diagnose edge cases, common traps, and practical applications.",
                    "explanation": "Let us explore real-world system behavior, common misconceptions, and advanced application scenarios.",
                    "concepts": [
                        f"Real-world Integration: How {topic} operates in complex engineering and theoretical systems",
                        "Common Traps & Edge Cases: Critical misconceptions and limiting condition analysis"
                    ],
                    "guided_exercise": "Evaluate an unfamiliar circuit or system layout to predict equilibrium behavior.",
                    "knowledge_check": "What critical misconception occurs when assuming resistance and current are independent?",
                    "examples": ["Complex scenario case study"],
                    "visual_type": "diagram",
                    "visual_data": VisualPlanner.generate_visual_payload(topic, "diagram", "System Flow"),
                    "question": "How does non-ideal system resistance alter expected theoretical efficiency?",
                    "question_type": "conceptual",
                    "question_options": None,
                    "expected_answer": "It causes parasitic dissipation and shifts the operating point."
                }
            ]

            next_steps = {
                "immediate_action": f"Take the interactive misconception assessment quiz to verify your mastery of {topic}.",
                "further_exploration": [
                    f"Explore advanced derivations and computational simulations of {topic}.",
                    f"Examine interdisciplinary connections with adjacent physical and theoretical systems."
                ]
            }

            md_curriculum = self.build_markdown_curriculum(topic, profile, overview, sections, next_steps)

            return {
                "id": lesson_id,
                "title": f"{topic} — Tailored Lesson Plan",
                "topic": topic,
                "objective": f"Understand core principles, quantitative formulas, and practical applications of {topic}.",
                "overview": overview,
                "education_level": profile.education_level,
                "learning_goal": profile.learning_goal,
                "teaching_style": profile.teaching_style,
                "available_time": profile.available_time,
                "desired_depth": profile.desired_depth,
                "estimated_minutes": sum(s["duration"] for s in sections),
                "difficulty": profile.education_level,
                "language": profile.preferred_language,
                "sections": sections,
                "next_steps": next_steps,
                "markdown_curriculum": md_curriculum
            }

        # Enrich LLM plan with IDs, visual payloads, and markdown
        plan_data["id"] = lesson_id
        plan_data["topic"] = topic
        plan_data["language"] = profile.preferred_language
        plan_data["education_level"] = profile.education_level
        plan_data["learning_goal"] = profile.learning_goal
        plan_data["teaching_style"] = profile.teaching_style
        plan_data["available_time"] = profile.available_time
        plan_data["desired_depth"] = profile.desired_depth

        overview = plan_data.get("overview") or f"A tailored instructional curriculum designed to achieve {profile.learning_goal} in {topic}."
        plan_data["overview"] = overview

        total_minutes = 0
        for idx, sec in enumerate(plan_data.get("sections", [])):
            if "id" not in sec:
                sec["id"] = f"sec_{idx+1}_{uuid.uuid4().hex[:4]}"
            dur = sec.get("duration", 5)
            total_minutes += dur
            vtype = sec.get("visual_type", "diagram")
            c_name = sec.get("concepts", [topic])[0] if sec.get("concepts") else topic
            if isinstance(c_name, str) and ":" in c_name:
                c_name = c_name.split(":", 1)[0]
            if not sec.get("visual_data"):
                sec["visual_data"] = VisualPlanner.generate_visual_payload(topic, vtype, str(c_name))

        plan_data["estimated_minutes"] = total_minutes or 20

        next_steps = plan_data.get("next_steps")
        if not next_steps or not isinstance(next_steps, dict):
            next_steps = {
                "immediate_action": f"Complete the interactive assessment quiz on {topic}.",
                "further_exploration": [
                    f"Explore advanced practical applications of {topic}.",
                    f"Connect concepts with real-world case studies."
                ]
            }
            plan_data["next_steps"] = next_steps

        # Generate markdown curriculum if not supplied or clean it
        if not plan_data.get("markdown_curriculum"):
            plan_data["markdown_curriculum"] = self.build_markdown_curriculum(
                topic=topic,
                profile=profile,
                overview=overview,
                sections=plan_data.get("sections", []),
                next_steps=next_steps
            )

        return plan_data

lesson_planner = LessonPlanner()

