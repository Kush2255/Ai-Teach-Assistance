import React, { useEffect, useRef, useState, useMemo } from 'react';
import { RefreshCw, Radio, Volume2, Sparkles, Video, UserCheck } from 'lucide-react';
import { speechService } from '../../services/speech';

interface AITeacherStageProps {
  narrationText: string;
  language: string;
  isSpeaking: boolean;
  onSpeakingChange: (speaking: boolean) => void;
  videoUrl?: string;
  status: 'loading' | 'preparing' | 'speaking' | 'paused' | 'completed' | 'error' | 'ready';
  teacherInfo?: {
    name?: string;
    role?: string;
    avatar_type?: string;
    provider?: string;
  };
  isMuted?: boolean;
  topic?: string;
  segmentTitle?: string;
  visualData?: any;
}

const TEACHER_PROFILES = [
  {
    id: 'dr_sarah_hologram',
    name: 'Dr. Sarah Adams',
    role: 'Holographic AI Master Instructor',
    videoUrl: '/assets/real_ai_teacher.mp4',
    avatarImg: '/assets/ai_teacher_avatar.jpg',
  },
  {
    id: 'prof_elena',
    name: 'Prof. Elena Rostova',
    role: 'Interactive Lecture Master',
    videoUrl: '/assets/teacher_lecture.mp4',
    avatarImg: '/assets/ai_teacher_avatar.jpg',
  },
  {
    id: 'prof_alex',
    name: 'Prof. Alex Mercer',
    role: 'Visual & Conceptual Tutor',
    videoUrl: '/assets/teacher_presentation.mp4',
    avatarImg: '/assets/ai_teacher_avatar.jpg',
  },
  {
    id: 'dr_sarah_classic',
    name: 'Dr. Sarah (Studio Classic)',
    role: 'AI Pedagogy Specialist',
    videoUrl: '/assets/teacher_video.mp4',
    avatarImg: '/assets/ai_teacher_avatar.jpg',
  },
];

// Waveform bar count
const WAVE_BARS = 32;

export const AITeacherStage: React.FC<AITeacherStageProps> = ({
  narrationText,
  language,
  isSpeaking,
  onSpeakingChange,
  videoUrl: customVideoUrl,
  status,
  teacherInfo,
  isMuted = false,
  topic = '',
  segmentTitle = '',
  visualData = {},
}) => {
  // Default to Real Video Mode for realistic moving human teacher experience
  const [displayMode, setDisplayMode] = useState<'video' | 'canvas'>('video');
  const [selectedTeacherIndex, setSelectedTeacherIndex] = useState(0);
  const activeTeacher = TEACHER_PROFILES[selectedTeacherIndex] || TEACHER_PROFILES[0];

  const topicLower = `${topic} ${segmentTitle} ${visualData?.title || ''} ${narrationText}`.toLowerCase();

  const resolvedTopicVideoUrl = useMemo(() => {
    if (customVideoUrl && customVideoUrl.startsWith('/assets/')) return customVideoUrl;
    if (topicLower.includes('electric') || topicLower.includes('voltage') || topicLower.includes('current') || topicLower.includes('circuit') || topicLower.includes('ohm') || topicLower.includes('physics')) {
      return '/assets/physics_electricity.mp4';
    } else if (topicLower.includes('dna') || topicLower.includes('gene') || topicLower.includes('bio') || topicLower.includes('cell')) {
      return '/assets/real_ai_teacher.mp4';
    } else if (topicLower.includes('code') || topicLower.includes('algo') || topicLower.includes('python') || topicLower.includes('binary') || topicLower.includes('cs')) {
      return '/assets/teacher_presentation.mp4';
    } else if (topicLower.includes('math') || topicLower.includes('calculus') || topicLower.includes('equation') || topicLower.includes('integral')) {
      return '/assets/teacher_lecture.mp4';
    } else if (topicLower.includes('chem') || topicLower.includes('atom') || topicLower.includes('reaction') || topicLower.includes('molecule')) {
      return '/assets/stem_laboratory.mp4';
    }
    return customVideoUrl || activeTeacher.videoUrl || '/assets/teacher_video.mp4';
  }, [customVideoUrl, topicLower, activeTeacher.videoUrl]);

  const activeVideoUrl = resolvedTopicVideoUrl;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [blinkState, setBlink] = useState(false);
  const [breathePhase, setBreathePhase] = useState(0);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mouthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breatheTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const words = useMemo(() => narrationText?.split(/\s+/).filter(Boolean) || [], [narrationText]);

  // Video playback synchronization with speaking state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true; // Always muted so browser TTS handles voice clearly

    if (isSpeaking) {
      video.play().catch(() => {
        // Autoplay policy fallback
      });
    } else {
      video.pause();
    }
  }, [isSpeaking, displayMode, activeVideoUrl]);

  // ---- Lip-sync mouth animation for canvas mode ----
  useEffect(() => {
    if (isSpeaking && !isMuted) {
      const animateMouth = () => {
        const base = Math.random();
        const openness = base > 0.7 ? 0.9 + Math.random() * 0.1 : base > 0.3 ? 0.4 + Math.random() * 0.35 : 0.05 + Math.random() * 0.15;
        setMouthOpenness(openness);
        mouthTimerRef.current = setTimeout(animateMouth, 60 + Math.random() * 100);
      };
      animateMouth();
    } else {
      setMouthOpenness(0);
    }
    return () => { if (mouthTimerRef.current) clearTimeout(mouthTimerRef.current); };
  }, [isSpeaking, isMuted]);

  // ---- Blink animation ----
  useEffect(() => {
    const doBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
      blinkTimerRef.current = setTimeout(doBlink, 2800 + Math.random() * 4000);
    };
    blinkTimerRef.current = setTimeout(doBlink, 2000);
    return () => { if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current); };
  }, []);

  // ---- Breathing animation ----
  useEffect(() => {
    let phase = 0;
    const animate = () => {
      phase = (phase + 0.015) % (Math.PI * 2);
      setBreathePhase(Math.sin(phase) * 0.5 + 0.5);
      breatheTimerRef.current = setTimeout(animate, 50);
    };
    animate();
    return () => { if (breatheTimerRef.current) clearTimeout(breatheTimerRef.current); };
  }, []);

  // ---- Word highlight ticker ----
  useEffect(() => {
    if (isSpeaking && words.length > 0 && !isMuted) {
      setCurrentWordIndex(0);
      const wpm = 135; // Words per minute for natural educational pacing
      const msPerWord = (60 / wpm) * 1000;
      let idx = 0;
      wordTimerRef.current = setInterval(() => {
        idx++;
        if (idx >= words.length) {
          setCurrentWordIndex(words.length - 1);
          if (wordTimerRef.current) clearInterval(wordTimerRef.current);
          setTimeout(() => onSpeakingChange(false), 600);
          return;
        }
        setCurrentWordIndex(idx);
      }, msPerWord);
    } else {
      setCurrentWordIndex(0);
    }
    return () => { if (wordTimerRef.current) clearInterval(wordTimerRef.current); };
  }, [isSpeaking, narrationText, isMuted]);

  // ---- Audio waveform canvas visualizer ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const barWidth = W / WAVE_BARS;
      for (let i = 0; i < WAVE_BARS; i++) {
        const t = Date.now() / 1000;
        let height: number;
        if (isSpeaking && !isMuted) {
          height = (Math.sin(t * 3.5 + i * 0.6) * 0.35 + Math.sin(t * 6 + i * 1.1) * 0.25 + Math.sin(t * 8.5 + i * 0.4) * 0.15 + 0.45) * H * 0.85;
          height = Math.max(4, height);
        } else {
          height = 3 + Math.sin(t * 0.8 + i * 0.5) * 2;
        }
        const x = i * barWidth + barWidth * 0.15;
        const bw = barWidth * 0.7;

        const hue = 220 + (i / WAVE_BARS) * 60; // cyan-blue to purple
        const alpha = isSpeaking ? 0.9 : 0.25;
        ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, H / 2 - height / 2, bw, height, bw / 2);
        ctx.fill();
      }
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isSpeaking, isMuted]);

  // ---- Browser speech synthesis ----
  useEffect(() => {
    if (isMuted) {
      speechService.stopSpeaking();
      return;
    }

    if (isSpeaking && narrationText) {
      speechService.speak(
        narrationText,
        () => onSpeakingChange(false),
        language
      );
    } else {
      speechService.stopSpeaking();
    }
  }, [isSpeaking, narrationText, language, onSpeakingChange, isMuted]);

  const teacherName = teacherInfo?.name || activeTeacher.name;
  const teacherRole = teacherInfo?.role || activeTeacher.role;

  // Caption words sliding window
  const captionStart = Math.max(0, currentWordIndex - 5);
  const captionEnd = Math.min(words.length, currentWordIndex + 9);
  const captionWords = words.slice(captionStart, captionEnd);

  return (
    <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col justify-between h-full relative overflow-hidden backdrop-blur-md">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl transition-all duration-[3000ms]"
          style={{
            background: `radial-gradient(circle, rgba(99,102,241,${0.15 + breathePhase * 0.08}) 0%, transparent 70%)`,
            transform: `scale(${1 + breathePhase * 0.15})`,
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full blur-3xl transition-all duration-[3000ms]"
          style={{
            background: `radial-gradient(circle, rgba(147,51,234,${0.12 + breathePhase * 0.06}) 0%, transparent 70%)`,
            transform: `scale(${1 + (1 - breathePhase) * 0.12})`,
          }}
        />
      </div>

      {/* Top Bar: Teacher Badge, Live Status & Mode Switcher */}
      <div className="w-full flex items-center justify-between px-4 pt-3.5 pb-2 z-10 gap-2 flex-wrap">
        <div className="flex items-center space-x-2 bg-indigo-950/90 px-3 py-1.5 rounded-full border border-indigo-500/40 text-xs font-semibold text-indigo-200">
          <div className="relative">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            {isSpeaking && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <span>{teacherName}</span>
          <span className="text-[10px] text-slate-400 border-l border-indigo-500/30 pl-1.5 hidden md:inline">
            {teacherRole}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Switcher Button */}
          <button
            onClick={() => setDisplayMode(displayMode === 'video' ? 'canvas' : 'video')}
            className="flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-900/70 hover:bg-indigo-800 border border-indigo-500/40 text-indigo-200 transition-all cursor-pointer shadow-sm"
            title="Toggle between Real Video and 3D Neural Avatar"
          >
            {displayMode === 'video' ? (
              <>
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>3D Canvas</span>
              </>
            ) : (
              <>
                <Video className="w-3 h-3 text-emerald-400" />
                <span>Real Video</span>
              </>
            )}
          </button>

          {/* Instructor selector (if multiple available) */}
          <button
            onClick={() => setSelectedTeacherIndex((prev) => (prev + 1) % TEACHER_PROFILES.length)}
            className="text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer flex items-center space-x-1"
            title="Switch Instructor Persona"
          >
            <UserCheck className="w-3 h-3 text-cyan-400" />
            <span>Switch</span>
          </button>

          {/* LIVE Indicator */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-bold">
            <span
              className={`w-2 h-2 rounded-full ${
                isSpeaking
                  ? 'bg-red-500 animate-ping'
                  : status === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span className={isSpeaking ? 'text-red-400' : 'text-slate-300'}>
              {isSpeaking ? '🔴 LIVE' : status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Center: Real Video vs Canvas Teacher Display */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-2 min-h-[260px]">
        {status === 'loading' || status === 'preparing' ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-10 text-indigo-300">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
            <p className="text-xs font-medium tracking-wide">Connecting to AI Teaching Stream...</p>
          </div>
        ) : displayMode === 'video' ? (
          /* REAL VIDEO TEACHER BROADCAST STAGE */
          <div className="relative w-full h-[260px] sm:h-[290px] rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-2xl bg-black group">
            <video
              ref={videoRef}
              src={activeVideoUrl}
              playsInline
              loop
              autoPlay
              muted
              className="w-full h-full object-cover"
              onEnded={() => onSpeakingChange(false)}
            />

            {/* Futuristic Holographic Sci-Fi HUD Overlays */}
            <div className="absolute inset-0 pointer-events-none border border-cyan-500/30 rounded-2xl">
              {/* Sci-Fi Corner Brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
            </div>

            {/* In-Scene Dynamic Holographic HUD (Directly matches user's screenshot layout) */}
            <div className="absolute top-11 left-3.5 w-36 sm:w-48 bg-slate-950/75 backdrop-blur-md rounded-xl border border-cyan-400/50 p-2 shadow-2xl z-20 pointer-events-none hidden xs:flex flex-col justify-between">
              {/* Sci-Fi Corner Markings */}
              <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-cyan-400" />
              <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-cyan-400" />
              <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-cyan-400" />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-cyan-400" />

              <div className="flex items-center justify-between text-[9px] font-mono text-cyan-300 pb-1 border-b border-cyan-500/30">
                <span className="font-bold tracking-wider">⌜ AI TEACHER ⌝</span>
                <span className="text-[8px] bg-cyan-950/90 px-1 rounded text-cyan-400 border border-cyan-500/40">
                  {topic ? topic.slice(0, 10).toUpperCase() : 'TELEMETRY'}
                </span>
              </div>

              {/* Dynamic Mini Hologram Graphic per Topic */}
              <div className="my-1 flex items-center justify-center h-14 relative overflow-hidden">
                {topicLower.includes('dna') || topicLower.includes('bio') || topicLower.includes('gene') ? (
                  <div className="w-full flex items-center justify-center space-x-1 animate-pulse">
                    <span className="text-xl">🧬</span>
                    <div className="text-[8px] font-mono text-cyan-300">
                      <p className="font-bold">DNA DOUBLE HELIX</p>
                      <p className="text-cyan-400/70">A-T · G-C Base Pairs</p>
                    </div>
                  </div>
                ) : topicLower.includes('evolution') || topicLower.includes('history') ? (
                  <div className="w-full flex items-center justify-around text-base">
                    <span>🚶</span>
                    <span>🪨</span>
                    <span>🔥</span>
                    <span>🧠</span>
                  </div>
                ) : topicLower.includes('code') || topicLower.includes('algorithm') || topicLower.includes('cs') ? (
                  <div className="w-full font-mono text-[8px] text-cyan-300 leading-tight">
                    <p className="text-emerald-400">&gt; def execute_algo():</p>
                    <p className="text-cyan-400">&gt;   return optimal_step()</p>
                    <p className="text-amber-400">&gt; [OK] MEM: 0x4F12</p>
                  </div>
                ) : topicLower.includes('physic') || topicLower.includes('orbit') || topicLower.includes('planet') ? (
                  <div className="w-full flex items-center justify-center space-x-1.5">
                    <span className="text-lg animate-spin" style={{ animationDuration: '8s' }}>⚛️</span>
                    <span className="text-[8px] font-mono text-cyan-300">ORBITAL FIELD</span>
                  </div>
                ) : topicLower.includes('math') || topicLower.includes('calculus') ? (
                  <div className="w-full flex items-center justify-center space-x-1">
                    <span className="text-base">∫</span>
                    <span className="text-[8px] font-mono text-cyan-300">f(x)dx · TANGENT</span>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-center space-x-1 animate-pulse">
                    <span className="text-base">✨</span>
                    <span className="text-[8px] font-mono text-cyan-300">{segmentTitle || 'DYNAMIC ADAPTATION'}</span>
                  </div>
                )}
              </div>

              <div className="pt-0.5 border-t border-cyan-500/20 flex items-center justify-between text-[7px] font-mono text-cyan-400/80">
                <span>TOPIC ADAPTIVE</span>
                <span className="text-emerald-400">SYNC 100%</span>
              </div>
            </div>

            {/* Audio Waveform Overlay at bottom of video */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-3 pt-6 flex flex-col items-center">
              <div className="w-full max-w-[280px]">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={28}
                  className="w-full"
                  style={{ opacity: isSpeaking ? 1 : 0.4 }}
                />
              </div>

              {/* Word-by-word highlighted captions overlay */}
              {isSpeaking && words.length > 0 && (
                <div className="mt-1.5 w-full max-w-[95%] bg-slate-950/80 backdrop-blur-md rounded-lg px-3 py-1.5 border border-indigo-500/30 text-center">
                  <p className="text-[11px] sm:text-xs leading-relaxed text-white">
                    {captionWords.map((word, i) => {
                      const globalIdx = captionStart + i;
                      const isCurrent = globalIdx === currentWordIndex;
                      const isPast = globalIdx < currentWordIndex;
                      return (
                        <span
                          key={`${globalIdx}-${word}`}
                          className="transition-all duration-150 inline-block mx-[2px]"
                          style={{
                            color: isCurrent
                              ? '#38bdf8'
                              : isPast
                              ? '#94a3b8'
                              : 'rgba(148,163,184,0.45)',
                            fontWeight: isCurrent ? 800 : 400,
                            transform: isCurrent ? 'scale(1.12)' : 'scale(1)',
                            textShadow: isCurrent ? '0 0 10px rgba(56,189,248,0.7)' : 'none',
                          }}
                        >
                          {word}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 3D NEURAL CANVAS TEACHER STAGE */
          <div className="relative flex flex-col items-center justify-center w-full">
            {/* Outer resonance rings */}
            <div
              className="absolute rounded-full border transition-all duration-700"
              style={{
                width: isSpeaking ? '210px' : '180px',
                height: isSpeaking ? '210px' : '180px',
                borderColor: `rgba(99,102,241,${isSpeaking ? 0.3 + mouthOpenness * 0.15 : 0.08})`,
                transform: `scale(${isSpeaking ? 1 + mouthOpenness * 0.06 : 0.95})`,
                opacity: isSpeaking ? 0.8 : 0.2,
              }}
            />

            {/* Avatar Container */}
            <div
              className="relative z-10 rounded-full overflow-hidden shadow-2xl transition-transform duration-700"
              style={{
                width: '160px',
                height: '160px',
                transform: `scale(${1 + breathePhase * 0.015}) translateY(${Math.sin(breathePhase * Math.PI) * 1.5}px)`,
                border: `3px solid rgba(99,102,241,${isSpeaking ? 0.8 : 0.4})`,
                boxShadow: isSpeaking
                  ? `0 0 35px rgba(99,102,241,0.35), 0 0 70px rgba(147,51,234,0.2)`
                  : `0 0 15px rgba(99,102,241,0.15)`,
              }}
            >
              <img
                src={activeTeacher.avatarImg}
                alt={activeTeacher.name}
                className="w-full h-full object-cover"
                style={{
                  filter: isSpeaking ? 'brightness(1.05) contrast(1.02)' : 'brightness(0.95)',
                  transition: 'filter 0.5s ease',
                }}
              />

              {/* Animated mouth & blink effects */}
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none transition-all"
                style={{
                  height: `${28 + mouthOpenness * 12}%`,
                  background: `linear-gradient(to top, rgba(15,23,42,${isSpeaking ? 0.15 + mouthOpenness * 0.1 : 0.05}) 0%, transparent 100%)`,
                }}
              />
              {blinkState && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    top: '28%',
                    left: '15%',
                    right: '15%',
                    height: '12%',
                    background: 'linear-gradient(to bottom, rgba(190,170,150,0.5) 0%, transparent 100%)',
                    borderRadius: '50%',
                  }}
                />
              )}
            </div>

            {/* Audio Waveform Visualizer */}
            <div className="mt-3 w-full max-w-[240px]">
              <canvas
                ref={canvasRef}
                width={240}
                height={35}
                className="w-full"
                style={{ opacity: isSpeaking ? 1 : 0.3 }}
              />
            </div>

            {/* Live Captions */}
            {isSpeaking && words.length > 0 && (
              <div className="mt-2 w-full max-w-[320px] min-h-[40px] bg-slate-950/70 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-slate-700/40">
                <p className="text-[11px] leading-relaxed text-center">
                  {captionWords.map((word, i) => {
                    const globalIdx = captionStart + i;
                    const isCurrent = globalIdx === currentWordIndex;
                    const isPast = globalIdx < currentWordIndex;
                    return (
                      <span
                        key={`${globalIdx}-${word}`}
                        className="transition-all duration-200 inline-block mx-[1px]"
                        style={{
                          color: isCurrent ? '#a5b4fc' : isPast ? '#94a3b8' : 'rgba(148,163,184,0.4)',
                          fontWeight: isCurrent ? 700 : 400,
                        }}
                      >
                        {word}{' '}
                      </span>
                    );
                  })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Persona Banner */}
      <div className="w-full bg-slate-950/80 border-t border-slate-800 rounded-b-2xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-300 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-indigo-500/40">
              <img
                src={activeTeacher.avatarImg}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
            )}
          </div>
          <div>
            <span className="font-semibold text-white block leading-none text-[12px]">{teacherName}</span>
            <span className="text-[10px] text-slate-400">Live AI Teaching Stream</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSpeaking && (
            <span className="flex items-center space-x-1 text-[10px] bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-300 border border-emerald-700/40">
              <Volume2 className="w-3 h-3" />
              <span>Explaining</span>
            </span>
          )}
          <span className="text-[10px] bg-indigo-950 px-2 py-0.5 rounded text-indigo-300 border border-indigo-800/60 font-semibold">
            {displayMode === 'video' ? '🎥 Real Video Engine' : '✨ 3D Neural Engine'}
          </span>
        </div>
      </div>
    </div>
  );
};
