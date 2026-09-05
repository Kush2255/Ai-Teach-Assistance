/**
 * VideoPlayerModal — Premium modal component for playing/downloading generated lesson videos.
 *
 * Features:
 * - Full-screen overlay with blurred backdrop
 * - HTML5 <video> player with custom controls
 * - Live generation progress bar (while generating)
 * - Download button
 * - Scene count and duration display
 * - Animated entry/exit
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  X, Download, Play, Pause, Volume2, VolumeX,
  Maximize2, Loader2, CheckCircle2, AlertCircle,
  Film, Sparkles, Clock, Layers
} from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Generation state (while generating)
  isGenerating: boolean;
  progress: number;
  progressStep: string;
  sceneCount?: number | null;

  // Completed state
  isComplete: boolean;
  videoUrl: string | null;
  downloadUrl: string | null;
  durationSeconds?: number | null;
  hasAudio?: boolean;
  error?: string | null;

  // Context
  topic: string;
  language?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  isGenerating,
  progress,
  progressStep,
  sceneCount,
  isComplete,
  videoUrl,
  downloadUrl,
  durationSeconds,
  hasAudio,
  error,
  topic,
  language = 'English',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Auto-play when video is ready
  useEffect(() => {
    if (isComplete && videoUrl && videoRef.current) {
      videoRef.current.load();
    }
  }, [isComplete, videoUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setIsPlaying(true); }
    else { v.pause(); setIsPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const handleFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (!document.fullscreenElement) {
      v.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `lesson_${topic.slice(0, 30).replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-indigo-500/30"
        style={{
          background: 'linear-gradient(135deg, #0a0f23 0%, #0f0a28 100%)',
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease',
        }}
      >
        {/* === HEADER === */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-900/60 border border-indigo-500/40">
              <Film className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                AI Lesson Video
              </h2>
              <p className="text-xs text-slate-400">{topic.slice(0, 50)} · {language}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Scene count badge */}
            {sceneCount && (
              <span className="flex items-center space-x-1 text-[11px] bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700">
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>{sceneCount} scenes</span>
              </span>
            )}
            {/* Duration badge */}
            {durationSeconds && (
              <span className="flex items-center space-x-1 text-[11px] bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 border border-slate-700">
                <Clock className="w-3 h-3 text-emerald-400" />
                <span>{formatTime(durationSeconds)}</span>
              </span>
            )}
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* === BODY === */}
        <div className="p-5 space-y-4">

          {/* ── GENERATING STATE ── */}
          {isGenerating && !isComplete && (
            <div className="space-y-5">
              {/* Animated pulsing preview */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-indigo-500/20 bg-slate-950 flex items-center justify-center">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }}
                />
                <div className="text-center z-10 space-y-4">
                  <div className="relative mx-auto w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-indigo-400/50 animate-ping" style={{ animationDelay: '0.3s' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">{progressStep}</p>
                    <p className="text-slate-400 text-xs mt-1">Generating your personalized lesson video...</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center space-x-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                    <span>{progressStep}</span>
                  </span>
                  <span className="font-bold text-indigo-300">{progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #6366f1, #a855f7, #22d3ee)',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Rendering slides</span>
                  <span>Generating audio</span>
                  <span>Assembling MP4</span>
                </div>
              </div>

              <p className="text-center text-xs text-slate-500">
                This may take 30–120 seconds depending on lesson length. You can continue using the classroom while it generates.
              </p>
            </div>
          )}

          {/* ── ERROR STATE ── */}
          {error && !isComplete && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-white font-bold">Video Generation Failed</p>
              <p className="text-rose-400 text-sm text-center max-w-md">{error}</p>
              <p className="text-slate-500 text-xs">
                The interactive classroom mode is still available. Install MoviePy and Pillow to enable MP4 generation.
              </p>
            </div>
          )}

          {/* ── VIDEO PLAYER STATE ── */}
          {isComplete && videoUrl && (
            <div className="space-y-3">
              {/* Success badge */}
              <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Video generated successfully{hasAudio ? ' with voiceover audio' : ' (silent — install gTTS for audio)'}!</span>
              </div>

              {/* Video element */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-slate-700">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-cover"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Custom overlay controls */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/30">
                  <button
                    onClick={togglePlay}
                    className="p-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all cursor-pointer"
                  >
                    {isPlaying
                      ? <Pause className="w-8 h-8 text-white" />
                      : <Play className="w-8 h-8 text-white" />
                    }
                  </button>
                </div>
              </div>

              {/* Custom video controls bar */}
              <div className="flex items-center space-x-3 bg-slate-900 rounded-xl px-4 py-2.5 border border-slate-800">
                <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors cursor-pointer">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                {/* Seek bar */}
                <div className="flex-1 flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400 w-10 text-right">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      if (videoRef.current) videoRef.current.currentTime = t;
                      setCurrentTime(t);
                    }}
                    className="flex-1 h-1.5 accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-400 w-10">{formatTime(duration)}</span>
                </div>

                <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button onClick={handleFullscreen} className="text-slate-400 hover:text-white transition-colors cursor-pointer" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                  <Maximize2 className={`w-4 h-4 ${isFullscreen ? 'text-indigo-400' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* ── DOWNLOAD BUTTON ── */}
          {isComplete && downloadUrl && (
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              <Download className="w-4 h-4 text-white" />
              <span className="text-white">Download MP4 Lesson Video</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
