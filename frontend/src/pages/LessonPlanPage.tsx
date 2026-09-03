import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Play, Layers, Target } from 'lucide-react';
import type { LessonPlan } from '../types';

export const LessonPlanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const plan: LessonPlan = location.state?.plan || {
    id: "lesson_default",
    title: "Introduction to Electricity & Ohm's Law",
    topic: "Electricity & Ohm's Law",
    objective: "Understand Voltage, Current, and Resistance interaction",
    estimated_minutes: 20,
    difficulty: "beginner",
    language: "English",
    sections: [
      {
        id: "sec_1",
        title: "1. Core Principles of Ohm's Law",
        duration: 5,
        concepts: ["Voltage", "Current", "Resistance"],
        examples: ["Water pressure analogy"],
        visual_type: "graph",
        question: "What happens to current when resistance increases under constant voltage?"
      },
      {
        id: "sec_2",
        title: "2. Quantitative Derivation & Calculation",
        duration: 8,
        concepts: ["V = I x R Formula"],
        examples: ["12V battery across 4 Ohm resistor"],
        visual_type: "equation",
        question: "If V=12V and R=4 Ohms, what is Current I?"
      }
    ]
  };

  const handleStartLesson = () => {
    navigate(`/teach/${plan.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Info Banner */}
      <div className="glass-panel p-8 rounded-3xl space-y-4 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-blue-950 text-blue-400 text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
            {plan.difficulty} • {plan.language}
          </span>
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Estimated: {plan.estimated_minutes} Minutes</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-white">{plan.title}</h1>
        <p className="text-slate-300 text-sm flex items-center space-x-2">
          <Target className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span><b>Objective:</b> {plan.objective}</span>
        </p>
      </div>

      {/* Curriculum Sections List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Generated Lesson Curriculum ({plan.sections.length} Sections)</span>
        </h2>

        <div className="space-y-3">
          {plan.sections.map((sec, idx) => (
            <div key={idx} className="glass-card p-5 rounded-2xl flex items-center justify-between border border-slate-800">
              <div className="space-y-1">
                <h3 className="font-bold text-white text-base">{sec.title}</h3>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-indigo-300 font-mono">
                    Visual: {sec.visual_type.toUpperCase()}
                  </span>
                  <span>Est: {sec.duration} mins</span>
                </div>
              </div>
              <span className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center text-xs">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Launch CTA */}
      <button
        onClick={handleStartLesson}
        className="w-full py-4 rounded-2xl gradient-button text-base font-bold shadow-2xl flex items-center justify-center space-x-3"
      >
        <Play className="w-5 h-5 fill-white" />
        <span>Launch Interactive AI Video Lesson</span>
      </button>
    </div>
  );
};
