import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  RefreshCw,
  Send,
  Mic,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

import {
  startClassroomSession,
  advanceClassroomSegment,
  previousClassroomSegment,
  jumpToClassroomSection,
  switchClassroomLanguage,
  type ClassroomSessionState,
  type TeachingSegment,
} from '../services/classroomApi';
import { submitAnswer } from '../services/api';
import { speechService } from '../services/speech';
import type { AnswerEvaluation } from '../types';
import {
  requestTeachingVideo,
  pollTeachingVideoStatus,
  type VideoStatusData,
} from '../services/videoApi';

import { ClassroomHeader } from '../components/classroom/ClassroomHeader';
import { AITeacherStage } from '../components/classroom/AITeacherStage';
import { DynamicVisualStage } from '../components/classroom/DynamicVisualStage';
import { SynchronizedCaptions } from '../components/classroom/SynchronizedCaptions';
import { ClassroomControls } from '../components/classroom/ClassroomControls';
import { SectionNavigator } from '../components/classroom/SectionNavigator';
import { LessonProgressBar } from '../components/classroom/LessonProgressBar';
import { VideoGenerationLoader } from '../components/classroom/VideoGenerationLoader';
import { TeachingVideoPlayer } from '../components/classroom/TeachingVideoPlayer';
import { VideoPlayerModal } from '../components/classroom/VideoPlayerModal';
import { useVideoGeneration } from '../services/useVideoGeneration';

export const TeachingClassroomPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  // Video Generation Hook (MP4 Pipeline)
  const videoGen = useVideoGeneration();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Classroom Session State
  const [session, setSession] = useState<ClassroomSessionState | null>(null);
  const [currentSegment, setCurrentSegment] = useState<TeachingSegment | null>(null);
  const [visualData, setVisualData] = useState<any>(null);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(undefined);

  // Workflow 4 Video Generation Pipeline State
  const [videoData, setVideoData] = useState<VideoStatusData | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgressStep, setVideoProgressStep] = useState('Preparing lesson...');
  const [videoProgressPct, setVideoProgressPct] = useState(15);
  const [viewMode, setViewMode] = useState<'video_player' | 'interactive_stage'>('video_player');

  // Playback & Audio Controls
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [isSwitchingLang, setIsSwitchingLang] = useState(false);
  const [isLoadingSegment, setIsLoadingSegment] = useState(false);
  const [classroomError, setClassroomError] = useState<string | null>(null);

  // Question & Misconception Check (Workflow 4 -> Workflow 5 handoff hook)
  const [studentAnswer, setStudentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [evalResult, setEvalResult] = useState<AnswerEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize Classroom Session & Trigger Workflow 4 Video Generation
  useEffect(() => {
    async function initClassroom() {
      if (!lessonId) return;
      try {
        const data = await startClassroomSession(lessonId);
        setSession(data);
        setCurrentLanguage(data.language || 'English');
        if (data.current_segment) {
          setCurrentSegment(data.current_segment);
        }
        if (data.visual) {
          setVisualData(data.visual);
        }
        setIsSpeaking(true);

        // Initiate Workflow 4 Video Generation
        setIsGeneratingVideo(true);
        setVideoProgressStep('Planning dynamic scene breakdown...');
        setVideoProgressPct(25);

        try {
          const genRes = await requestTeachingVideo({
            lesson_id: lessonId,
            topic: data.topic,
            language: data.language || 'English',
            teaching_style: data.teaching_style || 'Visual',
          });

          // Poll for completion
          const pollInterval = setInterval(async () => {
            try {
              const statusData = await pollTeachingVideoStatus(genRes.video_id);
              setVideoProgressStep(statusData.progress_step || 'Generating AI Video...');
              setVideoProgressPct(statusData.progress_percentage || 50);

              if (statusData.status === 'completed') {
                clearInterval(pollInterval);
                setVideoData(statusData);
                setIsGeneratingVideo(false);
              } else if (statusData.status === 'failed') {
                clearInterval(pollInterval);
                setIsGeneratingVideo(false);
              }
            } catch (pollErr) {
              clearInterval(pollInterval);
              setIsGeneratingVideo(false);
            }
          }, 800);
        } catch (videoGenErr) {
          console.warn('Video generation init fallback:', videoGenErr);
          setIsGeneratingVideo(false);
        }
      } catch (err: any) {
        console.error('Failed to init classroom:', err);
        setClassroomError(
          err.message || 'Could not initialize the AI Classroom. Please check that the backend is running.'
        );
      }
    }
    initClassroom();
  }, [lessonId]);

  // Handle Next Segment / Section
  const handleNext = async () => {
    if (!session || isLoadingSegment) return;
    setIsLoadingSegment(true);
    try {
      const res = await advanceClassroomSegment(session.session_id);
      setCurrentSegment(res.segment);
      setVisualData(res.visual);
      setVideoUrl(res.video_stream?.video_url);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              current_section_index: res.section_index,
              current_segment_index: res.segment_index,
              current_segment: res.segment,
              visual: res.visual,
            }
          : prev
      );
      setIsSpeaking(true);
      setEvalResult(null);
    } catch (err) {
      console.error('Failed to advance segment:', err);
    } finally {
      setIsLoadingSegment(false);
    }
  };

  // Handle Previous Segment
  const handlePrevious = async () => {
    if (!session || isLoadingSegment) return;
    setIsLoadingSegment(true);
    try {
      const res = await previousClassroomSegment(session.session_id);
      setCurrentSegment(res.segment);
      setVisualData(res.visual);
      setVideoUrl(res.video_stream?.video_url);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              current_section_index: res.section_index,
              current_segment_index: res.segment_index,
              current_segment: res.segment,
              visual: res.visual,
            }
          : prev
      );
      setIsSpeaking(true);
      setEvalResult(null);
    } catch (err) {
      console.error('Failed to go back segment:', err);
    } finally {
      setIsLoadingSegment(false);
    }
  };

  // Handle Jump to Section
  const handleJumpToSection = async (sectionIdx: number) => {
    if (!session || isLoadingSegment) return;
    setIsLoadingSegment(true);
    try {
      const res = await jumpToClassroomSection(session.session_id, sectionIdx);
      setCurrentSegment(res.segment);
      setVisualData(res.visual);
      setVideoUrl(res.video_stream?.video_url);
      setSession((prev) =>
        prev
          ? {
              ...prev,
              current_section_index: res.section_index,
              current_segment_index: res.segment_index,
              current_segment: res.segment,
              visual: res.visual,
            }
          : prev
      );
      setIsSpeaking(true);
      setEvalResult(null);
    } catch (err) {
      console.error('Failed to jump to section:', err);
    } finally {
      setIsLoadingSegment(false);
    }
  };

  // Handle Replay Current Segment
  const handleReplay = () => {
    setIsSpeaking(false);
    setTimeout(() => {
      setIsSpeaking(true);
    }, 100);
  };

  // Handle Language Switch
  const handleLanguageChange = async (newLang: string) => {
    if (!session) return;
    setCurrentLanguage(newLang);
    setIsSwitchingLang(true);
    setEvalResult(null);
    try {
      const updatedState = await switchClassroomLanguage(session.session_id, newLang);
      setSession(updatedState);
      if (updatedState.current_segment) {
        setCurrentSegment(updatedState.current_segment);
      }
      if (updatedState.visual) {
        setVisualData(updatedState.visual);
      }
      setIsSpeaking(true);
    } catch (err) {
      console.error('Failed to switch language:', err);
    } finally {
      setIsSwitchingLang(false);
    }
  };

  // Handle Voice Input
  const handleMicListen = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.listen(
        (text) => {
          setStudentAnswer(text);
          setIsListening(false);
        },
        () => setIsListening(false),
        currentLanguage
      );
    }
  };

  // Handle Knowledge Check Answer Submission
  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || !lessonId || !session) return;
    setIsSubmitting(true);
    try {
      const sec = session.current_section || {};
      const res = await submitAnswer(lessonId, sec.id || `sec_${session.current_section_index}`, studentAnswer);
      setEvalResult(res);
      setIsSpeaking(true);
      speechService.speak(res.feedback, () => setIsSpeaking(false), currentLanguage);
    } catch (err) {
      console.error('Answer evaluation failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Error view
  if (classroomError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 px-6">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 max-w-lg w-full text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-rose-800">Classroom Setup Error</h2>
          <p className="text-sm text-rose-700">{classroomError}</p>
          <button
            onClick={() => navigate('/planning')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            ← Return to Lesson Planner
          </button>
        </div>
      </div>
    );
  }

  // Loading view
  if (!session || !currentSegment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-600 space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="font-medium text-sm">
          Initializing AI Virtual Classroom & Dynamic Visual Stage...
        </span>
      </div>
    );
  }

  const currentSec = session.current_section || {};
  const hasPrevious = session.current_section_index > 0 || session.current_segment_index > 0;
  const hasNext =
    session.current_section_index < session.total_sections - 1 ||
    session.current_segment_index < session.total_segments_in_section - 1;

  // Video Generation Progress View
  if (isGeneratingVideo && !videoData) {
    return (
      <VideoGenerationLoader
        topic={session.topic}
        progressStep={videoProgressStep}
        progressPercentage={videoProgressPct}
        teachingStyle={session.teaching_style}
        language={currentLanguage}
      />
    );
  }

  const handleOpenVideoModal = () => {
    setIsVideoModalOpen(true);
    if (!videoGen.isGenerating && !videoGen.isComplete && session) {
      videoGen.generateVideo({
        lessonId: lessonId || 'lesson_1',
        topic: session.topic,
        language: currentLanguage,
        teachingStyle: session.teaching_style,
        sections: session.sections_summary,
      });
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Classroom Control Header */}
      <ClassroomHeader
        lessonId={lessonId || ''}
        topic={session.topic}
        lessonTitle={session.title}
        currentSectionTitle={currentSec.title || session.title}
        currentSectionIndex={session.current_section_index}
        totalSections={session.total_sections}
        currentLanguage={currentLanguage}
        isSwitchingLanguage={isSwitchingLang}
        onLanguageChange={handleLanguageChange}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        teachingStyle={session.teaching_style}
        onOpenVideoModal={handleOpenVideoModal}
        isGeneratingVideo={videoGen.isGenerating}
      />

      {/* Mode Switcher & Lesson Progress Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('video_player')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'video_player'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🎬 AI Generated Teaching Video</span>
          </button>
          <button
            onClick={() => setViewMode('interactive_stage')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer ${
              viewMode === 'interactive_stage'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>🔬 Interactive Micro-Stage</span>
          </button>
          <button
            onClick={handleOpenVideoModal}
            className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md"
          >
            <span>🎥 {videoGen.isComplete ? 'Watch / Download MP4' : 'Render Full MP4'}</span>
          </button>
        </div>

        <div className="flex-1 max-w-xs">
          <LessonProgressBar
            progressPercentage={session.progress_percentage}
            currentSectionIndex={session.current_section_index}
            totalSections={session.total_sections}
            currentSegmentIndex={session.current_segment_index}
            totalSegments={session.total_segments_in_section}
          />
        </div>
      </div>

      {/* Main Stage Content: Video Player Mode OR Interactive Micro-Lesson Stage */}
      {viewMode === 'video_player' && videoData ? (
        <TeachingVideoPlayer
          videoData={videoData}
          language={currentLanguage}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onSectionComplete={() => {
            if (hasNext) handleNext();
          }}
        />
      ) : (
        /* Interactive Micro-Segment Grid: Left AI Teacher, Right Dynamic Educational Visuals */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: AI Teacher Stage */}
          <div className="lg:col-span-5 h-full min-h-[420px]">
            <AITeacherStage
              narrationText={
                evalResult ? evalResult.feedback : currentSegment.narration
              }
              language={currentLanguage}
              isSpeaking={isSpeaking}
              onSpeakingChange={setIsSpeaking}
              videoUrl={videoUrl}
              status={isSpeaking ? 'speaking' : 'ready'}
              teacherInfo={session.teacher_info}
              isMuted={isMuted}
              topic={session.topic}
              segmentTitle={currentSegment.title}
              visualData={visualData}
            />
          </div>

          {/* Right: Dynamic Educational Visual Stage */}
          <div className="lg:col-span-7 h-full min-h-[420px]">
            <DynamicVisualStage
              visual={visualData}
              currentSegmentTitle={currentSegment.title}
              topic={session.topic}
              isSpeaking={isSpeaking}
            />
          </div>
        </div>
      )}

      {/* Synchronized Captions / Live Transcript */}
      <SynchronizedCaptions
        currentText={evalResult ? evalResult.feedback : currentSegment.narration}
        emphasis={currentSegment.emphasis}
        transcript={session.transcript}
        activeSegmentId={currentSegment.segment_id}
      />

      {/* Interactive Classroom Controls (Prev, Play/Pause, Replay, Next) */}
      <ClassroomControls
        isPlaying={isSpeaking}
        onTogglePlay={() => setIsSpeaking(!isSpeaking)}
        onReplay={handleReplay}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        isLoading={isLoadingSegment}
        currentSegmentIndex={session.current_segment_index}
        totalSegments={session.total_segments_in_section}
      />

      {/* Curriculum Flow & Section Stepper */}
      <SectionNavigator
        sections={session.sections_summary}
        currentSectionIndex={session.current_section_index}
        onSelectSection={handleJumpToSection}
        isLoading={isLoadingSegment}
      />

      {/* Interactive Teacher Question Check & Misconception Evaluation Bridge */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        {/* Misconception Alert Overlay if incorrect */}
        {evalResult && !evalResult.correct && evalResult.detected_misconception && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start space-x-3 text-rose-900 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase tracking-wider text-rose-700">
                Misconception Detected!
              </span>
              <p className="text-xs font-medium">{evalResult.detected_misconception}</p>
              <p className="text-[11px] text-rose-600">
                ⚡ Teacher Strategy Switched: <b>{evalResult.recommended_strategy?.toUpperCase()}</b>
              </p>
            </div>
          </div>
        )}

        {/* Correct Reinforcement Banner */}
        {evalResult && evalResult.correct && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-700">Excellent!</span> {evalResult.feedback}
            </div>
          </div>
        )}

        {/* Question Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Section Check</span>
          </span>
          <h3 className="text-base font-bold text-slate-900">
            {evalResult?.next_question ||
              currentSec.question ||
              `How would you explain the core mechanism of ${currentSegment.title} in your own words?`}
          </h3>
        </div>

        {/* Answer Form */}
        <form onSubmit={handleAnswerSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder={
              currentLanguage === 'Hindi'
                ? "यहाँ अपना उत्तर टाइप करें (उदा. सिद्धांत के अनुसार)..."
                : currentLanguage === 'Telugu'
                ? "మీ సమాధానాన్ని ఇక్కడ టైప్ చేయండి..."
                : currentLanguage === 'Hinglish'
                ? "Yahan apna answer type karein..."
                : "Type your answer here to check understanding..."
            }
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />

          {/* Voice Mic Input */}
          <button
            type="button"
            onClick={handleMicListen}
            className={`p-3 rounded-xl border ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            } cursor-pointer transition-all`}
            title="Speak your answer"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs tracking-wide shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <span>{isSubmitting ? "Checking..." : "Submit Answer"}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Full Lesson Video Generator & MP4 Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        isGenerating={videoGen.isGenerating}
        progress={videoGen.progress}
        progressStep={videoGen.progressStep}
        sceneCount={videoGen.sceneCount}
        isComplete={videoGen.isComplete}
        videoUrl={videoGen.videoUrl}
        downloadUrl={videoGen.downloadUrl}
        durationSeconds={videoGen.durationSeconds}
        hasAudio={videoGen.hasAudio}
        error={videoGen.error}
        topic={session.topic}
        language={currentLanguage}
      />
    </div>
  );
};
