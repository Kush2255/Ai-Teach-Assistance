import React, { useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Mic } from 'lucide-react';
import { speechService } from '../../services/speech';

interface AvatarProps {
  explanationText: string;
  language: string;
  isSpeaking: boolean;
  onSpeakingChange: (speaking: boolean) => void;
  videoUrl?: string;
}

export const TeacherAvatar: React.FC<AvatarProps> = ({
  explanationText,
  language,
  isSpeaking,
  onSpeakingChange,
  videoUrl,
}) => {
  const [showVideo, setShowVideo] = React.useState(Boolean(videoUrl));

  useEffect(() => {
    if (videoUrl) {
      setShowVideo(true);
    }
  }, [videoUrl]);

  useEffect(() => {
    if (showVideo) return; // Speech handled by video if video active
    if (isSpeaking && explanationText) {
      speechService.speak(
        explanationText,
        () => {
          onSpeakingChange(false);
        },
        language
      );
    } else {
      speechService.stopSpeaking();
    }
  }, [isSpeaking, explanationText, language, onSpeakingChange, showVideo]);

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      onSpeakingChange(false);
    } else {
      onSpeakingChange(true);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-between h-full relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tag */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center space-x-2 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-500/40 text-xs font-semibold text-blue-300">
          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>AI Educator Avatar</span>
        </div>
        <div className="flex items-center space-x-2">
          {videoUrl && (
            <button
              onClick={() => setShowVideo(!showVideo)}
              className="text-[10px] px-2 py-1 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900"
            >
              {showVideo ? "Canvas Mode" : "Video Mode"}
            </button>
          )}
          <button
            onClick={toggleSpeech}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700"
            title={isSpeaking ? "Mute Teacher" : "Unmute Teacher"}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Avatar Graphic Canvas or Video Stream */}
      {showVideo && videoUrl ? (
        <div className="relative my-4 w-full h-56 rounded-2xl overflow-hidden border border-indigo-500/40 shadow-xl bg-black">
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="relative my-4 flex flex-col items-center justify-center">
        {/* Animated halo rings */}
        <div className={`absolute w-44 h-44 rounded-full border-2 border-blue-500/30 transition-all duration-700 ${isSpeaking ? 'scale-110 opacity-100 animate-ping' : 'scale-100 opacity-40'}`} />
        
        {/* Avatar Head SVG */}
        <div className="w-36 h-36 rounded-full bg-gradient-to-b from-slate-800 to-slate-950 border-4 border-indigo-500/50 p-2 shadow-2xl flex items-center justify-center relative z-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Hair */}
            <path d="M 20,45 C 20,15 80,15 80,45 C 80,30 20,30 20,45 Z" fill="#38bdf8" />
            {/* Face */}
            <circle cx="50" cy="50" r="32" fill="#fed7aa" />
            {/* Eyes */}
            <circle cx="38" cy="45" r="4" fill="#0f172a" />
            <circle cx="62" cy="45" r="4" fill="#0f172a" />
            <circle cx="39" cy="44" r="1.5" fill="#ffffff" />
            <circle cx="63" cy="44" r="1.5" fill="#ffffff" />
            {/* Glasses frame */}
            <rect x="30" y="38" width="16" height="12" rx="3" fill="none" stroke="#6366f1" strokeWidth="2" />
            <rect x="54" y="38" width="16" height="12" rx="3" fill="none" stroke="#6366f1" strokeWidth="2" />
            <line x1="46" y1="44" x2="54" y2="44" stroke="#6366f1" strokeWidth="2" />
            {/* Mouth Lip-Sync Animation */}
            {isSpeaking ? (
              <path d="M 40,64 Q 50,75 60,64 Z" fill="#e11d48" className="animate-pulse" />
            ) : (
              <path d="M 42,66 Q 50,70 58,66" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
            )}
          </svg>
        </div>

        {/* Dynamic Lip Sync Equalizer Waves */}
        {isSpeaking && (
          <div className="flex items-center space-x-1.5 mt-4">
            <span className="w-1.5 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-6 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-8 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="w-1.5 h-5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
          </div>
        )}
      </div>
      )}

      {/* Subtitle / Explanation Script Box */}
      <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 leading-relaxed max-h-32 overflow-y-auto mt-2">
        <p className="font-semibold text-blue-400 mb-1 flex items-center space-x-1">
          <Mic className="w-3.5 h-3.5" />
          <span>Spoken Lesson Explanation:</span>
        </p>
        <p>{explanationText || "Preparing lesson explanation script..."}</p>
      </div>
    </div>
  );
};
