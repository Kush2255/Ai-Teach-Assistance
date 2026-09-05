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
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Globe2,
  Database,
  Brain
} from 'lucide-react';
import type { LessonPlan } from '../types';
import { API_BASE } from '../services/api';

export const LessonPlanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCurriculumView, setActiveCurriculumView] = useState<'visual' | 'markdown'>('visual');
  const [expandedSection, setExpandedSection] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  // Use passed plan, or fallback to an informed default
  const plan: LessonPlan = location.state?.plan || {
    id: "demo_electricity_101",
    title: "Personalized Lesson Curriculum",
    topic: "Core Principles",
    objective: "Master core principles with interactive visual demonstrations and guided exercises",
    overview: "This structured curriculum uses progressive cognitive scaffolding and interactive visual models to build a deep, lasting conceptual understanding.",
    estimated_minutes: 30,
    difficulty: "Undergraduate",
    language: "English",
    teaching_style: "Socratic",
    desired_depth: "Deep dive",
    immediate_action: "Complete the guided exercises and test your reasoning on core applications.",
    further_exploration: [
      "Advanced analytical modeling and extensions",
      "Real-world case studies and system design",
      "Interdisciplinary connections and problem sets"
    ],
    sections: [
      {
        id: "sec_1",
        title: "Section 1: Foundations & Core Principles",
        duration: 10,
        section_objective: "Establish intuitive physical foundations and core parameters.",
        explanation: "Let's begin by establishing intuitive foundations before formalizing quantitative equations.",
        concepts: ["Core Definitions & Foundational Principles", "Variables & Key Relationships"],
        examples: ["Intuitive real-world analogy and observation"],
        guided_exercise: "Analyze a concrete scenario and predict the outcome step by step.",
        knowledge_check: [
          "In your own words, what is the core principle?",
          "How do the key variables interact with each other?"
        ],
        real_world_connection: "Everyday phenomena and industrial systems.",
        visual_type: "graph",
        visual_description: "Interactive graph showing key relationship curves.",
        question: "Explain the primary governing relationship.",
        expected_answer: "A clear conceptual explanation of the core principle and cause-effect dynamics."
      },
      {
        id: "sec_2",
        title: "Section 2: Quantitative Analysis & Mathematical Formulation",
        duration: 12,
        section_objective: "Formulate governing equations and solve quantitative models.",
        explanation: "Now we translate our conceptual intuition into formal mathematical relationships.",
        concepts: ["Mathematical Derivations", "Governing Formulas", "Proportional Dynamics"],
        examples: ["Step-by-step worked numerical example"],
        guided_exercise: "Solve a quantitative problem using the main governing formula.",
        knowledge_check: [
          "State the primary formula and define each variable.",
          "Walk through solving a numerical worked example."
        ],
        real_world_connection: "Quantitative engineering calculations and laboratory testing.",
        visual_type: "equation",
        visual_description: "Mathematical formula derivation and parameter breakdown.",
        question: "Calculate the outcome using the governing formula.",
        expected_answer: "A correct step-by-step solution applying the core equation."
      },
      {
        id: "sec_3",
        title: "Section 3: Practical Application & Misconception Traps",
        duration: 8,
        section_objective: "Apply principles to realistic scenarios and deconstruct common misconception traps.",
        explanation: "Finally, we explore practical applications and address common misunderstandings.",
        concepts: ["Practical System Applications", "Non-Ideal Boundary Conditions", "Common Misconceptions"],
        examples: ["Real-world case study"],
        guided_exercise: "Diagnose a real-world scenario and identify potential failure modes.",
        knowledge_check: [
          "What is the most common mistake students make?",
          "How do non-ideal conditions affect the system?"
        ],
        real_world_connection: "Modern industrial technology and practical applications.",
        visual_type: "diagram",
        visual_description: "System diagram showing practical application flow.",
        question: "Identify and correct a common misunderstanding in this topic.",
        expected_answer: "A clear identification of the misconception and the correct principle."
      }
    ]
  };

  const handleStartLesson = async () => {
    let lessonId = plan.id;
    if (!lessonId || lessonId === 'demo_electricity_101') {
      try {
        const res = await fetch(`${API_BASE}/demo/start`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          lessonId = data.demo_lesson_id || 'demo_electricity_101';
        } else {
          lessonId = 'demo_electricity_101';
        }
      } catch {
        lessonId = 'demo_electricity_101';
      }
    }
    navigate(`/teach/${lessonId}`);
  };

  const handleCopyMarkdown = () => {
    const textToCopy = plan.markdown_curriculum || "";
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const textToExport = plan.markdown_curriculum || `# ${plan.title}\n\n${plan.overview}`;
    const blob = new Blob([textToExport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${plan.topic.replace(/\s+/g, '_')}_Curriculum.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalTime = plan.estimated_minutes || plan.total_time_minutes || 30;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Curriculum Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-600 block">
                WORKFLOW 3 — PERSONALIZED CURRICULUM
              </span>
              {plan.source_type === 'uploaded_material' && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold">
                  <Database className="w-3 h-3" />
                  <span>Source Grounded</span>
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              {plan.title}
            </h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 self-start sm:self-auto">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
              title="Download Markdown Curriculum"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export .md</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
              title="Copy Markdown curriculum to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{plan.difficulty || "Undergraduate"}</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            <Target className="w-3.5 h-3.5" />
            <span>{plan.objective ? "Targeted Outcome" : "Foundational understanding"}</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>{plan.teaching_style || "Socratic"} Style</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            <span>{totalTime} minutes</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>{plan.desired_depth || "Deep dive"}</span>
          </span>

          <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold">
            <Globe2 className="w-3.5 h-3.5" />
            <span>{plan.language || "English"}</span>
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
              <span>Personalization Blueprint</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
              <div className="pt-1">
                <span className="font-semibold text-slate-800">Topic: </span>
                <span className="text-slate-900 font-medium">{plan.topic}</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800">Education Level: </span>
                <span>{plan.difficulty || "Undergraduate"}</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800">Teaching Methodology: </span>
                <span>{plan.teaching_style || "Socratic"}</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800">Total Allocated Time: </span>
                <span className="font-bold text-indigo-600">{totalTime} minutes</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800">Curriculum Depth: </span>
                <span>{plan.desired_depth || "Deep dive"}</span>
              </div>
              <div className="pt-2">
                <span className="font-semibold text-slate-800">Instruction Language: </span>
                <span>{plan.language || "English"}</span>
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
              {plan.overview || "This structured curriculum uses progressive cognitive scaffolding to build a deep, lasting conceptual understanding."}
            </p>

            {plan.objective && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Primary Objective:</span>
                <span>{plan.objective}</span>
              </div>
            )}

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
                <span>&lt;/&gt; Interactive Blueprint</span>
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

          {/* 3. Session Summary with Time Calibration Circle */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Time Calibration</span>
              </div>
              <div className="flex items-center space-x-6 text-xs text-slate-600">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Total Time</span>
                  <span className="font-bold text-slate-800 text-sm">{totalTime} mins</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-bold">Sections</span>
                  <span className="font-bold text-slate-800 text-sm">{plan.sections?.length || 3}</span>
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
          {activeCurriculumView === 'markdown' ? (
            /* Markdown Output View */
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-6 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto relative space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
                <span className="text-xs font-bold text-indigo-400">Educational Architect Markdown Curriculum</span>
                <button
                  onClick={handleCopyMarkdown}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy Markdown"}</span>
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-slate-300 text-[11px] leading-relaxed">
                {plan.markdown_curriculum || `# ${plan.title}\n\n${plan.overview}`}
              </pre>
            </div>
          ) : (
            /* Interactive Section Cards with Accordion Expander */
            <>
              {plan.sections?.map((sec, idx) => {
                const num = (idx + 1).toString().padStart(2, '0');
                const isExpanded = expandedSection === idx;
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
                    {/* Header */}
                    <div
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setExpandedSection(isExpanded ? null : idx)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-7 h-7 rounded-md ${style.badge} text-white font-bold text-xs flex items-center justify-center`}>
                          {num}
                        </span>
                        <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
                          {icons[idx % icons.length]}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            {sec.title}
                          </h3>
                          {sec.section_objective && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {sec.section_objective}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                          ⏱ {sec.duration || 10} min
                        </span>
                        <div className="text-slate-400 hover:text-slate-600">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Tag Badges Summary */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-100 text-slate-700">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-semibold text-slate-900">Key Concepts</span>
                        <span className="text-slate-500">{sec.concepts?.length || 2} items</span>
                      </div>

                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-slate-700">
                        <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold text-slate-900">Guided Exercise</span>
                        <span className="text-slate-500 truncate max-w-[150px]">
                          {typeof sec.guided_exercise === 'string' ? sec.guided_exercise : (sec.examples?.[0] || 'Interactive')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50/80 border border-purple-100 text-slate-700">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                        <span className="font-semibold text-slate-900">Knowledge Check</span>
                        <span className="text-slate-500">{sec.knowledge_check?.length || 1} Question</span>
                      </div>

                      {sec.visual_type && (
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-50/80 border border-cyan-100 text-slate-700">
                          <Eye className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="font-semibold text-slate-900">Visual</span>
                          <span className="text-cyan-700 font-medium capitalize">{sec.visual_type}</span>
                        </div>
                      )}
                    </div>

                    {/* Detailed Section Drawer when Expanded */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-3.5 text-xs text-slate-700 animate-fadeIn">
                        {/* Spoken Explanation Preview */}
                        {sec.explanation && (
                          <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                            <span className="font-bold text-slate-900 block flex items-center space-x-1">
                              <Brain className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Instructional Script & Mental Model</span>
                            </span>
                            <p className="text-slate-600 leading-relaxed italic">
                              "{sec.explanation}"
                            </p>
                          </div>
                        )}

                        {/* Concept Breakdown */}
                        {sec.concepts && sec.concepts.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-bold text-slate-900 block">Concepts Covered:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                              {sec.concepts.map((c, cIdx) => (
                                <li key={cIdx}>{typeof c === 'string' ? c : JSON.stringify(c)}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Knowledge Check & Evaluative Question */}
                        {sec.question && (
                          <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                            <span className="font-bold text-indigo-900 block">Evaluative Question:</span>
                            <p className="text-indigo-800 font-medium">{sec.question}</p>
                            {sec.expected_answer && (
                              <p className="text-[11px] text-slate-500 mt-1">
                                <span className="font-semibold text-slate-700">Target Mastery: </span>
                                {sec.expected_answer}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Real-World Connection / Transition */}
                        {(sec.real_world_connection || sec.transition) && (
                          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{sec.real_world_connection || sec.transition}</span>
                          </div>
                        )}
                      </div>
                    )}
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
                    <span>{plan.immediate_action || "Complete the practice problem set."}</span>
                  </div>
                  {plan.further_exploration && plan.further_exploration.length > 0 && (
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Further Exploration: </span>
                      <span>{plan.further_exploration.map(f => `• ${f}`).join(' ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Launch Interactive AI Classroom Button */}
              <div className="pt-2">
                <button
                  onClick={handleStartLesson}
                  className="w-full py-4 rounded-xl primary-button font-bold text-sm sm:text-base flex items-center justify-center space-x-3 shadow-lg cursor-pointer transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Start Interactive AI Video Classroom</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
