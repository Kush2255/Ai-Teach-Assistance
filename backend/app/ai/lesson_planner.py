import uuid
import re
from typing import Dict, Any, Optional
from app.ai.llm_provider import llm_client
from app.ai.prompts import LESSON_PLANNER_PROMPT, SYSTEM_EDUCATIONAL_ARCHITECT_PROMPT
from app.ai.visual_planner import VisualPlanner
from app.schemas.schemas import LearnerProfileSchema

class LessonPlanner:
    """Generates structured, time-bounded lesson plans aligned with the Educational Architect framework."""

    def _parse_time_minutes(self, time_str: str) -> int:
        match = re.search(r'(\d+)', time_str)
        if match:
            return int(match.group(1))
        return 30

    def _build_markdown_curriculum(self, data: Dict[str, Any], profile: LearnerProfileSchema) -> str:
        topic = data.get("topic", "Subject")
        level = profile.education_level
        goal = profile.learning_goal
        style = profile.teaching_style
        time_avail = profile.available_time
        depth = profile.desired_depth
        overview = data.get("overview", f"This structured curriculum builds a deep, lasting understanding of {topic} through progressive cognitive scaffolding.")

        md = []
        md.append(f"# {topic} — Tailored Lesson Plan\n")
        md.append("> **Learner Profile Summary**")
        md.append(f"> - **Level & Goal**: {level} | {goal}")
        md.append(f"> - **Format**: {style} Style | {time_avail} Total | {depth} Depth\n")
        md.append("---\n")
        md.append("## Curriculum Overview")
        md.append(f"*{overview}*\n")
        md.append("---\n")

        for idx, sec in enumerate(data.get("sections", [])):
            title = sec.get("title", f"Section {idx+1}")
            dur = sec.get("duration", 10)
            obj = sec.get("section_objective", f"Master core principles of {title}")
            
            md.append(f"## {title}")
            md.append(f"- **Allocated Time**: {dur} mins")
            md.append(f"- **Section Objective**: {obj}\n")

            md.append("### 1. Key Concepts")
            for c in sec.get("concepts", []):
                md.append(f"- **{c}**" if not c.startswith("-") else c)
            md.append("")

            md.append("### 2. Guided Exercise / Example")
            guided = sec.get("guided_exercise") or (sec.get("examples", ["Worked demonstration"])[0])
            md.append(f"- {guided}\n")

            md.append("### 3. Knowledge Check & Reflection")
            kchecks = sec.get("knowledge_check") or [sec.get("question", "What is the primary takeaway from this section?")]
            for q in kchecks:
                md.append(f"- {q}")
            md.append("\n---\n")

        imm = data.get("immediate_action", f"Apply the core formulas and principles of {topic} in practice exercises.")
        further = data.get("further_exploration", [f"Advanced applications of {topic}", f"Interdisciplinary connections with {topic}", "Complex problem scenarios"])
        
        md.append("## Next Steps & Practice Roadmap")
        md.append(f"- **Immediate Action**: {imm}")
        md.append("- **Further Exploration**:")
        for f in further:
            md.append(f"  • {f}")

        return "\n".join(md)

    async def create_plan(
        self,
        topic: str,
        profile: LearnerProfileSchema,
        rag_context: Optional[str] = ""
    ) -> Dict[str, Any]:
        prompt = LESSON_PLANNER_PROMPT.format(
            topic=topic,
            context=rag_context or "General topic learning",
            level=profile.education_level,
            goal=profile.learning_goal,
            language=profile.preferred_language,
            style=profile.teaching_style,
            time=profile.available_time,
            depth=profile.desired_depth
        )

        plan_data = await llm_client.generate_json(prompt, SYSTEM_EDUCATIONAL_ARCHITECT_PROMPT)

        total_mins = self._parse_time_minutes(profile.available_time)

        if "error" in plan_data or "sections" not in plan_data:
            # High quality pedagogical fallback plan
            lesson_id = f"lesson_{uuid.uuid4().hex[:8]}"
            sec1_dur = max(5, int(total_mins * 0.33))
            sec2_dur = max(5, int(total_mins * 0.40))
            sec3_dur = max(5, total_mins - sec1_dur - sec2_dur)

            fallback_data = {
                "id": lesson_id,
                "title": f"{topic} — Tailored Lesson Plan",
                "topic": topic,
                "objective": f"Master the intuitive principles, quantitative models, and practical applications of {topic}.",
                "overview": f"This structured curriculum uses intuitive physical analogies and quantitative derivation to build a deep, lasting understanding of {topic} and its real-world applications.",
                "estimated_minutes": total_mins,
                "difficulty": profile.education_level,
                "language": profile.preferred_language,
                "teaching_style": profile.teaching_style,
                "desired_depth": profile.desired_depth,
                "immediate_action": f"Solve 5 practice problems applying {topic} principles to real-world scenarios.",
                "further_exploration": [
                    f"Advanced Derivations & Analytical Frameworks in {topic}",
                    f"Real-world Engineering Case Studies with {topic}",
                    f"Cross-domain Applications & Systems Design"
                ],
                "sections": [
                    {
                        "id": f"sec_1_{uuid.uuid4().hex[:4]}",
                        "title": f"Section 1: Intuitive Physical Foundations & Core Variables",
                        "duration": sec1_dur,
                        "section_objective": f"Establish intuitive mental models and core parameters of {topic}.",
                        "explanation": f"Welcome to our session on {topic}! Today we build intuitive physical foundations before deriving exact mathematical formulas.",
                        "concepts": [
                            f"Potential Driving Force in {topic}",
                            f"Flow Rate & Dynamic Variables",
                            f"Impedance, Resistance & Equilibrium Conditions"
                        ],
                        "guided_exercise": f"Interactive Mental Simulation: Observe how flow changes when opposition increases under fixed driving potential in {topic}.",
                        "examples": ["Fluid dynamic analogy (pressure, flow rate, resistance)"],
                        "knowledge_check": [
                            f"What happens to output flow if resistance doubles while the driving force remains constant?",
                            f"How do you distinguish between potential difference and current flow in {topic}?"
                        ],
                        "real_world_connection": f"Hydraulic power systems and fluid analogies in physical engineering.",
                        "visual_type": "graph",
                        "visual_data": VisualPlanner.generate_visual_payload(topic, "graph", "Core Dynamic Curve"),
                        "question": f"What happens to the current in a circuit when resistance increases while voltage remains constant?",
                        "question_type": "conceptual",
                        "question_options": None,
                        "expected_answer": "Current decreases because resistance opposes the flow according to the inverse relationship (I = V/R)."
                    },
                    {
                        "id": f"sec_2_{uuid.uuid4().hex[:4]}",
                        "title": f"Section 2: Mathematical Formulation & Quantitative Derivation",
                        "duration": sec2_dur,
                        "section_objective": f"Formulate the quantitative laws and compute precise parameter solutions in {topic}.",
                        "explanation": f"Now we derive the governing quantitative equations for {topic} and test them against concrete numerical problems.",
                        "concepts": [
                            f"Mathematical Formulation of {topic}",
                            "Direct vs Inverse Proportionality Relations",
                            "Linear Characteristic Curves & Slope Interpretation",
                            "Boundary Value Constraints"
                        ],
                        "guided_exercise": f"Step-by-step problem breakdown: Calculate required input parameters given system constraints in {topic}.",
                        "examples": ["Automotive electrical sub-system (12V DC, 4Ω load)"],
                        "knowledge_check": [
                            "If the input potential is 12V and the system impedance is 4Ω, calculate the resulting flow rate.",
                            "Why is the V-I characteristic curve linear for ohmic materials?"
                        ],
                        "real_world_connection": "Automotive headlamp and battery power management circuits.",
                        "visual_type": "equation",
                        "visual_data": VisualPlanner.generate_visual_payload(topic, "equation", "Governing Equation"),
                        "question": "If potential V = 12V and resistance R = 4Ω, what is the current I?",
                        "question_type": "problem_solving",
                        "question_options": None,
                        "expected_answer": "3 Amperes (I = V / R = 12 / 4 = 3A)"
                    },
                    {
                        "id": f"sec_3_{uuid.uuid4().hex[:4]}",
                        "title": f"Section 3: Practical Circuit Application & Misconception Traps",
                        "duration": sec3_dur,
                        "section_objective": f"Diagnose common pitfalls, evaluate real-world constraints, and ensure systemic mastery in {topic}.",
                        "explanation": f"Finally, let's explore practical applications of {topic} and deconstruct the most frequent traps students encounter.",
                        "concepts": [
                            "Internal Impedance & Non-ideal System Behaviors",
                            "Load Balancing & Safety Margins",
                            "Common Misconception Traps (e.g. current consumption vs voltage drop)"
                        ],
                        "guided_exercise": f"Real-world circuit diagnostic: Identify faulty components and explain why current behaves counter-intuitively.",
                        "examples": ["Household power outlets and circuit breaker limits"],
                        "knowledge_check": [
                            "Why does current not increase when you add more series resistance to a fixed voltage line?",
                            "How does internal source resistance affect the maximum delivered output?"
                        ],
                        "real_world_connection": "Residential power distribution networks and overload breakers.",
                        "visual_type": "diagram",
                        "visual_data": VisualPlanner.generate_visual_payload(topic, "diagram", "Circuit Architecture"),
                        "question": "Why does adding resistance in series decrease total circuit current?",
                        "question_type": "conceptual",
                        "question_options": None,
                        "expected_answer": "Total resistance increases, which reduces current for a fixed voltage source."
                    }
                ]
            }

            fallback_data["markdown_curriculum"] = self._build_markdown_curriculum(fallback_data, profile)
            return fallback_data

        # Enrich LLM plan
        lesson_id = f"lesson_{uuid.uuid4().hex[:8]}"
        plan_data["id"] = lesson_id
        plan_data["topic"] = topic
        plan_data["language"] = profile.preferred_language
        plan_data["teaching_style"] = profile.teaching_style
        plan_data["desired_depth"] = profile.desired_depth
        plan_data["difficulty"] = profile.education_level
        plan_data["estimated_minutes"] = total_mins
        
        if not plan_data.get("overview"):
            plan_data["overview"] = f"This structured curriculum builds a deep, lasting understanding of {topic} tailored to your {profile.learning_goal} goal."

        for idx, sec in enumerate(plan_data.get("sections", [])):
            if "id" not in sec:
                sec["id"] = f"sec_{idx+1}_{uuid.uuid4().hex[:4]}"
            vtype = sec.get("visual_type", "diagram")
            c_name = sec.get("concepts", [topic])[0] if sec.get("concepts") else topic
            if not sec.get("visual_data"):
                sec["visual_data"] = VisualPlanner.generate_visual_payload(topic, vtype, c_name)

        if not plan_data.get("markdown_curriculum"):
            plan_data["markdown_curriculum"] = self._build_markdown_curriculum(plan_data, profile)

        return plan_data

lesson_planner = LessonPlanner()
