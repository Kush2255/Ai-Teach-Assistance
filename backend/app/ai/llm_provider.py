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
        self.provider = settings.DEFAULT_LLM_PROVIDER.lower()

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generates plain text response using available provider or fallback."""
        if self.provider == "gemini" and self.gemini_key:
            try:
                return await self._call_gemini(prompt, system_prompt)
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Falling back to smart engine.")
        
        if self.openai_key:
            try:
                return await self._call_openai(prompt, system_prompt)
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}. Falling back to smart engine.")

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
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_key}"
        contents = []
        if system_prompt:
            contents.append({"role": "user", "parts": [{"text": f"System Instruction: {system_prompt}"}]})
            contents.append({"role": "model", "parts": [{"text": "Understood. I will follow these instructions."}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json={"contents": contents})
            resp.raise_for_status()
            data = resp.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

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

    def _generate_fallback(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Smart local fallback response generator for offline execution."""
        prompt_lower = prompt.lower()
        if "lesson plan" in prompt_lower or "curriculum" in prompt_lower:
            return json.dumps({
                "title": "Interactive Fundamentals Lesson",
                "objective": "Master key principles through interactive explanations, visual diagrams, and real-time conceptual questions.",
                "estimated_minutes": 20,
                "difficulty": "beginner",
                "sections": [
                    {
                        "id": "section_1",
                        "title": "Core Concepts & Fundamentals",
                        "duration": 5,
                        "explanation": "Welcome! Today we explore fundamental rules. Notice how variables interact under different conditions.",
                        "concepts": ["Basic Definitions", "Core Principles"],
                        "examples": ["Water flow analogy", "Simple electrical circuit"],
                        "visual_type": "graph",
                        "visual_data": {"title": "Voltage vs Current Curve", "x_label": "Current (I)", "y_label": "Voltage (V)"},
                        "question": "What happens to the current flowing through a circuit when resistance increases while voltage remains constant?",
                        "question_type": "conceptual",
                        "expected_answer": "Current decreases because resistance opposes the flow of electrons."
                    },
                    {
                        "id": "section_2",
                        "title": "Practical Application & Formula Derivation",
                        "duration": 8,
                        "explanation": "Let's translate principles into quantitative relationships using step-by-step mathematical reasoning.",
                        "concepts": ["Formula Derivation", "Unit Conversions"],
                        "examples": ["Calculating current in a 12V system with 4 Ohm resistor"],
                        "visual_type": "equation",
                        "visual_data": {"equation": "V = I \\times R", "explanation": "Voltage equals Current multiplied by Resistance"},
                        "question": "If Voltage is 12V and Resistance is 4 Ohms, what is the Current?",
                        "question_type": "problem_solving",
                        "expected_answer": "3 Amperes (I = V / R = 12 / 4 = 3A)"
                    }
                ]
            })
        elif "misconception" in prompt_lower or "evaluate" in prompt_lower:
            if "increase" in prompt_lower and ("resistance" in prompt_lower or "current" in prompt_lower):
                return json.dumps({
                    "correct": False,
                    "confidence": 0.94,
                    "detected_misconception": "Student incorrectly believes current increases when resistance increases.",
                    "severity": "high",
                    "feedback": "You're thinking about flow, but remember resistance works against electrical current. Think of a narrow pipe: higher friction/resistance slows down the flow of water!",
                    "recommended_strategy": "analogy",
                    "next_question": "If you squeeze a water hose tighter (increasing resistance), does less water or more water flow out per second?",
                    "mastery_score": 0.35
                })
            else:
                return json.dumps({
                    "correct": True,
                    "confidence": 0.92,
                    "detected_misconception": None,
                    "severity": None,
                    "feedback": "Excellent reasoning! You correctly identified the inverse relationship.",
                    "recommended_strategy": "direct",
                    "next_question": "Now, how does doubling the voltage affect the current if resistance stays constant?",
                    "mastery_score": 0.85
                })
        return "I am your AI Educator. Let's work step-by-step to master this concept thoroughly!"

llm_client = LLMProvider()
