import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Play, Layers, Target, BookOpen, CheckCircle, Lightbulb, Compass, Copy, Check, Code2, Sparkles, ArrowRight } from 'lucide-react';
import type { LessonPlan, LearnerProfile } from '../types';

export const LessonPlanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'visual' | 'markdown'>('visual');
  const [copied, setCopied] = useState(false);

  const profile: LearnerProfile = location.state?.profile || {
    name: 'Learner',
    education_level: 'Undergraduate',
    learning_goal: 'Foundational understanding',
    preferred_language: 'English',
    teaching_style: 'Socratic',
    available_time: '30 minutes',
    desired_depth: 'Deep dive',
  };

  const plan: LessonPlan = location.state?.plan || {
    id: "lesson_default",
    title: "Electricity & Ohm's Law — Tailored Lesson Plan",
    topic: "Electricity & Ohm's Law",
    objective: "Master core principles, quantitative formulas, and practical applications of Ohm's Law.",
    overview: "This structured curriculum guides the Undergraduate learner from intuitive foundational concepts through rigorous practical application to achieve Foundational understanding in Electricity & Ohm's Law.",
    education_level: profile.education_level,
    learning_goal: profile.learning_goal,
    teaching_style: profile.teaching_style,
    available_time: profile.available_time,
    desired_depth: profile.desired_depth,
    estimated_minutes: 25,
    difficulty: profile.education_level,
    language: profile.preferred_language,
    sections: [
      {
        id: "sec_1",
        title: "Section 1: Intuitive Physical Foundations & Core Variables",
        duration: 5,
        objective: "Build intuitive physical mental models of Voltage, Current, and Resistance using hydraulic analogies.",
        explanation: "Welcome! Today we are exploring Ohm's Law through first principles. Think of voltage as potential pressure and resistance as opposition to charge flow.",
        concepts: [
          "Potential Difference (Voltage): Electrical pressure driving electron movement through conductive paths",
          "Current Flow: Quantitative rate of charge displacement measured in Amperes",
          "Electrical Resistance: Material-level atomic opposition to current flow measured in Ohms"
        ],
        guided_exercise: "Imagine a pressurized water pipe with an adjustable valve. Squeezing the valve represents increasing resistance.",
        knowledge_check: "What happens to current when resistance increases while voltage remains constant?",
        examples: ["Water pressure and flow rate analogy"],
        visual_type: "graph",
        question: "What happens to the current flowing through a circuit when resistance increases while voltage remains constant?"
      },
      {
        id: "sec_2",
        title: "Section 2: Mathematical Formulation & Quantitative Analysis",
        duration: 12,
        objective: "Derive and calculate exact numerical quantities using V = I × R across series and parallel loads.",
        explanation: "Now we formulate the quantitative governing equation V = I × R and analyze its linear slope.",
        concepts: [
          "Governing Formula: V = I × R and its algebraic reformulations I = V / R and R = V / I",
          "Linear Proportionality: Direct relationship between Voltage and Current on V-I slope"
        ],
        guided_exercise: "Compute the current in a 12V automotive battery circuit powering a 4 Ohm headlight lamp.",
        knowledge_check: "If Voltage is 12V and Resistance is 4 Ohms, what is Current I?",
        examples: ["12V battery across 4 Ohm load yielding 3 Amperes"],
        visual_type: "equation",
        question: "If V=12V and R=4 Ohms, what is Current I?"
      },
      {
        id: "sec_3",
        title: "Section 3: Practical Circuit Application & Boundary Diagnostics",
        duration: 8,
        objective: "Synthesize principles to troubleshoot real-world circuit anomalies and avoid common exam traps.",
        explanation: "Let us examine real-world engineering constraints, non-ideal components, and diagnostic procedures.",
        concepts: [
          "Boundary Limits: Non-ohmic behavior in real filament lamps vs ideal resistors",
          "Diagnostic Analysis: Troubleshooting open-circuit and short-circuit failure modes"
        ],
        guided_exercise: "Examine a multi-node schematic to predict voltage drop across series resistors.",
        knowledge_check: "Why does a real light bulb filament exhibit a non-linear V-I curve as temperature rises?",
        examples: ["Incandescent bulb dynamic resistance shift"],
        visual_type: "diagram",
        question: "In a series circuit, if one resistor increases in value, what happens to total circuit current?"
      }
    ],
    next_steps: {
      immediate_action: "Complete the interactive misconception assessment quiz on Ohm's Law.",
      further_exploration: [
        "Investigate Kirchhoff's Voltage and Current Laws (KVL & KCL).",
        "Analyze AC circuits and impedance with inductive and capacitive loads."
      ]
    }
  };

  const handleStartLesson = () => {
    navigate(`/teach/${plan.id}`);
  };

  const handleCopyMarkdown = () => {
    if (plan.markdown_curriculum) {
      navigator.clipboard.writeText(plan.markdown_curriculum);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Learner Profile Summary Banner */}
      <div className="glass-panel p-8 rounded-3xl space-y-5 border border-blue-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blue-950/80 text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-500/40">
              {plan.education_level || profile.education_level} • {plan.language}
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-950/80 text-purple-300 text-xs font-bold border border-purple-500/40">
              {plan.teaching_style || profile.teaching_style} Style
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Total Time: <b>{plan.available_time || `${plan.estimated_minutes} Minutes`}</b></span>
            <span className="text-slate-600">|</span>
            <span>Depth: <b>{plan.desired_depth || profile.desired_depth}</b></span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">Educational Architect Curriculum</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">{plan.title}</h1>
        </div>

        {/* Learner Profile Summary Callout */}
        <div className="bg-slate-950/60 border-l-4 border-indigo-500 p-4 rounded-r-xl space-y-1 text-xs text-slate-300">
          <p className="font-bold text-indigo-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learner Profile Summary</span>
          </p>
          <p>
            <b>Level & Goal:</b> {plan.education_level || profile.education_level} | {plan.learning_goal || profile.learning_goal}
          </p>
          <p>
            <b>Format:</b> {plan.teaching_style || profile.teaching_style} Style | {plan.available_time || profile.available_time} Total | {plan.desired_depth || profile.desired_depth} Depth
          </p>
        </div>

        {/* Curriculum Overview */}
        {plan.overview && (
          <div className="space-y-1 pt-1 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Curriculum Overview</h3>
            <p className="text-sm text-slate-300 italic leading-relaxed">
              "{plan.overview}"
            </p>
          </div>
        )}
      </div>

      {/* Tab Switcher: Interactive Visual vs Markdown Plan */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'visual'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Visual Curriculum ({plan.sections.length} Sections)</span>
          </button>

          <button
            onClick={() => setActiveTab('markdown')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'markdown'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Markdown Schema Output</span>
          </button>
        </div>

        {activeTab === 'markdown' && plan.markdown_curriculum && (
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied!" : "Copy Markdown"}</span>
          </button>
        )}
      </div>

      {/* Tab 1: Visual Sections View */}
      {activeTab === 'visual' ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {plan.sections.map((sec, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition-all">
                {/* Section Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <h3 className="font-bold text-white text-lg">{sec.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-indigo-300 font-mono text-[11px]">
                      Visual: {sec.visual_type.toUpperCase()}
                    </span>
                    <span className="bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-cyan-300 font-medium">
                      ⏱ {sec.duration} mins
                    </span>
                  </div>
                </div>

                {/* Section Objective */}
                {sec.objective && (
                  <div className="flex items-start space-x-2 text-xs text-emerald-300 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
                    <Target className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span><b>Objective:</b> {sec.objective}</span>
                  </div>
                )}

                {/* 1. Key Concepts */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                    <span>1. Key Concepts</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 pl-2">
                    {sec.concepts.map((concept, cIdx) => (
                      <li key={cIdx} className="flex items-start space-x-2">
                        <span className="text-blue-400 font-bold mt-0.5">•</span>
                        <span>{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Guided Exercise / Example */}
                {(sec.guided_exercise || (sec.examples && sec.examples.length > 0)) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>2. Guided Exercise / Example</span>
                    </h4>
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs text-amber-200/90 leading-relaxed">
                      {sec.guided_exercise || sec.examples.join('; ')}
                    </div>
                  </div>
                )}

                {/* 3. Knowledge Check & Reflection */}
                {(sec.knowledge_check || sec.question) && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                      <span>3. Knowledge Check & Reflection</span>
                    </h4>
                    <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-500/20 text-xs text-purple-200 font-medium">
                      {sec.knowledge_check || sec.question}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Next Steps & Practice Roadmap */}
          {plan.next_steps && (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                <span>Next Steps & Practice Roadmap</span>
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-start space-x-2">
                  <span className="font-bold text-emerald-300 whitespace-nowrap">Immediate Action:</span>
                  <span className="text-slate-300">{plan.next_steps.immediate_action}</span>
                </div>

                {plan.next_steps.further_exploration && plan.next_steps.further_exploration.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="font-bold text-emerald-300">Further Exploration:</span>
                    <ul className="pl-4 space-y-1 text-slate-300 list-disc">
                      {plan.next_steps.further_exploration.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Raw Markdown View */
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <pre className="bg-slate-950 p-6 rounded-xl text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-800">
            {plan.markdown_curriculum || "# No raw markdown generated"}
          </pre>
        </div>
      )}

      {/* Launch CTA */}
      <button
        onClick={handleStartLesson}
        className="w-full py-4 rounded-2xl gradient-button text-base font-bold shadow-2xl flex items-center justify-center space-x-3 transition-transform hover:scale-[1.01]"
      >
        <Play className="w-5 h-5 fill-white" />
        <span>Launch Interactive AI Video Lesson</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

