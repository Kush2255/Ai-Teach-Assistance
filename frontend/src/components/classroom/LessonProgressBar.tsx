import React from 'react';

interface LessonProgressBarProps {
  progressPercentage: number;
  currentSectionIndex: number;
  totalSections: number;
  currentSegmentIndex: number;
  totalSegments: number;
}

export const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  progressPercentage,
  currentSectionIndex,
  totalSections,
  currentSegmentIndex,
  totalSegments,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progressPercentage)));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="text-indigo-600 font-bold">Overall Lesson Progress</span>
          <span className="text-slate-400">•</span>
          <span>Section {currentSectionIndex + 1} of {totalSections}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">Concept {currentSegmentIndex + 1} of {Math.max(1, totalSegments)}</span>
        </div>
        <span className="text-indigo-700 font-bold">{clampedProgress}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
        <div
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
