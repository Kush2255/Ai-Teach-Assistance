import React from 'react';
import { Sparkles, Video, CheckCircle2, Film, Layers, Music, BookOpen } from 'lucide-react';

interface VideoGenerationLoaderProps {
  topic: string;
  progressStep: string;
  progressPercentage: number;
  teachingStyle?: string;
  language?: string;
}

const GENERATION_STAGES = [
  { label: 'Preparing personalized lesson plan', icon: BookOpen, minPct: 0 },
  { label: 'Writing conversational teaching script', icon: Sparkles, minPct: 20 },
  { label: 'Planning dynamic scene breakdown', icon: Layers, minPct: 40 },
  { label: 'Generating AI teacher video scenes', icon: Video, minPct: 60 },
  { label: 'Creating educational visuals & formulas', icon: Film, minPct: 80 },
  { label: 'Finalizing audio & interactive timeline', icon: Music, minPct: 95 },
];

export const VideoGenerationLoader: React.FC<VideoGenerationLoaderProps> = ({
  topic,
  progressStep,
  progressPercentage,
  teachingStyle = 'Visual',
  language = 'English',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-2xl mx-auto px-6 py-12">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl w-full space-y-8 relative overflow-hidden backdrop-blur-xl">
        {/* Subtle glow background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-3 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-950/80 px-4 py-1.5 rounded-full border border-indigo-500/40 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Video Production Pipeline</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Generating Teaching Video for <span className="text-indigo-400 font-black">"{topic}"</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Creating a personalized lesson with conversational narration, synchronized educational visuals, and step-by-step explanations.
          </p>
        </div>

        {/* Progress Bar & Current Status */}
        <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-indigo-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>{progressStep || 'Processing lesson...'}</span>
            </span>
            <span className="text-white font-mono">{progressPercentage}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-500 ease-out shadow-lg"
              style={{ width: `${Math.max(8, progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Multi-Stage Generation Steps */}
        <div className="grid grid-cols-1 gap-2.5 relative z-10 pt-2">
          {GENERATION_STAGES.map((stage, idx) => {
            const isCompleted = progressPercentage > stage.minPct + 15;
            const isCurrent = progressPercentage >= stage.minPct && !isCompleted;
            const Icon = stage.icon;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : isCurrent
                    ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 shadow-md scale-[1.01]'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isCurrent
                        ? 'bg-indigo-500/20 text-indigo-400 animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium">{stage.label}</span>
                </div>

                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/40 animate-pulse">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-600">Queued</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 relative z-10">
          <div className="flex items-center space-x-3">
            <span>Style: <strong className="text-slate-200 font-semibold">{teachingStyle}</strong></span>
            <span>Language: <strong className="text-slate-200 font-semibold">{language}</strong></span>
          </div>
          <span className="text-indigo-400 font-medium">Auto-advancing upon completion</span>
        </div>
      </div>
    </div>
  );
};
