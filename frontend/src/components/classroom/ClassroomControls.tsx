import React from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

interface ClassroomControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReplay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isLoading?: boolean;
  currentSegmentIndex: number;
  totalSegments: number;
}

export const ClassroomControls: React.FC<ClassroomControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReplay,
  onNext,
  onPrevious,
  hasPrevious,
  hasNext,
  isLoading = false,
  currentSegmentIndex,
  totalSegments,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center justify-between gap-3">
      {/* Left: Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious || isLoading}
        className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
          !hasPrevious || isLoading
            ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200 text-slate-400'
            : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Center: Replay & Play/Pause & Segment Info */}
      <div className="flex items-center space-x-3">
        {/* Replay Segment */}
        <button
          onClick={onReplay}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 cursor-pointer"
          title="Replay Current Segment"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={onTogglePlay}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isPlaying ? "Pause Teacher" : "Resume"}</span>
        </button>

        {/* Segment Pill */}
        <div className="hidden md:flex items-center text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
          Segment {currentSegmentIndex + 1} of {Math.max(1, totalSegments)}
        </div>
      </div>

      {/* Right: Next Segment Button */}
      <button
        onClick={onNext}
        disabled={isLoading}
        className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm transition-all cursor-pointer ${
          hasNext
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
      >
        <span>{hasNext ? "Next Concept" : "Complete Section"}</span>
        {hasNext ? <ChevronRight className="w-4 h-4" /> : <SkipForward className="w-4 h-4" />}
      </button>
    </div>
  );
};
