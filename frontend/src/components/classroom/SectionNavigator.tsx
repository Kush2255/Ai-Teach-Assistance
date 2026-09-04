import React from 'react';
import { CheckCircle2, PlayCircle, Circle, Clock, BookOpen } from 'lucide-react';
import type { SectionSummary } from '../../services/classroomApi';

interface SectionNavigatorProps {
  sections: SectionSummary[];
  currentSectionIndex: number;
  onSelectSection: (index: number) => void;
  isLoading?: boolean;
}

export const SectionNavigator: React.FC<SectionNavigatorProps> = ({
  sections,
  currentSectionIndex,
  onSelectSection,
  isLoading = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Lesson Curriculum Flow</h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          {sections.filter((s) => s.status === 'completed').length} / {sections.length} Completed
        </span>
      </div>

      {/* Sections List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {sections.map((sec, idx) => {
          const isActive = idx === currentSectionIndex;
          const isCompleted = sec.status === 'completed';

          return (
            <button
              key={sec.id || idx}
              onClick={() => onSelectSection(idx)}
              disabled={isLoading}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-2.5 ${
                isActive
                  ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-100'
                  : isCompleted
                  ? 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isActive ? (
                  <PlayCircle className="w-4 h-4 text-indigo-600 animate-pulse" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Section {idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{sec.duration}m</span>
                  </span>
                </div>
                <h4
                  className={`text-xs font-bold truncate mt-0.5 ${
                    isActive ? 'text-indigo-950' : isCompleted ? 'text-slate-800' : 'text-slate-600'
                  }`}
                >
                  {sec.title}
                </h4>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
