import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, Brain, Zap, Languages, ArrowRight } from 'lucide-react';
import { startDemoScenario } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleDemoLaunch = async () => {
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
    <div className="space-y-20 pb-20">
      {/* Hero Banner */}
      <section className="relative pt-16 pb-12 text-center max-w-5xl mx-auto px-4 space-y-8">
        <div className="inline-flex items-center space-x-2 bg-indigo-950/80 border border-indigo-500/40 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-300 shadow-xl">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>AI Educator — Hackathon 2026 Innovation</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Meet Your <span className="gradient-text">Personalized AI Teacher</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Learn anything. Your way. At your pace. An adaptive digital educator that explains through interactive video, detects misconceptions, and adjusts teaching strategies in real-time.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/onboarding')}
            className="px-8 py-4 rounded-2xl gradient-button text-base font-bold shadow-2xl flex items-center space-x-3 group"
          >
            <span>Start Learning Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleDemoLaunch}
            className="px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/50 text-indigo-300 font-bold text-base shadow-xl flex items-center space-x-3 transition-all"
          >
            <Play className="w-5 h-5 fill-indigo-400 text-indigo-400" />
            <span>Try Interactive Demo</span>
          </button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Adaptive Teaching Loop</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Not a simple chatbot. Evaluates answers, diagnoses specific student misconceptions, and switches explanation strategies dynamically.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Interactive Video & Visuals</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Human-like animated teacher avatar with natural voice paired with dynamic equation solvers, coordinate graphs, and execution code blocks.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Languages className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Multilingual & RAG Ready</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Upload PDFs/DOCXs for grounded citation teaching, and seamlessly switch languages (English, Hindi, Hinglish, Telugu) mid-lesson.
          </p>
        </div>
      </section>

      {/* Teaching Loop Flow Visual */}
      <section className="max-w-5xl mx-auto px-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <h2 className="text-2xl font-bold text-white">The 8-Step Intelligent Teaching Cycle</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono font-semibold text-slate-300">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">1. UNDERSTAND</div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">2. PLAN</div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">3. EXPLAIN</div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">4. DEMONSTRATE</div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">5. QUESTION</div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">6. EVALUATE</div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">7. ADAPT</div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">8. CONTINUE</div>
        </div>
      </section>
    </div>
  );
};
