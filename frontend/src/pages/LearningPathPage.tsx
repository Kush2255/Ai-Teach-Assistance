import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, CheckCircle2, Play, Lock, AlertCircle } from 'lucide-react';
import { fetchLearningPath, startDemoScenario } from '../services/api';
import type { LearningPathModule } from '../types';

export const LearningPathPage: React.FC = () => {
  const navigate = useNavigate();
  const [pathData, setPathData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchLearningPath();
        setPathData(res);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const modules: LearningPathModule[] = pathData?.modules || [
    {
      id: "mod_1",
      title: "1. Charge & Voltage",
      status: "completed",
      score: 92.0,
      description: "Electric charges, potential difference, and field vectors."
    },
    {
      id: "mod_2",
      title: "2. Electricity & Ohm's Law",
      status: "in_progress",
      score: 82.0,
      description: "V = I × R relationships, resistance, and current flow."
    },
    {
      id: "mod_3",
      title: "3. Electrical Power (P = VI)",
      status: "unlocked",
      score: 0.0,
      description: "Energy dissipation, wattage, and Joule heating."
    },
    {
      id: "mod_4",
      title: "4. Series & Parallel Circuits",
      status: "locked",
      score: 0.0,
      description: "Equivalent resistance and voltage dividers."
    },
    {
      id: "mod_5",
      title: "5. Kirchhoff's Voltage & Current Laws",
      status: "locked",
      score: 0.0,
      description: "Nodal analysis and mesh current methods."
    }
  ];

  const handleLaunchModule = async (mod: LearningPathModule) => {
    if (mod.status === 'locked') return;
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-purple-950 px-3 py-1 rounded-full text-xs font-semibold text-purple-300 border border-purple-500/30">
          <Compass className="w-4 h-4 text-purple-400" />
          <span>Curriculum Mastery Graph</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Physics & Electronics Learning Path</h1>
        <p className="text-sm text-slate-400">Structured node path generated from your learner profile and assessment scores.</p>
      </div>

      <div className="relative border-l-2 border-indigo-500/30 ml-6 space-y-8">
        {modules.map((mod) => (
          <div key={mod.id} className="relative pl-8">
            {/* Status Node Icon */}
            <div className="absolute -left-[17px] top-1.5 w-8 h-8 rounded-full bg-slate-950 border-2 flex items-center justify-center">
              {mod.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {mod.status === 'in_progress' && <Play className="w-4 h-4 text-blue-400 fill-blue-400 animate-pulse" />}
              {mod.status === 'unlocked' && <AlertCircle className="w-5 h-5 text-purple-400" />}
              {mod.status === 'locked' && <Lock className="w-4 h-4 text-slate-600" />}
            </div>

            <div
              onClick={() => handleLaunchModule(mod)}
              className={`glass-card p-6 rounded-3xl border transition-all ${
                mod.status === 'locked'
                  ? 'opacity-60 cursor-not-allowed border-slate-800'
                  : 'hover:border-indigo-500 cursor-pointer border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-lg">{mod.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  mod.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                  mod.status === 'in_progress' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                  mod.status === 'unlocked' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' :
                  'bg-slate-900 text-slate-500'
                }`}>
                  {mod.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2">{mod.description}</p>

              {mod.score > 0 && (
                <div className="mt-3 text-xs font-mono text-emerald-400 font-semibold">
                  Assessment Mastery: {mod.score}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
