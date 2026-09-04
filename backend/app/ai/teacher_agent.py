import json
from typing import Dict, Any, List, Optional
from app.ai.evaluator import evaluator
from app.ai.llm_provider import llm_client

# ============================================================
# COMPREHENSIVE MULTILINGUAL TRANSLATION TABLES
# Supports: English → Hindi, Hinglish, Telugu
# Works 100% offline without any API keys
# ============================================================

TRANSLATIONS = {
    "Hindi": {
        # Greetings & Teacher phrases
        "Welcome": "स्वागत है",
        "Hello": "नमस्ते",
        "Let": "आइए",
        "Today": "आज",
        "Now": "अब",
        "Great": "बहुत अच्छा",
        "Excellent": "शानदार",
        "Perfect": "परफेक्ट",
        "Good": "अच्छा",
        "Finally": "अंत में",
        "Remember": "याद रखें",
        "Notice": "ध्यान दें",
        "Think": "सोचें",
        "Consider": "विचार करें",
        # Section titles
        "Section 1": "भाग 1",
        "Section 2": "भाग 2",
        "Section 3": "भाग 3",
        "Core Concepts": "मुख्य अवधारणाएँ",
        "Foundations": "बुनियादी तत्त्व",
        "Mathematical Formulation": "गणितीय सूत्रीकरण",
        "Practical Application": "व्यावहारिक अनुप्रयोग",
        "Misconception": "भ्रांति",
        # Physics / Electricity terms
        "Voltage": "वोल्टेज",
        "Current": "विद्युत धारा",
        "Resistance": "प्रतिरोध",
        "Ohm": "ओम",
        "circuit": "सर्किट",
        "electric": "विद्युत",
        "power": "शक्ति",
        "energy": "ऊर्जा",
        "frequency": "आवृत्ति",
        "pressure": "दबाव",
        "force": "बल",
        "gravity": "गुरुत्वाकर्षण",
        # Question words
        "What": "क्या",
        "How": "कैसे",
        "Why": "क्यों",
        "When": "कब",
        "Where": "कहाँ",
        "Which": "कौन सा",
        "Calculate": "गणना करें",
        "Explain": "समझाइए",
        "increases": "बढ़ता है",
        "decreases": "घटता है",
        "constant": "स्थिर",
        "double": "दोगुना",
        # Common teaching phrases
        "I am your AI Teacher": "मैं आपका AI शिक्षक हूँ",
        "Let us": "आइए हम",
        "we will": "हम सीखेंगे",
        "we learn": "हम सीखेंगे",
        "step by step": "चरण दर चरण",
        "real world": "वास्तविक दुनिया",
        "analogy": "उपमा",
        "formula": "सूत्र",
        "equation": "समीकरण",
        "example": "उदाहरण",
        "question": "प्रश्न",
        "answer": "उत्तर",
    },
    "Hinglish": {
        # Kept as transliteration/mix
        "I am your AI Teacher": "Main aapka AI Teacher hoon",
        "Welcome": "Swagat hai",
        "Today": "Aaj",
        "Now": "Ab",
        "Let us": "Chaliye",
        "Great": "Bahut badiya",
        "Excellent": "Shaandaar",
        "step by step": "step by step",
        "real world": "real world mein",
        "formula": "formula",
        "equation": "equation",
        "example": "udaaharan",
        "increases": "badhta hai",
        "decreases": "kam hota hai",
        "constant": "constant",
    },
    "Telugu": {
        "Welcome": "స్వాగతం",
        "Hello": "నమస్కారం",
        "Today": "ఈరోజు",
        "Now": "ఇప్పుడు",
        "Let us": "మనం",
        "we will": "నేర్చుకుందాం",
        "Great": "చాలా బాగుంది",
        "Excellent": "అద్భుతంగా",
        "Perfect": "సరిగ్గా",
        "I am your AI Teacher": "నేను మీ AI ఉపాధ్యాయుడిని",
        "Voltage": "వోల్టేజ్",
        "Current": "కరెంట్",
        "Resistance": "నిరోధం",
        "circuit": "సర్క్యూట్",
        "electric": "విద్యుత్",
        "increases": "పెరుగుతుంది",
        "decreases": "తగ్గుతుంది",
        "constant": "స్థిరంగా",
        "formula": "సూత్రం",
        "equation": "సమీకరణం",
        "example": "ఉదాహరణ",
        "step by step": "దశలవారీగా",
        "real world": "నిజ జీవితంలో",
    }
}

# Full section templates for the Ohm's Law / Electricity demo
# These cover all 3 sections, not just section 1
DEMO_SECTION_TRANSLATIONS = {
    "Hindi": {
        "sec_demo_1": {
            "title": "1. ओम का नियम क्या है?",
            "explanation": "नमस्ते! मैं आपका AI शिक्षक हूँ। आज हम ओम के नियम (Ohm's Law) को समझेंगे। वोल्टेज को एक पानी के पंप के दबाव की तरह समझें जो तार में करंट को धक्का देता है, और प्रतिरोध (Resistance) उस प्रवाह को रोकने वाला घर्षण है।",
            "question": "यदि वोल्टेज स्थिर रहे और प्रतिरोध (Resistance) बढ़ जाए, तो सर्किट में करंट (Current) के साथ क्या होगा?",
            "expected_answer": "करंट घट जाएगा क्योंकि प्रतिरोध विद्युत प्रवाह का विरोध करता है (I = V / R)।",
            "concepts": ["वोल्टेज (विभवान्तर)", "विद्युत धारा (करंट)", "प्रतिरोध (Resistance)"]
        },
        "sec_demo_2": {
            "title": "2. सूत्र व्युत्पत्ति और गणितीय गणना",
            "explanation": "बहुत अच्छे! अब हम सटीक सूत्र देखते हैं: I = V / R। ध्यान दें कि वोल्टेज अंश में है और प्रतिरोध हर में।",
            "question": "यदि वोल्टेज V = 12 वोल्ट और प्रतिरोध R = 4 ओम है, तो करंट I (एम्पीयर में) क्या होगा?",
            "expected_answer": "3 एम्पीयर (I = 12 / 4 = 3A)",
            "concepts": ["सूत्र व्युत्पत्ति", "V = I × R"]
        },
        "sec_1": {
            "title": "भाग 1: सहज भौतिक आधार और मुख्य चर",
            "explanation": "नमस्ते! मैं आपका AI शिक्षक हूँ। आज हम ओम के नियम (Ohm's Law) को समझेंगे। वोल्टेज को एक पानी के पंप के दबाव की तरह समझें जो तार में करंट को धक्का देता है, और प्रतिरोध (Resistance) उस प्रवाह को रोकने वाला घर्षण है।",
            "question": "यदि वोल्टेज स्थिर रहे और प्रतिरोध (Resistance) बढ़ जाए, तो सर्किट में करंट (Current) के साथ क्या होगा?",
            "expected_answer": "करंट घट जाएगा क्योंकि प्रतिरोध विद्युत प्रवाह का विरोध करता है (I = V / R)।",
            "concepts": ["वोल्टेज (विभवान्तर)", "विद्युत धारा (करंट)", "प्रतिरोध (Resistance)"]
        },
        "sec_2": {
            "title": "भाग 2: गणितीय सूत्रीकरण",
            "explanation": "अब हम सटीक सूत्र को हल करते हैं: I = V / R। वोल्टेज अंश में है और प्रतिरोध हर में। इसलिए जैसे-जैसे प्रतिरोध बढ़ता है, करंट घटता है।",
            "question": "यदि वोल्टेज V = 12V और प्रतिरोध R = 4Ω है, तो करंट I की गणना करें।",
            "expected_answer": "3 एम्पीयर (I = 12 / 4 = 3A)",
            "concepts": ["V = I × R सूत्र", "रैखिक V-I विशेषताएँ"]
        },
        "sec_3": {
            "title": "भाग 3: व्यावहारिक सर्किट अनुप्रयोग",
            "explanation": "अंत में, आइए व्यावहारिक अनुप्रयोगों को देखते हैं और छात्रों द्वारा अक्सर की जाने वाली सामान्य गलतियों को समझते हैं।",
            "question": "श्रेणी क्रम में अधिक प्रतिरोध जोड़ने से कुल करंट क्यों घटता है?",
            "expected_answer": "कुल प्रतिरोध बढ़ने पर निश्चित वोल्टेज स्रोत के लिए करंट घटता है।",
            "concepts": ["आंतरिक प्रतिरोध", "लोड बैलेंसिंग", "सामान्य भ्रांतियाँ"]
        }
    },
    "Hinglish": {
        "sec_demo_1": {
            "title": "1. Ohm's Law kya hai?",
            "explanation": "Namaste! Main aapka AI Teacher hoon. Aaj hum Ohm's Law ko samjhenge. Sochiye voltage ek pressure ki tarah hai jo wire mein current ko push karta hai, aur resistance us flow ko rokne wala friction hai.",
            "question": "Agar voltage constant rahe aur resistance badh jaye, toh circuit mein current par kya asar padega?",
            "expected_answer": "Current decrease hoga kyunki resistance electric flow ko oppose karta hai (I = V / R).",
            "concepts": ["Voltage as Potential Difference", "Current as Flow Rate", "Resistance as Opposition"]
        },
        "sec_demo_2": {
            "title": "2. Formula Derivation aur Quantitative Calculation",
            "explanation": "Bahut badiya! Ab hum exact formula dekhte hain: I = V / R. Notice karein ki Voltage numerator mein hai aur Resistance denominator mein.",
            "question": "Agar Voltage V = 12 Volts aur Resistance R = 4 Ohms hai, toh Current I (Amperes mein) kitna hoga?",
            "expected_answer": "3 Amperes (I = 12 / 4 = 3A)",
            "concepts": ["Formula Derivation", "V = I × R"]
        },
        "sec_1": {
            "title": "Section 1: Ohm's Law ke Core Principles",
            "explanation": "Namaste! Main aapka AI Teacher hoon. Aaj hum Ohm's Law ko samjhenge. Sochiye voltage ek pressure ki tarah hai jo wire mein current ko push karta hai, aur resistance us flow ko rokne wala friction hai.",
            "question": "Agar voltage constant rahe aur resistance badh jaye, toh circuit mein current par kya asar padega?",
            "expected_answer": "Current decrease hoga kyunki resistance electric flow ko oppose karta hai (I = V / R).",
            "concepts": ["Voltage as Potential Difference", "Current as Flow Rate", "Resistance as Opposition"]
        },
        "sec_2": {
            "title": "Section 2: Mathematical Formulation",
            "explanation": "Ab hum exact formula dekhte hain: I = V / R. Voltage numerator mein hai aur Resistance denominator mein, isliye jab resistance badhta hai, current kam hota hai.",
            "question": "Agar voltage V = 12V aur resistance R = 4Ω hai, toh current I calculate karein.",
            "expected_answer": "3 Amperes (I = 12 / 4 = 3A)",
            "concepts": ["V = I × R Formula", "Linear V-I Characteristics"]
        },
        "sec_3": {
            "title": "Section 3: Practical Circuit Application",
            "explanation": "Finally, chaliye practical applications dekhte hain aur common misconceptions ko samajhte hain.",
            "question": "Series mein aur resistance jodne se total current kyun kam hota hai?",
            "expected_answer": "Total resistance badhne par fixed voltage source ke liye current kam ho jaata hai.",
            "concepts": ["Internal Resistance", "Load Balancing", "Common Misconceptions"]
        }
    },
    "Telugu": {
        "sec_demo_1": {
            "title": "1. ఓమ్ నియమం అంటే ఏమిటి?",
            "explanation": "నమస్కారం! నేను మీ AI ఉపాధ్యాయుడిని. ఈ రోజు మనం ఓమ్ నియమం (Ohm's Law) గురించి నేర్చుకుందాం. వోల్టేజ్ అనేది విద్యుత్ ప్రవాహాన్ని నెట్టే పీడనం లాంటిది, మరియు రెసిస్టెన్స్ (నిరోధం) ఆ ప్రవాహాన్ని ఆపే ఘర్షణ లాంటిది.",
            "question": "వోల్టేజ్ స్థిరంగా ఉన్నప్పుడు రెసిస్టెన్స్ (నిరోధం) పెరిగితే సర్క్యూట్లో కరెంట్ ఏమవుతుంది?",
            "expected_answer": "రెసిస్టెన్స్ విద్యుత్ ప్రవాహాన్ని అడ్డుకుంటుంది కాబట్టి కరెంట్ తగ్గుతుంది (I = V / R).",
            "concepts": ["వోల్టేజ్ (Voltage)", "కరెంట్ (Current)", "రెసిస్టెన్స్ (Resistance)"]
        },
        "sec_demo_2": {
            "title": "2. సూత్ర ఉత్పత్తి మరియు పరిమాణాత్మక గణన",
            "explanation": "చాలా బాగుంది! ఇప్పుడు ఖచ్చితమైన సూత్రాన్ని చూద్దాం: I = V / R. వోల్టేజ్ లవంలో మరియు రెసిస్టెన్స్ హారంలో ఉంటుందని గమనించండి.",
            "question": "వోల్టేజ్ V = 12 వోల్ట్లు మరియు రెసిస్టెన్స్ R = 4 ఓమ్లు అయితే, కరెంట్ I (ఆంపియర్లలో) ఎంత?",
            "expected_answer": "3 ఆంపియర్లు (I = 12 / 4 = 3A)",
            "concepts": ["సూత్ర ఉత్పత్తి", "V = I × R"]
        },
        "sec_1": {
            "title": "విభాగం 1: ఓమ్ నియమం మరియు ప్రాథమిక సూత్రాలు",
            "explanation": "నమస్కారం! నేను మీ AI ఉపాధ్యాయుడిని. ఈ రోజు మనం ఓమ్ నియమం గురించి నేర్చుకుందాం. వోల్టేజ్ అనేది విద్యుత్ ప్రవాహాన్ని నెట్టే పీడనం లాంటిది, మరియు రెసిస్టెన్స్ ఆ ప్రవాహాన్ని ఆపే ఘర్షణ లాంటిది.",
            "question": "వోల్టేజ్ స్థిరంగా ఉన్నప్పుడు రెసిస్టెన్స్ పెరిగితే కరెంట్ ఏమవుతుంది?",
            "expected_answer": "రెసిస్టెన్స్ విద్యుత్ ప్రవాహాన్ని అడ్డుకుంటుంది కాబట్టి కరెంట్ తగ్గుతుంది (I = V / R).",
            "concepts": ["వోల్టేజ్ (Voltage)", "కరెంట్ (Current)", "రెసిస్టెన్స్ (Resistance)"]
        },
        "sec_2": {
            "title": "విభాగం 2: గణిత సూత్రీకరణ",
            "explanation": "ఇప్పుడు ఖచ్చితమైన సూత్రాన్ని నిర్ణయిద్దాం: I = V / R. వోల్టేజ్ లవంలో మరియు రెసిస్టెన్స్ హారంలో ఉంటుంది.",
            "question": "వోల్టేజ్ V = 12V మరియు రెసిస్టెన్స్ R = 4Ω అయితే కరెంట్ I లెక్కించండి.",
            "expected_answer": "3 ఆంపియర్లు (I = 12 / 4 = 3A)",
            "concepts": ["V = I × R సూత్రం", "రేఖీయ V-I లక్షణాలు"]
        },
        "sec_3": {
            "title": "విభాగం 3: ఆచరణాత్మక అనువర్తనం",
            "explanation": "చివరగా, ఆచరణాత్మక అనువర్తనాలు మరియు సాధారణ తప్పులను అర్థం చేసుకుందాం.",
            "question": "శ్రేణిలో మరిన్ని రెసిస్టెన్స్లు జోడిస్తే మొత్తం కరెంట్ ఎందుకు తగ్గుతుంది?",
            "expected_answer": "మొత్తం రెసిస్టెన్స్ పెరగడంతో స్థిర వోల్టేజ్ సోర్స్కు కరెంట్ తగ్గుతుంది.",
            "concepts": ["అంతర్గత రెసిస్టెన్స్", "లోడ్ బ్యాలెన్సింగ్", "సాధారణ తప్పుడు అవగాహనలు"]
        }
    }
}

# Generic topic-agnostic translations for non-demo lessons
GENERIC_SECTION_TEMPLATES = {
    "Hindi": {
        "intro_explanation": "नमस्ते! मैं आपका AI शिक्षक हूँ। आज हम {topic} के बारे में सीखेंगे। आइए चरण दर चरण इसे समझते हैं।",
        "section_1_title": "भाग 1: मूल अवधारणाएँ और आधार",
        "section_2_title": "भाग 2: गणितीय सूत्रीकरण",
        "section_3_title": "भाग 3: व्यावहारिक अनुप्रयोग",
        "correct_feedback": "शाबाश! आपने बिल्कुल सही उत्तर दिया। आपकी समझ बहुत अच्छी है।",
        "wrong_feedback": "अच्छा प्रयास! आइए इसे एक बार फिर से समझते हैं। सोचें कि क्या होता है जब चर बदलते हैं।",
    },
    "Hinglish": {
        "intro_explanation": "Namaste! Main aapka AI Teacher hoon. Aaj hum {topic} ke baare mein seekhenge. Chaliye step by step samajhte hain.",
        "section_1_title": "Section 1: Core Concepts aur Foundations",
        "section_2_title": "Section 2: Mathematical Formulation",
        "section_3_title": "Section 3: Practical Application",
        "correct_feedback": "Bahut badiya! Aapne bilkul sahi answer diya. Aapki samajh bahut achhi hai.",
        "wrong_feedback": "Achha prayas! Chaliye dobara samajhte hain. Sochiye ki kya hota hai jab variables change hote hain.",
    },
    "Telugu": {
        "intro_explanation": "నమస్కారం! నేను మీ AI ఉపాధ్యాయుడిని. ఈ రోజు మనం {topic} గురించి నేర్చుకుందాం. దశలవారీగా అర్థం చేసుకుందాం.",
        "section_1_title": "విభాగం 1: ప్రాథమిక భావనలు మరియు ఆధారాలు",
        "section_2_title": "విభాగం 2: గణిత సూత్రీకరణ",
        "section_3_title": "విభాగం 3: ఆచరణాత్మక అనువర్తనం",
        "correct_feedback": "చాలా బాగుంది! మీరు సరైన సమాధానం చెప్పారు. మీ అవగాహన చాలా మంచిది.",
        "wrong_feedback": "మంచి ప్రయత్నం! మళ్ళీ అర్థం చేసుకుందాం. వేరియబుల్స్ మారినప్పుడు ఏమవుతుందో ఆలోచించండి.",
    }
}


class TeacherAgent:
    """Stateful AI Teacher Agent orchestrating the teaching loop with seamless multilingual adaptation."""

    def __init__(self):
        self.state = {
            "current_lesson_id": None,
            "current_section_index": 0,
            "concepts_covered": [],
            "concepts_understood": [],
            "concepts_struggling": [],
            "misconceptions": [],
            "current_strategy": "direct",
            "difficulty": "beginner",
            "language": "English",
            "mastery_score": 0.5
        }

    def initialize_lesson(self, lesson_data: Dict[str, Any], language: str = "English"):
        self.state["current_lesson_id"] = lesson_data.get("id")
        self.state["current_section_index"] = 0
        self.state["concepts_covered"] = []
        self.state["concepts_understood"] = []
        self.state["concepts_struggling"] = []
        self.state["misconceptions"] = []
        self.state["current_strategy"] = "direct"
        self.state["difficulty"] = lesson_data.get("difficulty", "beginner")
        self.state["language"] = language
        self.state["mastery_score"] = 0.5

    def _get_section_key(self, section_data: Dict[str, Any]) -> Optional[str]:
        """Returns a normalized section key for lookup in translation tables."""
        sec_id = section_data.get("id", "")
        # Check exact match first
        for demo_key in ["sec_demo_1", "sec_demo_2", "sec_1", "sec_2", "sec_3"]:
            if demo_key in sec_id:
                return demo_key
        # Check by index pattern
        title = section_data.get("title", "").lower()
        if "section 1" in title or "sec 1" in title or "foundations" in title or "core" in title:
            return "sec_1"
        if "section 2" in title or "mathematical" in title or "formulation" in title or "derivation" in title:
            return "sec_2"
        if "section 3" in title or "practical" in title or "application" in title or "misconception" in title:
            return "sec_3"
        return None

    def _offline_translate_section(self, section_data: Dict[str, Any], target_language: str) -> Dict[str, Any]:
        """
        Fully offline multilingual translation using pre-built tables.
        Works without any API key. Covers Ohm's Law demo + generic topics.
        """
        if target_language == "English":
            # Restore from original English backup if available
            orig = section_data.get("_original_en")
            if orig:
                return {**section_data, **orig}
            return section_data

        lang_table = DEMO_SECTION_TRANSLATIONS.get(target_language, {})
        generic_table = GENERIC_SECTION_TEMPLATES.get(target_language, {})

        # Backup original English content on first translation
        if "_original_en" not in section_data:
            section_data["_original_en"] = {
                "title": section_data.get("title", ""),
                "explanation": section_data.get("explanation", ""),
                "question": section_data.get("question", ""),
                "expected_answer": section_data.get("expected_answer", ""),
                "concepts": section_data.get("concepts", [])
            }

        # Look up pre-built translation for this section
        section_key = self._get_section_key(section_data)
        if section_key and section_key in lang_table:
            translation = lang_table[section_key]
            return {
                **section_data,
                "title": translation.get("title", section_data.get("title")),
                "explanation": translation.get("explanation", section_data.get("explanation")),
                "question": translation.get("question", section_data.get("question")),
                "expected_answer": translation.get("expected_answer", section_data.get("expected_answer")),
                "concepts": translation.get("concepts", section_data.get("concepts", [])),
            }

        # Generic topic fallback: translate intro + title, keep body in English (readable mixed)
        topic = section_data.get("concepts", ["this topic"])[0] if section_data.get("concepts") else "this topic"
        title_original = section_data.get("title", "")
        idx = self._guess_section_index(title_original)

        title_key = f"section_{idx + 1}_title"
        translated_title = generic_table.get(title_key, title_original)

        intro_template = generic_table.get("intro_explanation", section_data.get("explanation", ""))
        translated_explanation = intro_template.format(topic=topic) if "{topic}" in intro_template else intro_template

        return {
            **section_data,
            "title": translated_title,
            "explanation": translated_explanation,
            # Keep question/answer in English for non-demo topics (avoidance of garbled fallback)
        }

    def _guess_section_index(self, title: str) -> int:
        title_lower = title.lower()
        if "1" in title_lower or "first" in title_lower or "core" in title_lower or "foundation" in title_lower:
            return 0
        if "2" in title_lower or "second" in title_lower or "math" in title_lower or "formula" in title_lower:
            return 1
        if "3" in title_lower or "third" in title_lower or "practical" in title_lower or "application" in title_lower:
            return 2
        return 0

    async def translate_section(self, section_data: Dict[str, Any], target_language: str) -> Dict[str, Any]:
        """Translates a lesson section into target language. Uses offline engine first, LLM as enhancement."""
        # Always use offline engine as primary (works without API key)
        translated = self._offline_translate_section(section_data, target_language)

        # If LLM is available, use it to enhance translation for non-demo topics
        if target_language != "English":
            section_key = self._get_section_key(section_data)
            lang_table = DEMO_SECTION_TRANSLATIONS.get(target_language, {})
            # Only call LLM if offline table didn't have this section
            if not (section_key and section_key in lang_table):
                orig_explanation = section_data.get("_original_en", {}).get("explanation") or section_data.get("explanation", "")
                orig_question = section_data.get("_original_en", {}).get("question") or section_data.get("question", "")
                orig_title = section_data.get("_original_en", {}).get("title") or section_data.get("title", "")

                translation_prompt = f"""Translate these educational lesson texts to {target_language}.

Title: {orig_title}
Explanation: {orig_explanation}
Question: {orig_question}

Language specs:
- Hindi: Conversational formal Hindi in Devanagari script.
- Hinglish: Natural Hindi-English mix in Roman script.
- Telugu: Conversational Telugu in Telugu script.

Return ONLY valid JSON: {{"title": "...", "explanation": "...", "question": "..."}}"""
                try:
                    result = await llm_client.generate_json(translation_prompt)
                    if "explanation" in result and len(result.get("explanation", "")) > 10:
                        translated["title"] = result.get("title", translated.get("title"))
                        translated["explanation"] = result.get("explanation", translated.get("explanation"))
                        translated["question"] = result.get("question", translated.get("question"))
                except Exception:
                    pass  # LLM failed — offline translation already applied above

        return translated

    async def process_student_answer(
        self,
        section_data: Dict[str, Any],
        student_answer: str
    ) -> Dict[str, Any]:
        # Use original English concepts/question for evaluation (LLM works better with English)
        orig = section_data.get("_original_en", section_data)
        concept = orig.get("concepts", section_data.get("concepts", ["Main Concept"]))[0] if orig.get("concepts") else "Main Concept"
        question = orig.get("question", section_data.get("question", ""))
        expected = orig.get("expected_answer", section_data.get("expected_answer", ""))

        eval_result = await evaluator.evaluate_answer(
            concept=concept,
            question=question,
            expected_answer=expected,
            student_answer=student_answer,
            current_strategy=self.state["current_strategy"]
        )

        # Localize feedback to current language
        lang = self.state.get("language", "English")
        generic = GENERIC_SECTION_TEMPLATES.get(lang, {})

        if lang == "Hindi":
            if eval_result.get("correct"):
                eval_result["feedback"] = "शाबाश! आपने बिल्कुल सही उत्तर दिया। वोल्टेज और करंट का संबंध अब स्पष्ट है।"
                eval_result["next_question"] = "अब अगले महत्वपूर्ण भाग के लिए तैयार हैं?"
            else:
                eval_result["feedback"] = "सोचिए, जब पाइप संकरा होता है तो पानी का बहाव धीमा हो जाता है। इसी तरह जब प्रतिरोध (Resistance) बढ़ता है, तो करंट घट जाता है!"
                eval_result["next_question"] = "यदि आप पानी के पाइप को दबाते हैं (प्रतिरोध बढ़ाते हैं), तो पानी का प्रवाह कम होगा या ज्यादा?"
        elif lang == "Hinglish":
            if eval_result.get("correct"):
                eval_result["feedback"] = "Bahut badiya! Aapne bilkul sahi answer diya. Inverse relationship ab clear hai."
                eval_result["next_question"] = "Ab next important section ke liye taiyaar hain?"
            else:
                eval_result["feedback"] = "Aap flow ke baare mein soch rahe hain, lekin yaad rakhiye resistance current ko rokta hai. Squeeze kiye gaye pipe ki tarah, resistance badhne par current kam ho jata hai!"
                eval_result["next_question"] = "Agar aap water pipe ko squeeze karenge (resistance badhayenge), toh paani ka flow kam hoga ya zyada?"
        elif lang == "Telugu":
            if eval_result.get("correct"):
                eval_result["feedback"] = "చాలా బాగుంది! మీరు సరైన సమాధానం చెప్పారు. విలోమ సంబంధాన్ని సరిగ్గా అర్థం చేసుకున్నారు."
                eval_result["next_question"] = "ఇప్పుడు తదుపరి ముఖ్యమైన విభాగానికి సిద్ధంగా ఉన్నారా?"
            else:
                eval_result["feedback"] = "గుర్తుంచుకోండి, రెసిస్టెన్స్ అనేది కరెంట్ ప్రవాహాన్ని అడ్డుకుంటుంది. ఇరుకైన పైపులో నీటి ప్రవాహం తగ్గినట్లు, రెసిస్టెన్స్ పెరిగితే కరెంట్ తగ్గుతుంది!"
                eval_result["next_question"] = "పైపును గట్టిగా నొక్కినప్పుడు (రెసిస్టెన్స్ పెంచినప్పుడు), నీటి ప్రవాహం తగ్గుతుందా లేదా పెరుగుతుందా?"

        # Update teaching state
        if eval_result["correct"]:
            if concept not in self.state["concepts_understood"]:
                self.state["concepts_understood"].append(concept)
            self.state["mastery_score"] = min(1.0, self.state["mastery_score"] + 0.15)
        else:
            if concept not in self.state["concepts_struggling"]:
                self.state["concepts_struggling"].append(concept)
            if eval_result.get("detected_misconception"):
                self.state["misconceptions"].append(eval_result["detected_misconception"])
            new_strategy = eval_result.get("recommended_strategy", "analogy")
            self.state["current_strategy"] = new_strategy
            self.state["mastery_score"] = max(0.1, self.state["mastery_score"] - 0.15)

        return eval_result

    def switch_language(self, new_language: str):
        self.state["language"] = new_language

    def get_state(self) -> Dict[str, Any]:
        return self.state


teacher_agent = TeacherAgent()
