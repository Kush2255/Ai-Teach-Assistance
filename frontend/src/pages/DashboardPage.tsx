import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Flame, Award, TrendingUp, AlertTriangle, ArrowRight, Play } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Student Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome back! Track your learning streak, scores, and active topics.</p>
        </div>

        <button
          onClick={handleLaunchDemo}
          className="px-5 py-2.5 rounded-xl gradient-button text-xs font-bold shadow-lg flex items-center space-x-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Electricity Demo Lesson</span>
        </button>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Learning Streak</span>
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data.streak_days} Days</div>
          <p className="text-[10px] text-slate-400">Consistent daily study streak</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Lessons</span>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data.completed_lessons} / {data.total_lessons}</div>
          <p className="text-[10px] text-slate-400">75% completion rate</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Score</span>
            <Award className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data.average_score}%</div>
          <p className="text-[10px] text-slate-400">Across all assessment quizzes</p>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Mastery Level</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-3xl font-extrabold text-white">Developing</div>
          <p className="text-[10px] text-slate-400">Level 2 Educator Tier</p>
        </div>
      </div>

      {/* Recommended Topics & Weak Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-4">
          <h3 className="font-bold text-white text-base">Recommended Topics to Study Next</h3>
          <div className="space-y-3">
            {data.recommended_topics.map((topic: string, idx: number) => (
              <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-200">
                <span className="font-semibold">{topic}</span>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center space-x-1"
                >
                  <span>Start</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 space-y-4">
          <h3 className="font-bold text-white text-base flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Target Weak Concepts</span>
          </h3>
          <div className="space-y-3">
            {data.weak_concepts.map((wc: string, idx: number) => (
              <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                <span className="text-amber-400 font-semibold">Focus Area:</span> {wc}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
