import React from 'react';
import { Globe2, ArrowLeft, Award, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClassroomHeaderProps {
  lessonId: string;
  topic: string;
  lessonTitle: string;
  currentSectionTitle: string;
  currentSectionIndex: number;
  totalSections: number;
  currentLanguage: string;
  isSwitchingLanguage: boolean;
  onLanguageChange: (lang: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  teachingStyle?: string;
}

export const ClassroomHeader: React.FC<ClassroomHeaderProps> = ({
  lessonId,
  topic,
  lessonTitle,
  currentSectionTitle,
  currentSectionIndex,
  totalSections,
  currentLanguage,
  isSwitchingLanguage,
  onLanguageChange,
  isMuted,
  onToggleMute,
  teachingStyle = 'Visual',
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
      {/* Left: Back button + Title & Topic */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={() => navigate('/planning')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
          title="Return to Lesson Plan"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>AI Classroom</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Section {currentSectionIndex + 1} of {totalSections}
            </span>
            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 hidden sm:inline-block">
              {teachingStyle} Mode
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-tight">
            {currentSectionTitle || lessonTitle || topic}
          </h1>
        </div>
      </div>

      {/* Right: Language switch + Audio toggle + Quiz jump */}
      <div className="flex items-center space-x-2.5">
        {/* Language selector */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-slate-500 hidden md:inline">Language:</span>
          <select
            value={currentLanguage}
            disabled={isSwitchingLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Hinglish">Hinglish (Hindi + English)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
          </select>
        </div>

        {/* Audio mute toggle */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border border-slate-200 cursor-pointer"
          title={isMuted ? "Unmute Teacher Audio" : "Mute Teacher Audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Final Quiz / Assessment */}
        <button
          onClick={() => navigate(`/assessment/${lessonId}`)}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Award className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Final Quiz</span>
        </button>
      </div>
    </div>
  );
};
