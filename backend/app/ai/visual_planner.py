from typing import Dict, Any

class VisualPlanner:
    """Generates rich, subject-aware visual payloads for frontend dynamic components."""

    @staticmethod
    def generate_visual_payload(subject_or_topic: str, visual_type: str, concept: str) -> Dict[str, Any]:
        topic_lower = subject_or_topic.lower()
        
        if visual_type == "graph" or "voltage" in topic_lower or "math" in topic_lower or "physics" in topic_lower:
            return {
                "type": "graph",
                "title": f"Quantitative Characteristic: {concept}",
                "x_axis": "Current I (Amperes)",
                "y_axis": "Voltage V (Volts)",
                "series": [
                    {"x": 1, "y": 4, "label": "Point A (R=4Ω)"},
                    {"x": 2, "y": 8, "label": "Point B (R=4Ω)"},
                    {"x": 3, "y": 12, "label": "Point C (R=4Ω)"},
                    {"x": 4, "y": 16, "label": "Point D (R=4Ω)"}
                ],
                "formula": "V = I × R (Linear V-I Curve)"
            }
        
        elif visual_type == "equation":
            return {
                "type": "equation",
                "title": f"Mathematical Model: {concept}",
                "latex": "I = \\frac{V}{R}",
                "variables": [
                    {"symbol": "I", "name": "Current", "unit": "Amperes (A)", "desc": "Rate of charge flow"},
                    {"symbol": "V", "name": "Voltage", "unit": "Volts (V)", "desc": "Potential difference"},
                    {"symbol": "R", "name": "Resistance", "unit": "Ohms (Ω)", "desc": "Opposition to flow"}
                ],
                "step_by_step": [
                    "Step 1: Identify given parameters (V=12V, R=4Ω)",
                    "Step 2: Apply Ohm's Law (I = V / R)",
                    "Step 3: Calculate flow: 12 / 4 = 3 Amperes"
                ]
            }

        elif visual_type == "code" or "python" in topic_lower or "react" in topic_lower or "programming" in topic_lower or "sql" in topic_lower:
            return {
                "type": "code",
                "title": f"Code Implementation: {concept}",
                "language": "python",
                "code": "def calculate_current(voltage: float, resistance: float) -> float:\n    \"\"\"Calculates current I given voltage V and resistance R.\"\"\"\n    if resistance <= 0:\n        raise ValueError('Resistance must be positive')\n    return voltage / resistance\n\n# Example execution\ncurrent = calculate_current(voltage=12.0, resistance=4.0)\nprint(f'Calculated Current: {current} Amperes')\n",
                "output": "Calculated Current: 3.0 Amperes"
            }

        elif visual_type == "timeline" or "history" in topic_lower or "evolution" in topic_lower:
            return {
                "type": "timeline",
                "title": f"Historical Development: {concept}",
                "events": [
                    {"year": "1780", "event": "Galvani discovers bioelectricity in frog legs."},
                    {"year": "1800", "event": "Alessandro Volta invents the first chemical battery."},
                    {"year": "1827", "event": "Georg Ohm publishes Ohm's Law establishing V = I x R."},
                    {"year": "1897", "event": "J.J. Thomson discovers the electron, explaining charge carriers."}
                ]
            }

        elif visual_type == "concept_map":
            return {
                "type": "concept_map",
                "title": f"Concept Network: {concept}",
                "nodes": [
                    {"id": "c1", "label": "Voltage (Potential)", "category": "Cause"},
                    {"id": "c2", "label": "Current (Flow)", "category": "Effect"},
                    {"id": "c3", "label": "Resistance (Obstacle)", "category": "Moderator"},
                    {"id": "c4", "label": "Electrical Power (P=VI)", "category": "Output"}
                ],
                "edges": [
                    {"from": "c1", "to": "c2", "label": "Drives flow"},
                    {"from": "c3", "to": "c2", "label": "Restricts flow"},
                    {"from": "c2", "to": "c4", "label": "Determines work done"}
                ]
            }
            
        else: # default diagram / process
            return {
                "type": "diagram",
                "title": f"Visual Process Diagram: {concept}",
                "steps": [
                    {"step": 1, "title": "Energy Source", "description": "Battery establishes electric field potential."},
                    {"step": 2, "title": "Charge Carrier Drift", "description": "Free electrons migrate through conductive material."},
                    {"step": 3, "title": "Resistive Scattering", "description": "Electrons collide with atomic lattice creating heat."},
                    {"step": 4, "title": "Circuit Completion", "description": "Current returns to low potential terminal."}
                ]
            }
