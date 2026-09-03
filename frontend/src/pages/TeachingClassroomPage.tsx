import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Mic, Globe2, AlertTriangle, CheckCircle2, Award, RefreshCw, Sparkles } from 'lucide-react';
import { TeacherAvatar } from '../components/avatar/TeacherAvatar';
import { EquationRenderer } from '../components/visualizer/EquationRenderer';
import { GraphRenderer } from '../components/visualizer/GraphRenderer';
import { FlowDiagram } from '../components/visualizer/FlowDiagram';
import { Timeline } from '../components/visualizer/Timeline';
import { CodeVisualizer } from '../components/visualizer/CodeVisualizer';
import { ConceptMap } from '../components/visualizer/ConceptMap';
import { ProcessDiagram } from '../components/visualizer/ProcessDiagram';

import { startLesson, submitAnswer, switchLanguage } from '../services/api';
import { speechService } from '../services/speech';
import type { AnswerEvaluation } from '../types';

export const TeachingClassroomPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lessonState, setLessonState] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("English");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [evalResult, setEvalResult] = useState<AnswerEvaluation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      if (!lessonId) return;
      try {
        const data = await startLesson(lessonId);
        setLessonState(data);
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, [lessonId]);

  if (!lessonState) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-600 space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="font-medium text-sm">Initializing Virtual AI Classroom & Avatar Pipeline...</span>
      </div>
    );
  }

  const currentSection = lessonState.section || lessonState.lesson?.sections?.[0] || {
    id: "sec_1",
    title: "1. What is Ohm's Law?",
    duration: 5,
    explanation: "Welcome! I'm your AI Teacher. Today we are exploring Ohm's Law. Think of voltage as pressure pushing electric charges through a wire, and resistance as friction opposing them.",
    visual_type: "graph",
    visual_data: {
      title: "Voltage vs Current Curve",
      x_axis: "Current I (Amperes)",
      y_axis: "Voltage V (Volts)",
      series: [{ x: 1, y: 4 }, { x: 2, y: 8 }, { x: 3, y: 12 }],
      formula: "V = I × R"
    },
    question: "What happens to the current flowing through a circuit if resistance increases while voltage stays constant?"
  };

  const handleLanguageChange = async (newLang: string) => {
    setCurrentLanguage(newLang);
    if (lessonId) {
      await switchLanguage(lessonId, newLang);
    }
  };

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
        () => setIsListening(false)
      );
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || !lessonId) return;
    setIsSubmitting(true);
    try {
      const res = await submitAnswer(lessonId, currentSection.id, studentAnswer);
      setEvalResult(res);
      setIsSpeaking(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVisualComponent = () => {
    const vtype = currentSection.visual_type;
    const vdata = currentSection.visual_data || {};

    switch (vtype) {
      case 'equation':
        return <EquationRenderer data={vdata} />;
      case 'graph':
        return <GraphRenderer data={vdata} />;
      case 'flow':
      case 'diagram':
        return <FlowDiagram data={vdata} />;
      case 'timeline':
        return <Timeline data={vdata} />;
      case 'code':
        return <CodeVisualizer data={vdata} />;
      case 'concept_map':
        return <ConceptMap data={vdata} />;
      case 'process':
        return <ProcessDiagram data={vdata} />;
      default:
        return <GraphRenderer data={vdata} />;
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Classroom Control Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Live AI Virtual Classroom
          </span>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{currentSection.title}</h1>
        </div>

        {/* On-The-Fly Language Switcher & Final Quiz */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="font-semibold">Language:</span>
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Hinglish">Hinglish</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
            </select>
          </div>

          <button
            onClick={() => navigate(`/assessment/${lessonId}`)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Final Quiz</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Avatar, Right Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 h-full">
          <TeacherAvatar
            explanationText={evalResult ? evalResult.feedback : currentSection.explanation}
            language={currentLanguage}
            isSpeaking={isSpeaking}
            onSpeakingChange={setIsSpeaking}
            videoUrl={lessonState?.video?.avatar?.video_url}
          />
        </div>

        <div className="lg:col-span-7 h-full flex flex-col justify-between">
          {renderVisualComponent()}
        </div>
      </div>

      {/* Interactive Question & Misconception Evaluation Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
        {/* Misconception Alert Overlay if incorrect */}
        {evalResult && !evalResult.correct && evalResult.detected_misconception && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start space-x-3 text-rose-900 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase tracking-wider text-rose-700">Misconception Detected!</span>
              <p className="text-xs font-medium">{evalResult.detected_misconception}</p>
              <p className="text-[11px] text-rose-600">⚡ Teacher Strategy Switched: <b>{evalResult.recommended_strategy.toUpperCase()}</b></p>
            </div>
          </div>
        )}

        {/* Correct Reinforcement Banner */}
        {evalResult && evalResult.correct && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-700">Great Job!</span> {evalResult.feedback}
            </div>
          </div>
        )}

        {/* Question Prompt */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Teacher Question Check</span>
          </span>
          <h3 className="text-base font-bold text-slate-900">
            {evalResult?.next_question || currentSection.question || "What happens to current if resistance increases?"}
          </h3>
        </div>

        {/* Answer Input Form */}
        <form onSubmit={handleAnswerSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Type your answer here (e.g. Current increases / Current decreases)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />

          {/* Voice Input Button */}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl primary-button font-bold text-xs tracking-wide shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <span>{isSubmitting ? "Evaluating..." : "Submit Answer"}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
