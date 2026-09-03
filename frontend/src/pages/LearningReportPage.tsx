import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, AlertTriangle, BookOpen, Compass } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchAssessmentReport } from '../services/api';
import type { AssessmentReport } from '../types';

export const LearningReportPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<AssessmentReport | null>(null);

  useEffect(() => {
    async function load() {
      if (!lessonId) return;
      try {
        const data = await fetchAssessmentReport(lessonId);
        setReport(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [lessonId]);

  const reportData = report || {
    assessment_id: "assess_demo",
    overall_score: 82.0,
    concept_scores: {
      "Voltage": 95.0,
      "Current": 88.0,
      "Resistance": 60.0,
      "Ohm's Law": 70.0
    },
    weak_areas: ["Resistance inverse proportionality", "Calculation under constant voltage"],
    strong_areas: ["Voltage potential concept", "Current flow directional mechanics"],
    recommended_revisions: [
      "Review Ohm's Law water pipe friction analogy",
      "Practice Resistance calculation problems (I = V / R)"
    ],
    next_recommended_topic: "Electrical Power & Energy (P = V × I)"
  };

  const chartData = Object.entries(reportData.concept_scores).map(([concept, score]) => ({
    concept,
    score,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header Report Card */}
      <div className="glass-panel p-8 rounded-3xl text-center space-y-4 border border-indigo-500/40 relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 bg-indigo-950 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300 border border-indigo-500/40">
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Official Learning Performance Report</span>
        </div>

        {/* Big Score Gauge */}
        <div className="py-2">
          <div className="text-6xl font-extrabold text-white tracking-tight gradient-text">
            {reportData.overall_score}%
          </div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">Overall Concept Mastery Score</p>
        </div>
      </div>

      {/* Concept Breakdown Chart */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          <span>Concept Mastery Breakdown</span>
        </h3>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="concept" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#6366f1', borderRadius: '0.75rem', color: '#fff' }} />
              <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strong vs Weak Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Strong Mastery Areas</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            {reportData.strong_areas.map((sa, i) => (
              <div key={i} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>{sa}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="glass-card p-6 rounded-3xl border border-amber-500/30 space-y-3">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Weak Concepts (Needs Focus)</span>
          </div>
          <div className="space-y-2 text-xs text-slate-300">
            {reportData.weak_areas.map((wa, i) => (
              <div key={i} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center space-x-2">
                <span className="text-amber-400">△</span>
                <span>{wa}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revision Recommendations & Next Topic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-3">
          <h3 className="font-bold text-white text-base">Recommended Revision</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {reportData.recommended_revisions.map((rev, i) => (
              <li key={i} className="flex items-center space-x-2">
                <span className="text-indigo-400">→</span>
                <span>{rev}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Next Recommended Topic</span>
            <h3 className="text-lg font-bold text-white mt-1">{reportData.next_recommended_topic}</h3>
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            className="w-full py-3 rounded-xl gradient-button text-xs font-bold shadow-lg flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4" />
            <span>Start Next Topic</span>
          </button>
        </div>
      </div>
    </div>
  );
};
