from typing import Dict, Any, List


class VisualPlanner:
    """Generates rich, subject-aware visual payloads for frontend dynamic components."""

    @staticmethod
    def _topic_graph(topic: str, concept: str) -> Dict[str, Any]:
        t = topic.lower()
        # Generate topic-relevant graph axes and data
        if any(k in t for k in ["photosynthesis", "biology", "plant"]):
            return {
                "type": "graph",
                "title": f"Rate Curve: {concept}",
                "x_axis": "Light Intensity (lux)",
                "y_axis": "Rate of Photosynthesis (μmol O₂/s)",
                "series": [
                    {"x": 0, "y": 0, "label": "No light"},
                    {"x": 500, "y": 3, "label": "Low light"},
                    {"x": 1000, "y": 6, "label": "Medium light"},
                    {"x": 2000, "y": 9, "label": "Bright light"},
                    {"x": 3000, "y": 10, "label": "Saturation point"},
                ],
                "formula": "Rate ∝ Light Intensity (until saturation)"
            }
        elif any(k in t for k in ["chemistry", "reaction", "kinetics", "titration"]):
            return {
                "type": "graph",
                "title": f"Reaction Rate Curve: {concept}",
                "x_axis": "Concentration (mol/L)",
                "y_axis": "Reaction Rate (mol/L·s)",
                "series": [
                    {"x": 0.0, "y": 0.0},
                    {"x": 0.5, "y": 0.25},
                    {"x": 1.0, "y": 0.50},
                    {"x": 1.5, "y": 0.75},
                    {"x": 2.0, "y": 1.00},
                ],
                "formula": "Rate = k[A]ⁿ"
            }
        elif any(k in t for k in ["physics", "motion", "kinematics", "velocity", "acceleration"]):
            return {
                "type": "graph",
                "title": f"Motion Curve: {concept}",
                "x_axis": "Time (seconds)",
                "y_axis": "Velocity (m/s)",
                "series": [
                    {"x": 0, "y": 0},
                    {"x": 1, "y": 9.8},
                    {"x": 2, "y": 19.6},
                    {"x": 3, "y": 29.4},
                    {"x": 4, "y": 39.2},
                ],
                "formula": "v = u + at"
            }
        elif any(k in t for k in ["economics", "supply", "demand", "market"]):
            return {
                "type": "graph",
                "title": f"Market Curve: {concept}",
                "x_axis": "Quantity (units)",
                "y_axis": "Price ($)",
                "series": [
                    {"x": 100, "y": 50},
                    {"x": 200, "y": 40},
                    {"x": 300, "y": 30},
                    {"x": 400, "y": 20},
                    {"x": 500, "y": 10},
                ],
                "formula": "P = f(Q) — Demand Curve"
            }
        elif any(k in t for k in ["math", "calculus", "function", "algebra"]):
            return {
                "type": "graph",
                "title": f"Mathematical Function: {concept}",
                "x_axis": "x",
                "y_axis": "f(x)",
                "series": [
                    {"x": -2, "y": 4},
                    {"x": -1, "y": 1},
                    {"x": 0, "y": 0},
                    {"x": 1, "y": 1},
                    {"x": 2, "y": 4},
                ],
                "formula": "f(x) = x²"
            }
        elif any(k in t for k in ["electricity", "ohm", "circuit", "voltage", "current"]):
            return {
                "type": "graph",
                "title": f"V-I Characteristic: {concept}",
                "x_axis": "Current I (Amperes)",
                "y_axis": "Voltage V (Volts)",
                "series": [
                    {"x": 1, "y": 4, "label": "R=4Ω"},
                    {"x": 2, "y": 8, "label": "R=4Ω"},
                    {"x": 3, "y": 12, "label": "R=4Ω"},
                    {"x": 4, "y": 16, "label": "R=4Ω"},
                ],
                "formula": "V = I × R"
            }
        else:
            # Generic topic-named graph
            return {
                "type": "graph",
                "title": f"Quantitative Relationship: {concept}",
                "x_axis": f"Input Variable (x)",
                "y_axis": f"Output Variable — {topic} (y)",
                "series": [
                    {"x": 1, "y": 2},
                    {"x": 2, "y": 4},
                    {"x": 3, "y": 6},
                    {"x": 4, "y": 8},
                ],
                "formula": f"y = f(x) — {topic} relationship"
            }

    @staticmethod
    def _topic_equation(topic: str, concept: str) -> Dict[str, Any]:
        t = topic.lower()
        if any(k in t for k in ["photosynthesis", "biology", "plant"]):
            return {
                "type": "equation",
                "title": f"Photosynthesis Equation: {concept}",
                "latex": "6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂",
                "variables": [
                    {"symbol": "CO₂", "name": "Carbon Dioxide", "unit": "mol", "desc": "Absorbed from atmosphere"},
                    {"symbol": "H₂O", "name": "Water", "unit": "mol", "desc": "Absorbed through roots"},
                    {"symbol": "C₆H₁₂O₆", "name": "Glucose", "unit": "mol", "desc": "Energy-rich sugar produced"},
                    {"symbol": "O₂", "name": "Oxygen", "unit": "mol", "desc": "Released as byproduct"},
                ],
                "step_by_step": [
                    "Step 1: Light energy is captured by chlorophyll in the thylakoids",
                    "Step 2: Water molecules are split (photolysis) releasing O₂",
                    "Step 3: CO₂ is fixed in the Calvin Cycle to form glucose",
                    "Step 4: Net result: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂"
                ]
            }
        elif any(k in t for k in ["chemistry", "reaction", "mole", "stoichiometry"]):
            return {
                "type": "equation",
                "title": f"Chemical Equation: {concept}",
                "latex": "n = m / M",
                "variables": [
                    {"symbol": "n", "name": "Amount (moles)", "unit": "mol", "desc": "Number of moles of substance"},
                    {"symbol": "m", "name": "Mass", "unit": "grams (g)", "desc": "Measured mass of sample"},
                    {"symbol": "M", "name": "Molar Mass", "unit": "g/mol", "desc": "Mass per mole of substance"},
                ],
                "step_by_step": [
                    "Step 1: Identify the substance and find its molar mass M from the periodic table",
                    "Step 2: Measure or obtain the sample mass m in grams",
                    "Step 3: Apply n = m / M to calculate the number of moles"
                ]
            }
        elif any(k in t for k in ["physics", "motion", "kinematics", "newton"]):
            return {
                "type": "equation",
                "title": f"Newton's Law: {concept}",
                "latex": "F = m × a",
                "variables": [
                    {"symbol": "F", "name": "Force", "unit": "Newtons (N)", "desc": "Net force applied on object"},
                    {"symbol": "m", "name": "Mass", "unit": "Kilograms (kg)", "desc": "Inertial mass of the object"},
                    {"symbol": "a", "name": "Acceleration", "unit": "m/s²", "desc": "Rate of change of velocity"},
                ],
                "step_by_step": [
                    "Step 1: Identify all forces acting on the object (free body diagram)",
                    "Step 2: Sum all forces to find net force F",
                    "Step 3: Apply a = F / m to find acceleration"
                ]
            }
        elif any(k in t for k in ["electricity", "ohm", "circuit"]):
            return {
                "type": "equation",
                "title": f"Ohm's Law: {concept}",
                "latex": "I = V / R",
                "variables": [
                    {"symbol": "I", "name": "Current", "unit": "Amperes (A)", "desc": "Rate of charge flow"},
                    {"symbol": "V", "name": "Voltage", "unit": "Volts (V)", "desc": "Potential difference"},
                    {"symbol": "R", "name": "Resistance", "unit": "Ohms (Ω)", "desc": "Opposition to flow"},
                ],
                "step_by_step": [
                    "Step 1: Identify given parameters (V and R)",
                    "Step 2: Apply Ohm's Law I = V / R",
                    "Step 3: Calculate current flow"
                ]
            }
        else:
            return {
                "type": "equation",
                "title": f"Core Formula: {concept}",
                "latex": f"{topic[:1].upper()} = f(variables)",
                "variables": [
                    {"symbol": "x", "name": "Input Variable", "unit": "units", "desc": f"Primary input in {topic}"},
                    {"symbol": "y", "name": "Output Variable", "unit": "units", "desc": f"Resulting output in {topic}"},
                ],
                "step_by_step": [
                    f"Step 1: Identify the key variables in {topic}",
                    "Step 2: Apply the governing formula",
                    "Step 3: Verify units and interpret the result"
                ]
            }

    @staticmethod
    def _topic_diagram(topic: str, concept: str) -> Dict[str, Any]:
        t = topic.lower()
        if any(k in t for k in ["photosynthesis", "plant", "biology", "cell"]):
            return {
                "type": "diagram",
                "title": f"Process Flow: {concept}",
                "steps": [
                    {"step": 1, "title": "Light Absorption", "description": "Chlorophyll in thylakoids absorbs sunlight energy."},
                    {"step": 2, "title": "Water Splitting", "description": "H₂O molecules are split, releasing O₂ and energised electrons."},
                    {"step": 3, "title": "Calvin Cycle", "description": "CO₂ is fixed into G3P using ATP and NADPH from light reactions."},
                    {"step": 4, "title": "Glucose Synthesis", "description": "G3P molecules are assembled into glucose (C₆H₁₂O₆)."},
                ]
            }
        elif any(k in t for k in ["software", "programming", "algorithm", "code"]):
            return {
                "type": "diagram",
                "title": f"Algorithm Flow: {concept}",
                "steps": [
                    {"step": 1, "title": "Input", "description": "Receive and validate data inputs."},
                    {"step": 2, "title": "Processing", "description": "Apply core logic or algorithm to transform data."},
                    {"step": 3, "title": "Computation", "description": "Execute step-by-step calculations or decisions."},
                    {"step": 4, "title": "Output", "description": "Return result or display response to the user."},
                ]
            }
        elif any(k in t for k in ["electricity", "circuit", "ohm"]):
            return {
                "type": "diagram",
                "title": f"Circuit Flow: {concept}",
                "steps": [
                    {"step": 1, "title": "Energy Source", "description": "Battery establishes electric field potential."},
                    {"step": 2, "title": "Charge Carrier Drift", "description": "Free electrons migrate through conductive material."},
                    {"step": 3, "title": "Resistive Scattering", "description": "Electrons collide with atomic lattice creating heat."},
                    {"step": 4, "title": "Circuit Completion", "description": "Current returns to low potential terminal."},
                ]
            }
        else:
            return {
                "type": "diagram",
                "title": f"Process Diagram: {concept}",
                "steps": [
                    {"step": 1, "title": "Foundation", "description": f"Establish the key principles and definitions of {topic}."},
                    {"step": 2, "title": "Analysis", "description": f"Examine relationships between variables in {topic}."},
                    {"step": 3, "title": "Application", "description": f"Apply {topic} concepts to real-world scenarios."},
                    {"step": 4, "title": "Evaluation", "description": f"Verify outcomes and resolve common misconceptions in {topic}."},
                ]
            }

    @staticmethod
    def _topic_timeline(topic: str, concept: str) -> Dict[str, Any]:
        t = topic.lower()
        if any(k in t for k in ["photosynthesis", "plant", "biology"]):
            return {
                "type": "timeline",
                "title": f"Historical Development: {concept}",
                "events": [
                    {"year": "1648", "event": "Jan Baptist van Helmont shows plants gain mass from water, not soil."},
                    {"year": "1771", "event": "Joseph Priestley discovers plants release oxygen in light."},
                    {"year": "1845", "event": "Julius Robert Mayer proposes plants convert light energy to chemical energy."},
                    {"year": "1954", "event": "Melvin Calvin maps the complete carbon fixation cycle (Calvin Cycle)."},
                ]
            }
        elif any(k in t for k in ["electricity", "ohm", "circuit"]):
            return {
                "type": "timeline",
                "title": f"Historical Development: {concept}",
                "events": [
                    {"year": "1780", "event": "Galvani discovers bioelectricity in frog legs."},
                    {"year": "1800", "event": "Alessandro Volta invents the first chemical battery."},
                    {"year": "1827", "event": "Georg Ohm publishes Ohm's Law establishing V = I × R."},
                    {"year": "1897", "event": "J.J. Thomson discovers the electron, explaining charge carriers."},
                ]
            }
        else:
            return {
                "type": "timeline",
                "title": f"Historical Development: {concept}",
                "events": [
                    {"year": "Ancient", "event": f"Early observations and first principles of {topic} recorded."},
                    {"year": "1600s", "event": f"Scientific method applied systematically to study {topic}."},
                    {"year": "1800s", "event": f"Mathematical foundations and formal theories of {topic} established."},
                    {"year": "1900s+", "event": f"Modern applications and technological advances using {topic}."},
                ]
            }

    @staticmethod
    def _topic_concept_map(topic: str, concept: str) -> Dict[str, Any]:
        t = topic.lower()
        if any(k in t for k in ["photosynthesis", "plant", "biology"]):
            return {
                "type": "concept_map",
                "title": f"Concept Network: {concept}",
                "nodes": [
                    {"id": "c1", "label": "Light Energy (Sunlight)", "category": "Input"},
                    {"id": "c2", "label": "Chlorophyll (Pigment)", "category": "Catalyst"},
                    {"id": "c3", "label": "CO₂ + H₂O (Reactants)", "category": "Input"},
                    {"id": "c4", "label": "Glucose C₆H₁₂O₆", "category": "Output"},
                    {"id": "c5", "label": "Oxygen O₂", "category": "Byproduct"},
                ],
                "edges": [
                    {"from": "c1", "to": "c2", "label": "Absorbed by"},
                    {"from": "c2", "to": "c3", "label": "Drives reaction of"},
                    {"from": "c3", "to": "c4", "label": "Converted to"},
                    {"from": "c3", "to": "c5", "label": "Also releases"},
                ]
            }
        elif any(k in t for k in ["electricity", "ohm", "circuit"]):
            return {
                "type": "concept_map",
                "title": f"Concept Network: {concept}",
                "nodes": [
                    {"id": "c1", "label": "Voltage (Potential)", "category": "Cause"},
                    {"id": "c2", "label": "Current (Flow)", "category": "Effect"},
                    {"id": "c3", "label": "Resistance (Obstacle)", "category": "Moderator"},
                    {"id": "c4", "label": "Electrical Power (P=VI)", "category": "Output"},
                ],
                "edges": [
                    {"from": "c1", "to": "c2", "label": "Drives flow"},
                    {"from": "c3", "to": "c2", "label": "Restricts flow"},
                    {"from": "c2", "to": "c4", "label": "Determines work done"},
                ]
            }
        else:
            return {
                "type": "concept_map",
                "title": f"Concept Network: {concept}",
                "nodes": [
                    {"id": "c1", "label": f"Core Principle of {topic}", "category": "Foundation"},
                    {"id": "c2", "label": "Key Variables", "category": "Components"},
                    {"id": "c3", "label": "Governing Relationship", "category": "Law/Rule"},
                    {"id": "c4", "label": "Real-World Application", "category": "Output"},
                ],
                "edges": [
                    {"from": "c1", "to": "c2", "label": "Defines"},
                    {"from": "c2", "to": "c3", "label": "Linked by"},
                    {"from": "c3", "to": "c4", "label": "Enables"},
                ]
            }

    @staticmethod
    def _topic_code(topic: str, concept: str) -> Dict[str, Any]:
        t = topic.lower()
        if any(k in t for k in ["photosynthesis", "biology"]):
            return {
                "type": "code",
                "title": f"Simulation: {concept}",
                "language": "python",
                "code": (
                    "def photosynthesis_rate(light_intensity: float, co2_ppm: float) -> float:\n"
                    "    \"\"\"Estimate photosynthesis rate based on light and CO2.\"\"\"\n"
                    "    max_rate = 10.0  # μmol O₂/s at saturation\n"
                    "    saturation_point = 2000  # lux\n"
                    "    rate = max_rate * (light_intensity / (light_intensity + saturation_point))\n"
                    "    co2_factor = min(co2_ppm / 400, 1.5)  # CO2 boost factor\n"
                    "    return rate * co2_factor\n\n"
                    "# Example\n"
                    "rate = photosynthesis_rate(light_intensity=1000, co2_ppm=400)\n"
                    "print(f'Photosynthesis Rate: {rate:.2f} μmol O₂/s')\n"
                ),
                "output": "Photosynthesis Rate: 3.33 μmol O₂/s"
            }
        elif any(k in t for k in ["electricity", "ohm", "circuit"]):
            return {
                "type": "code",
                "title": f"Code Implementation: {concept}",
                "language": "python",
                "code": (
                    "def calculate_current(voltage: float, resistance: float) -> float:\n"
                    "    \"\"\"Calculates current I given voltage V and resistance R.\"\"\"\n"
                    "    if resistance <= 0:\n"
                    "        raise ValueError('Resistance must be positive')\n"
                    "    return voltage / resistance\n\n"
                    "# Example\n"
                    "current = calculate_current(voltage=12.0, resistance=4.0)\n"
                    "print(f'Calculated Current: {current} Amperes')\n"
                ),
                "output": "Calculated Current: 3.0 Amperes"
            }
        else:
            return {
                "type": "code",
                "title": f"Code Implementation: {concept}",
                "language": "python",
                "code": (
                    f"# {topic} — Core Algorithm Implementation\n"
                    f"def solve_{topic.lower().replace(' ', '_')}(input_val: float) -> float:\n"
                    f"    \"\"\"Models the key relationship in {topic}.\"\"\"\n"
                    f"    # Apply the core formula/transformation\n"
                    f"    result = input_val * 2  # placeholder relationship\n"
                    f"    return result\n\n"
                    f"# Run example\n"
                    f"output = solve_{topic.lower().replace(' ', '_')}(5.0)\n"
                    f"print(f'Result: {{output}}')\n"
                ),
                "output": "Result: 10.0"
            }

    @staticmethod
    def _topic_concept_card(topic: str, concept: str) -> Dict[str, Any]:
        return {
            "type": "concept_card",
            "title": f"Key Principle: {concept}",
            "topic": topic,
            "definition": f"The fundamental rule or definition governing {concept} within {topic}.",
            "core_points": [
                f"Core mechanism of {concept}",
                f"Critical relationship to overall {topic} system",
                "Practical significance and real-world impact"
            ],
            "common_pitfall": f"Confusing {concept} with related foundational concepts without accounting for specific conditions.",
            "formula_hint": "See governing equation and relationship models"
        }

    @staticmethod
    def _topic_table(topic: str, concept: str) -> Dict[str, Any]:
        return {
            "type": "table",
            "title": f"Comparative Matrix: {concept}",
            "headers": ["Attribute / Dimension", f"Standard ({concept})", "Alternative / Variant"],
            "rows": [
                ["Core Focus", f"Primary mechanism of {concept}", f"Boundary condition"],
                ["Key Driver", f"Governing parameter in {topic}", "External disturbance"],
                ["Expected Outcome", "Stable, predictable output", "Transient response"],
                ["Application Note", f"Standard operational guideline", "Edge case requirement"]
            ]
        }

    @staticmethod
    def plan_visual_data(topic: str, concept: str, visual_type: str = "diagram") -> Dict[str, Any]:
        """Unified method for generating topic-aware visual payloads."""
        vt = visual_type.lower() if visual_type else "diagram"

        if vt in ("graph", "chart"):
            return VisualPlanner._topic_graph(topic, concept)
        elif vt in ("equation", "formula"):
            return VisualPlanner._topic_equation(topic, concept)
        elif vt in ("flow", "diagram"):
            return VisualPlanner._topic_diagram(topic, concept)
        elif vt == "process":
            diag = VisualPlanner._topic_diagram(topic, concept)
            diag["type"] = "process"
            return diag
        elif vt in ("timeline", "history"):
            return VisualPlanner._topic_timeline(topic, concept)
        elif vt in ("concept_map", "map"):
            return VisualPlanner._topic_concept_map(topic, concept)
        elif vt in ("code", "algorithm"):
            return VisualPlanner._topic_code(topic, concept)
        elif vt in ("concept_card", "card"):
            return VisualPlanner._topic_concept_card(topic, concept)
        elif vt in ("table", "comparison"):
            return VisualPlanner._topic_table(topic, concept)
        else:
            return VisualPlanner._topic_diagram(topic, concept)

    @staticmethod
    def generate_visual_payload(subject_or_topic: str, visual_type: str, concept: str) -> Dict[str, Any]:
        """Generate topic-aware visual payload — NO hardcoded Ohm's Law defaults."""
        return VisualPlanner.plan_visual_data(subject_or_topic, concept, visual_type)
