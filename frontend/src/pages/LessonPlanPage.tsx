import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  GraduationCap,
  Target,
  Compass,
  Clock,
  BarChart2,
  Share2,
  Download,
  BookOpen,
  User,
  Zap,
  Calculator,
  Cpu,
  HelpCircle,
  Link as LinkIcon,
  Play,
  Lightbulb,
  Edit3
} from 'lucide-react';
import type { LessonPlan } from '../types';

export const LessonPlanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCurriculumView, setActiveCurriculumView] = useState<'visual' | 'markdown'>('visual');

  const plan: LessonPlan = location.state?.plan || {
    id: "demo_electricity_101",
    title: "Electricity & Ohm's Law — Tailored Lesson Plan",
    topic: "Electricity & Ohm's Law",
    objective: "Master Voltage, Current, and Resistance relationship with interactive visual demonstrations",
    estimated_minutes: 30,
    difficulty: "Undergraduate / College",
    language: "English",
    sections: [
      {
        id: "sec_1",
        title: "Section 1: Intuitive Physical Foundations & Core Variables",
        duration: 10,
        concepts: ["Voltage as Potential Difference", "Current as Flow Rate", "Resistance as Opposition"],
        examples: ["Water Pipe & Pump Analogy"],
        visual_type: "graph",
        question_type: "conceptual",
        question: "What happens to the current in a circuit when resistance increases while voltage is constant?",
        expected_answer: "Current decreases because resistance opposes the flow of electric charge (I = V/R)."
      },
      {
        id: "sec_2",
        title: "Section 2: Mathematical Formulation & Quantitative Derivation",
        duration: 12,
        concepts: ["V = I × R Formulation", "Linear V-I Characteristics", "Slope as Resistance"],
        examples: ["Automotive Headlamp Circuit (12V)"],
        visual_type: "equation",
        question_type: "problem_solving",
        question: "If a circuit is powered by a 12V supply and has a resistance of 4 Ohms, calculate the current I.",
        expected_answer: "3 Amperes (I = V/R = 12/4 = 3A)"
      },
      {
        id: "sec_3",
        title: "Section 3: Practical Circuit Application & Misconception Traps",
        duration: 8,
        concepts: ["Internal Resistance", "Load Balancing", "Common Current Traps"],
        examples: ["Household Electrical Outlets"],
        visual_type: "diagram",
        question_type: "conceptual",
        question: "Why does current not increase when you add more resistance in a standard circuit?",
        expected_answer: "Current is inversely proportional to resistance according to Ohm's Law."
      }
    ]
  };

  const handleStartLesson = () => {
    navigate(`/teach/${plan.id}`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Curriculum Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-600 block">
              EDUCATIONAL ARCHITECT CURRICULUM
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {plan.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            <button
              onClick={() => alert("Curriculum exported as PDF/JSON")}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>

            <button
              onClick={() => alert("Share link copied to clipboard")}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Undergraduate / College</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            <Target className="w-3.5 h-3.5" />
            <span>Foundational understanding</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Socratic Style</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{plan.estimated_minutes || 30} minutes</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Deep dive</span>
          </span>
        </div>
      </div>

      {/* Two-Column Curriculum Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols): Profile Summary, Overview & Session Summary */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Learner Profile Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span>Learner Profile Summary</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
              <div className="pt-1">
                <span className="font-semibold text-slate-800">Level & Goal: </span>
                <span>Undergraduate / College | Foundational understanding</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800">Format: </span>
                <span>Socratic Style</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800">Total Time: </span>
                <span>{plan.estimated_minutes || 30} minutes</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800">Depth: </span>
                <span>Deep dive</span>
              </div>
            </div>
          </div>

          {/* 2. Curriculum Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>Curriculum Overview</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This structured curriculum uses intuitive physical analogies and quantitative derivation to build a deep, lasting understanding of Ohm's Law and its real-world applications.
            </p>

            {/* View Toggle Buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveCurriculumView('visual')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCurriculumView === 'visual'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>&lt;/&gt; Visual Curriculum</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveCurriculumView('markdown')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCurriculumView === 'markdown'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>&lt;/&gt; Markdown Output</span>
              </button>
            </div>
          </div>

          {/* 3. Session Summary with 100% Circle Progress */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Session Summary</span>
              </div>
              <div className="flex items-center space-x-6 text-xs text-slate-600">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Total Time</span>
                  <span className="font-bold text-slate-800 text-sm">{plan.estimated_minutes || 30} minutes</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Sections</span>
                  <span className="font-bold text-slate-800 text-sm">{plan.sections.length || 3}</span>
                </div>
              </div>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="100, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-slate-800">100%</span>
            </div>
          </div>
        </div>

        {/* Right Column (8 cols): Curriculum Section Cards */}
        <div className="lg:col-span-8 space-y-4">
          {plan.sections.map((sec, idx) => {
            const num = (idx + 1).toString().padStart(2, '0');
            const icons = [
              <Zap key="1" className="w-4 h-4 fill-current" />,
              <Calculator key="2" className="w-4 h-4" />,
              <Cpu key="3" className="w-4 h-4" />
            ];
            const colors = [
              { badge: 'bg-indigo-600', iconBg: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-200' },
              { badge: 'bg-blue-600', iconBg: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-200' },
              { badge: 'bg-emerald-600', iconBg: 'bg-emerald-50 text-emerald-600', hover: 'hover:border-emerald-200' }
            ];
            const style = colors[idx % colors.length];

            return (
              <div
                key={sec.id || idx}
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 ${style.hover} transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className={`w-7 h-7 rounded-md ${style.badge} text-white font-bold text-xs flex items-center justify-center`}>
                      {num}
                    </span>
                    <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
                      {icons[idx % icons.length]}
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {sec.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                      ⏱ {sec.duration || 10} min
                    </span>
                  </div>
                </div>

                {/* Tag Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-100 text-slate-700">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span className="font-semibold text-slate-900">Key Concepts</span>
                    <span className="text-slate-500">{sec.concepts?.length || 3} Topics</span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-slate-700">
                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-semibold text-slate-900">Guided Exercise</span>
                    <span className="text-slate-500">{sec.examples?.[0] || 'Interactive Exercise'}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50/80 border border-purple-100 text-slate-700">
                    <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-semibold text-slate-900">Knowledge Check</span>
                    <span className="text-slate-500">2 Questions</span>
                  </div>

                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-50/80 border border-cyan-100 text-slate-700">
                    <LinkIcon className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="font-semibold text-slate-900">Real-world Connection</span>
                    <span className="text-slate-500">Applied Engineering</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Next Steps & Practice Roadmap Card */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-2">
            <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>Next Steps & Practice Roadmap</span>
            </div>
            <div className="text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-slate-800">Immediate Action: </span>
                <span>Solve 5 Ohm's Law problems from real circuits.</span>
              </div>
              <div className="text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Further Exploration: </span>
                <span>• Kirchhoff's Laws • Series & Parallel Circuits • Power & Energy</span>
              </div>
            </div>
          </div>

          {/* Launch Interactive AI Classroom Button */}
          <div className="pt-2">
            <button
              onClick={handleStartLesson}
              className="w-full py-4 rounded-xl primary-button font-bold text-sm sm:text-base flex items-center justify-center space-x-3 shadow-lg cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Launch Interactive AI Video Lesson</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
