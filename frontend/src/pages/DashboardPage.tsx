import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Flame, Award, TrendingUp, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { fetchDashboardProgress, startDemoScenario } from '../services/api';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDashboardProgress();
        setProgress(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const data = progress || {
    total_lessons: 4,
    completed_lessons: 3,
    streak_days: 5,
    average_score: 84.5,
    weak_concepts: ["Resistance calculation", "Inverse proportionality"],
    strong_concepts: ["Voltage potential", "Current flow", "Circuit loops"],
    recommended_topics: ["Electrical Power (P = VI)", "Kirchhoff's Laws", "AC/DC Circuits"]
  };

  const handleLaunchDemo = async () => {
    try {
      const res = await startDemoScenario();
      if (res.demo_lesson_id) {
        navigate(`/teach/${res.demo_lesson_id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Welcome back! Track your learning streak, scores, and active topics.</p>
        </div>

        <button
          onClick={handleLaunchDemo}
          className="px-5 py-2.5 rounded-xl primary-button text-xs font-bold shadow-md flex items-center space-x-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Electricity Demo Lesson</span>
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Learning Streak</span>
            <Flame className="w-5 h-5 fill-amber-400 text-amber-500 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{data.streak_days} Days</div>
          <p className="text-xs text-slate-500">Consistent daily study streak</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Lessons</span>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{data.completed_lessons} / {data.total_lessons}</div>
          <p className="text-xs text-slate-500">75% completion rate</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Score</span>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{data.average_score}%</div>
          <p className="text-xs text-slate-500">Across all assessment quizzes</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mastery Level</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">Developing</div>
          <p className="text-xs text-slate-500">Level 2 Educator Tier</p>
        </div>
      </div>

      {/* Recommended Topics & Weak Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Recommended Topics to Study Next</h3>
          <div className="space-y-3">
            {data.recommended_topics.map((topic: string, idx: number) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700 hover:border-indigo-200 transition-all">
                <span className="font-semibold text-slate-900">{topic}</span>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Target Weak Concepts</span>
          </h3>
          <div className="space-y-3">
            {data.weak_concepts.map((wc: string, idx: number) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
                <span className="text-amber-600 font-semibold">Focus Area:</span> {wc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
