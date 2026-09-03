import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Mic, Globe2, AlertTriangle, CheckCircle2, Award, RefreshCw } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-[60vh] text-slate-300 space-x-3">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
        <span>Initializing Virtual AI Classroom & Avatar Pipeline...</span>
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
      setIsSpeaking(true); // AI Teacher speaks feedback
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Classroom Control Header */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
            Live AI Virtual Classroom
          </span>
          <h1 className="text-xl font-bold text-white mt-1">{currentSection.title}</h1>
        </div>

        {/* On-The-Fly Language Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Globe2 className="w-4 h-4 text-purple-400" />
            <span>Language:</span>
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent font-semibold text-white focus:outline-none cursor-pointer"
            >
              <option value="English" className="bg-slate-900">English</option>
              <option value="Hindi" className="bg-slate-900">Hindi (हिंदी)</option>
              <option value="Hinglish" className="bg-slate-900">Hinglish</option>
              <option value="Telugu" className="bg-slate-900">Telugu (తెలుగు)</option>
            </select>
          </div>

          <button
            onClick={() => navigate(`/assessment/${lessonId}`)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-bold border border-emerald-500/40"
          >
            <Award className="w-4 h-4" />
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
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-indigo-500/30">
        {/* Misconception Alert Overlay if incorrect */}
        {evalResult && !evalResult.correct && evalResult.detected_misconception && (
          <div className="bg-rose-950/80 border border-rose-500/50 p-4 rounded-2xl flex items-start space-x-3 text-rose-200 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-bold text-xs uppercase tracking-wider text-rose-300">Misconception Detected!</span>
              <p className="text-xs font-medium">{evalResult.detected_misconception}</p>
              <p className="text-[11px] text-rose-400">⚡ Teacher Strategy Switched: <b>{evalResult.recommended_strategy.toUpperCase()}</b></p>
            </div>
          </div>
        )}

        {/* Correct Reinforcement Banner */}
        {evalResult && evalResult.correct && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-2xl flex items-center space-x-3 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-emerald-300">Great Job!</span> {evalResult.feedback}
            </div>
          </div>
        )}

        {/* Question Prompt */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">Teacher Question Check</span>
          <h3 className="text-base font-bold text-white">
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
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500"
          />

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={handleMicListen}
            className={`p-3 rounded-xl border ${isListening ? 'bg-rose-600 border-rose-500 text-white animate-pulse' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
            title="Speak your answer"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl gradient-button font-bold text-xs tracking-wide shadow-lg flex items-center space-x-2"
          >
            <span>{isSubmitting ? "Evaluating..." : "Submit Answer"}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
