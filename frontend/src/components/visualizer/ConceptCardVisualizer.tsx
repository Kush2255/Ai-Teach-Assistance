import React from 'react';
import { Sparkles, AlertCircle, Lightbulb, Compass } from 'lucide-react';

interface ConceptCardProps {
  data: {
    title?: string;
    topic?: string;
    definition?: string;
    core_points?: string[];
    points?: string[];
    common_pitfall?: string;
    formula_hint?: string;
  };
}

export const ConceptCardVisualizer: React.FC<ConceptCardProps> = ({ data }) => {
  const points = data.core_points || data.points || [];

  return (
    <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-5 h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Concept Architecture</span>
            <h3 className="text-base font-bold text-white leading-tight">{data.title || "Core Principle"}</h3>
          </div>
        </div>
        {data.topic && (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            {data.topic}
          </span>
        )}
      </div>

      {/* Main Definition Card */}
      {data.definition && (
        <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20 rounded-xl p-4 shadow-inner">
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300 mb-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>Formal Definition & Mechanism</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {data.definition}
          </p>
        </div>
      )}

      {/* Core Principles / Pillars */}
      {points.length > 0 && (
        <div className="space-y-2 flex-1">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Key Pillars & Interactions</span>
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {points.map((pt, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 bg-slate-800/50 border border-slate-700/60 p-3 rounded-xl text-xs text-slate-200 hover:border-indigo-500/40 transition-all"
              >
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug">{pt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Pitfall / Caution */}
      {data.common_pitfall && (
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 flex items-start space-x-2.5 text-rose-200 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-400 mr-1">Common Pitfall:</span>
            <span>{data.common_pitfall}</span>
          </div>
        </div>
      )}
    </div>
  );
};
