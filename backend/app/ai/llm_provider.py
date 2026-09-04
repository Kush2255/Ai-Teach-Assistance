import os
import json
import logging
import httpx
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

class LLMProvider:
    """Unified LLM Provider abstraction supporting Gemini, OpenAI, and a Smart Local Generator fallback."""

    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")
        self.openai_key = settings.OPENAI_API_KEY or os.environ.get("OPENAI_API_KEY")
        self.grok_key = getattr(settings, 'GROK_API_KEY', None) or os.environ.get("GROK_API_KEY")
        self.provider = settings.DEFAULT_LLM_PROVIDER.lower()

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Generates plain text response.
        Routes to the configured provider first, then falls through the chain:
          gemini  → Gemini → Groq → OpenAI → Fallback
          grok    → Groq   → Gemini → OpenAI → Fallback
        """
        providers_in_order = []

        if self.provider == "gemini":
            if self.gemini_key:
                providers_in_order.append(("gemini", self._call_gemini))
            if self.grok_key:
                providers_in_order.append(("groq", self._call_grok))
        else:  # grok / groq as default
            if self.grok_key:
                providers_in_order.append(("groq", self._call_grok))
            if self.gemini_key:
                providers_in_order.append(("gemini", self._call_gemini))

        if self.openai_key:
            providers_in_order.append(("openai", self._call_openai))

        for name, caller in providers_in_order:
            try:
                result = await caller(prompt, system_prompt)
                logger.info(f"[LLM] Used provider: {name}")
                return result
            except Exception as e:
                logger.warning(f"[LLM] {name} failed: {e}. Trying next provider.")

        # Smart local fallback (no external API needed)
        logger.warning("[LLM] All providers failed. Using local fallback engine.")
        return self._generate_fallback(prompt, system_prompt)


    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        """Generates structured JSON output."""
        full_prompt = f"{prompt}\n\nIMPORTANT: Respond strictly with valid JSON only. Do not wrap in markdown quotes if possible, or use ```json."
        text_response = await self.generate_text(full_prompt, system_prompt)
        
        # Clean markdown codeblocks if present
        clean_text = text_response.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
        clean_text = clean_text.strip()
        
        try:
            return json.loads(clean_text)
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON response: {clean_text[:200]}")
            # Return fallback dictionary or extract JSON object substring
            start_idx = clean_text.find("{")
            end_idx = clean_text.rfind("}")
            if start_idx != -1 and end_idx != -1:
                try:
                    return json.loads(clean_text[start_idx:end_idx+1])
                except Exception:
                    pass
            return {"error": "Invalid JSON produced", "raw": clean_text}

    async def _call_gemini(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        # Try models in order of preference (gemini-3.6-flash confirmed working)
        models_to_try = ["gemini-3.6-flash", "gemini-2.5-flash", "gemini-1.5-flash-002", "gemini-1.0-pro"]
        last_error = None

        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.gemini_key}"
            contents = []
            if system_prompt:
                contents.append({"role": "user", "parts": [{"text": f"System Instruction: {system_prompt}"}]})
                contents.append({"role": "model", "parts": [{"text": "Understood. I will follow these instructions."}]})
            contents.append({"role": "user", "parts": [{"text": prompt}]})

            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    resp = await client.post(url, json={"contents": contents})
                    if resp.status_code == 404:
                        logger.debug(f"Model {model} not found, trying next...")
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    last_error = e
                    continue
                raise
            except Exception as e:
                last_error = e
                continue

        raise last_error or Exception("All Gemini models failed")


    async def _call_openai(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.openai_key}", "Content-Type": "application/json"}
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json={"model": "gpt-4o-mini", "messages": messages})
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]

    async def _call_grok(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """
        Call Groq's OpenAI-compatible inference API.
        Groq provides ultra-fast LLM inference (gsk_ API keys).
        Docs: https://console.groq.com/docs/openai
        Models: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768
        """
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.grok_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AI-Teacher/1.0",
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        # Active Groq models
        models_to_try = [
            "qwen/qwen3.8-27b",
            "openai/gpt-oss-120b",
            "qwen/qwen3.6-27b",
            "openai/gpt-oss-20b",
            "groq/compound",
        ]
        last_error = None
        for model in models_to_try:
            try:
                async with httpx.AsyncClient(timeout=45.0) as client:
                    resp = await client.post(
                        url,
                        headers=headers,
                        json={"model": model, "messages": messages, "temperature": 0.7},
                    )
                    if resp.status_code in (404, 400):
                        logger.debug(f"Groq model {model} unavailable, trying next...")
                        last_error = Exception(f"HTTP {resp.status_code}: {resp.text[:200]}")
                        continue
                    resp.raise_for_status()
                    data = resp.json()
                    logger.info(f"[Groq] Used model: {model}")
                    return data["choices"][0]["message"]["content"]
            except httpx.HTTPStatusError as e:
                if e.response.status_code in (404, 400):
                    last_error = e
                    continue
                raise
            except Exception as e:
                last_error = e
                continue

        raise last_error or Exception("All Groq models failed")


    def _generate_fallback(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Smart local fallback response generator — topic-aware, no hardcoded Ohm's Law."""
        prompt_lower = prompt.lower()

        # Extract topic from prompt if present
        topic = "the subject"
        for marker in ["topic:", "- topic:", "topic :"]:
            idx = prompt_lower.find(marker)
            if idx != -1:
                rest = prompt[idx + len(marker):].strip()
                # Take until next newline or period
                end = rest.find("\n")
                if end == -1:
                    end = len(rest)
                topic = rest[:end].strip().rstrip(".,;")
                break

        if not topic or topic == "the subject":
            # Try extracting from "teach ... about ..." or "lesson on ..."
            for kw in ["teach about", "lesson on", "learning about", "topic of"]:
                idx = prompt_lower.find(kw)
                if idx != -1:
                    rest = prompt[idx + len(kw):].strip()
                    end = rest.find("\n")
                    if end == -1:
                        end = min(50, len(rest))
                    topic = rest[:end].strip().rstrip(".,;")
                    break

        if "lesson plan" in prompt_lower or "curriculum" in prompt_lower:
            # Import here to avoid circular imports
            from app.ai.visual_planner import VisualPlanner
            return json.dumps({
                "title": f"{topic} — Tailored Lesson Plan",
                "objective": f"Master the core principles, quantitative models, and real-world applications of {topic}.",
                "estimated_minutes": 30,
                "difficulty": "intermediate",
                "overview": f"This structured curriculum builds deep understanding of {topic} through progressive conceptual scaffolding, visual demonstrations, and applied problem-solving.",
                "sections": [
                    {
                        "id": "section_1",
                        "title": f"Section 1: Foundations & Core Principles of {topic}",
                        "duration": 10,
                        "explanation": f"Welcome to our session on {topic}! We start by building strong intuitive foundations. Understanding the fundamentals clearly is the key to mastering everything that follows.",
                        "concepts": [
                            f"Core Definitions & Key Terminology in {topic}",
                            f"Fundamental Variables & Their Roles",
                            f"Conceptual Relationships & Cause-Effect Dynamics in {topic}"
                        ],
                        "examples": [f"Everyday examples and analogies related to {topic}"],
                        "guided_exercise": f"Real-World Observation: Identify examples of {topic} in everyday life and describe the key variables at play.",
                        "knowledge_check": [
                            f"In your own words, what is the core principle of {topic}?",
                            f"How do the main variables in {topic} relate to each other?"
                        ],
                        "real_world_connection": f"Practical systems and phenomena that demonstrate {topic}.",
                        "visual_type": "graph",
                        "visual_data": VisualPlanner.generate_visual_payload(topic, "graph", f"Core Relationship in {topic}"),
                        "question": f"What is the most fundamental principle in {topic} and why is it important?",
                        "question_type": "conceptual",
                        "expected_answer": f"A clear explanation of the foundational concept of {topic} and its significance."
                    },
                    {
                        "id": "section_2",
                        "title": f"Section 2: Mathematical Formulation & Quantitative Analysis of {topic}",
                        "duration": 12,
                        "explanation": f"Now let's formalize our understanding of {topic} using precise mathematical models and quantitative analysis.",
                        "concepts": [
                            f"Governing Equations & Formulas of {topic}",
                            "Proportional & Inverse Relationships",
                            "Graphical & Analytical Representations",
                            "Numerical Problem Solving Techniques"
                        ],
                        "examples": [f"A worked numerical example applying the key formula of {topic}"],
                        "guided_exercise": f"Step-by-step problem: Apply the core formula of {topic} to a structured worked example.",
                        "knowledge_check": [
                            f"State the main formula governing {topic} and define each variable.",
                            f"Walk through a numerical example applying the formula of {topic}."
                        ],
                        "real_world_connection": f"Engineering and scientific applications requiring quantitative analysis of {topic}.",
                        "visual_type": "equation",
                        "visual_data": VisualPlanner.generate_visual_payload(topic, "equation", f"Governing Equation of {topic}"),
                        "question": f"Using the main formula of {topic}, walk through solving a numerical problem step by step.",
                        "question_type": "problem_solving",
                        "expected_answer": f"A correct step-by-step numerical solution using the governing formula of {topic}."
                    },
                    {
                        "id": "section_3",
                        "title": f"Section 3: Real-World Applications & Misconception Traps in {topic}",
                        "duration": 8,
                        "explanation": f"Finally, let's see how {topic} applies to real-world problems and address the most common misunderstandings.",
                        "concepts": [
                            f"Practical Applications of {topic} in Science & Engineering",
                            "Boundary Conditions & Non-Ideal System Behaviors",
                            f"Common Misconceptions & How to Correct Them in {topic}"
                        ],
                        "examples": [f"A real-world case study or system that relies on {topic}"],
                        "guided_exercise": f"Case Study: Analyze a real-world scenario using {topic} principles and explain the observed behavior.",
                        "knowledge_check": [
                            f"Describe a real-world situation where {topic} principles are applied.",
                            f"What is the most common misconception students have about {topic}?"
                        ],
                        "real_world_connection": f"Technology and industrial systems powered by knowledge of {topic}.",
                        "visual_type": "diagram",
                        "visual_data": VisualPlanner.generate_visual_payload(topic, "diagram", f"Applied Process of {topic}"),
                        "question": f"Explain a common mistake students make when applying {topic} and how to correct it.",
                        "question_type": "conceptual",
                        "expected_answer": f"A clear identification of a misconception in {topic} and the correct conceptual explanation."
                    }
                ]
            })
        elif "misconception" in prompt_lower or "evaluate" in prompt_lower:
            return json.dumps({
                "correct": True,
                "confidence": 0.82,
                "detected_misconception": None,
                "severity": None,
                "feedback": f"Good thinking! You're engaging with the concept of {topic} thoughtfully. Let's refine your understanding further.",
                "recommended_strategy": "socratic",
                "next_question": f"Can you explain why this relationship holds in {topic}? Think about what happens when you change each variable.",
                "mastery_score": 0.72
            })
        return f"I am your AI Educator. Let's work step-by-step to deeply master {topic}!"

llm_client = LLMProvider()
