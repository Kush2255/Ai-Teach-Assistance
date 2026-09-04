import React, { useState } from 'react';
import { Mic, ChevronDown, ChevronUp, FileText, Sparkles } from 'lucide-react';

interface SynchronizedCaptionsProps {
  currentText: string;
  emphasis?: string[];
  transcript?: Array<{
    segment_id: string;
    title: string;
    text: string;
    type: string;
  }>;
  activeSegmentId?: string;
  onSelectSegment?: (segmentId: string) => void;
}

export const SynchronizedCaptions: React.FC<SynchronizedCaptionsProps> = ({
  currentText,
  emphasis = [],
  transcript = [],
  activeSegmentId,
  onSelectSegment,
}) => {
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  // Highlight emphasis terms in the spoken text
  const renderHighlightedText = (text: string) => {
    if (!emphasis || emphasis.length === 0) return text;

    // Build regex pattern for all emphasis terms
    const escaped = emphasis
      .filter((e) => e && e.trim().length > 0)
      .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (escaped.length === 0) return text;

    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const isMatch = emphasis.some((e) => e.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <span
            key={i}
            className="bg-indigo-900/80 text-indigo-300 font-semibold px-1 py-0.5 rounded border border-indigo-500/40"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header with Title and Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Mic className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <span>Live Teacher Narration</span>
            {emphasis.length > 0 && (
              <span className="text-[10px] text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Key Concepts Highlighted
              </span>
            )}
          </span>
        </div>

        {transcript.length > 0 && (
          <button
            onClick={() => setShowFullTranscript(!showFullTranscript)}
            className="flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showFullTranscript ? "Hide Transcript" : "Full Transcript"}</span>
            {showFullTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Main Spoken Text Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm text-slate-200 leading-relaxed max-h-28 overflow-y-auto">
        <p>{renderHighlightedText(currentText || "Teacher is preparing the next explanation...")}</p>
      </div>

      {/* Expandable Full Section Transcript Drawer */}
      {showFullTranscript && transcript.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 max-h-60 overflow-y-auto pr-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Section Lesson Script</span>
          </h4>
          <div className="space-y-2">
            {transcript.map((item, idx) => {
              const isActive = item.segment_id === activeSegmentId;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectSegment && item.segment_id && onSelectSegment(item.segment_id)}
                  className={`p-3 rounded-xl text-xs transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-indigo-950/60 border-indigo-500/60 text-white'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-indigo-300">{item.title || `Segment ${idx + 1}`}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{item.type}</span>
                  </div>
                  <p className="leading-snug">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
