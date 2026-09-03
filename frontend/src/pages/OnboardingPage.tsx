import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  GraduationCap,
  Target,
  Globe2,
  Compass,
  Clock,
  BarChart2,
  Lock,
  ChevronRight,
  FileText,
  Share2,
  Download,
  BookOpen,
  User,
  Zap,
  Calculator,
  Cpu,
  HelpCircle,
  Link as LinkIcon,
  Play,
  Lightbulb,
  Edit3
} from 'lucide-react';
import type { LearnerProfile, LessonPlan } from '../types';
import { createLessonPlan, uploadDocument } from '../services/api';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("Electricity & Ohm's Law");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCurriculumView, setActiveCurriculumView] = useState<'visual' | 'markdown'>('visual');

  const [profile, setProfile] = useState<LearnerProfile>({
    name: 'Learner',
    education_level: 'Intermediate',
    current_knowledge: 'Undergraduate science foundations',
    learning_goal: 'Foundational understanding',
    preferred_language: 'English',
    teaching_style: 'Socratic',
    available_time: '30 minutes',
    desired_depth: 'Deep',
  });

  // State to hold active/generated lesson plan
  const [generatedPlan, setGeneratedPlan] = useState<LessonPlan | null>(null);

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      setDocumentId(res.document_id);
    } catch (e) {
      console.error('File upload failed:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const plan = await createLessonPlan(topic, profile, documentId);
      setGeneratedPlan(plan);
      // Smooth scroll to curriculum section
      setTimeout(() => {
        const curriculumEl = document.getElementById('curriculum-section');
        if (curriculumEl) {
          curriculumEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (e) {
      console.error('Lesson plan creation failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartClassroom = (planId?: string) => {
    const id = planId || generatedPlan?.id || 'demo_electricity_101';
    navigate(`/teach/${id}`);
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* ----------------- SECTION 1: LEARNER SETUP & PERSONALIZATION ----------------- */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-100" />
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Learner Setup & Personalization
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Let's create a personalized learning experience tailored just for you.
            </p>
          </div>

          <div className="self-start sm:self-auto">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs tracking-wider uppercase">
              STEP 1 OF 4
            </span>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Topic & Document Upload (5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block">
                  1. What do you want to learn?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Electricity & Ohm's Law"
                    className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all pr-10"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Upload Educational Material Box */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 block">
                  Upload Educational Material (Optional)
                </label>
                <div
                  onClick={() => document.getElementById('file-upload-input')?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-400/80 bg-slate-50/50 hover:bg-indigo-50/20 rounded-2xl p-6 text-center transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">
                    Drop files here or <span className="text-indigo-600 font-semibold underline">browse</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    PDF, DOCX, PPTX, TXT (Max 20MB)
                  </p>

                  <input
                    type="file"
                    id="file-upload-input"
                    accept=".pdf,.docx,.pptx,.txt"
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />

                  {selectedFile && (
                    <div className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    </div>
                  )}
                  {isUploading && (
                    <p className="text-xs text-indigo-600 font-semibold mt-2 animate-pulse">
                      Analyzing & indexing document...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: 6 Styled Form Controls (7 Cols) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Education Level */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Education Level</span>
                </label>
                <select
                  value={profile.education_level}
                  onChange={(e: any) => setProfile({ ...profile, education_level: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                >
                  <option value="Beginner">High School / Beginner</option>
                  <option value="Intermediate">Undergraduate / College</option>
                  <option value="Advanced">Graduate / Professional</option>
                </select>
              </div>

              {/* 2. Learning Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Learning Goal</span>
                </label>
                <select
                  value={profile.learning_goal}
                  onChange={(e) => setProfile({ ...profile, learning_goal: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                >
                  <option value="Foundational understanding">Foundational understanding</option>
                  <option value="Exam preparation">Exam preparation</option>
                  <option value="Interview preparation">Interview preparation</option>
                  <option value="Practical problem solving">Practical problem solving</option>
                  <option value="Revision">Revision</option>
                </select>
              </div>

              {/* 3. Target Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Target Language</span>
                </label>
                <select
                  value={profile.preferred_language}
                  onChange={(e: any) => setProfile({ ...profile, preferred_language: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Hinglish">Hinglish (Hindi + English)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                </select>
              </div>

              {/* 4. Teaching Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>Teaching Style</span>
                </label>
                <select
                  value={profile.teaching_style}
                  onChange={(e: any) => setProfile({ ...profile, teaching_style: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                >
                  <option value="Socratic">Socratic (Guiding Questions & Reflection)</option>
                  <option value="Visual">Visual Diagrams & Graphs</option>
                  <option value="Simple & Friendly">Simple & Friendly</option>
                  <option value="Storytelling">Storytelling & Analogies</option>
                  <option value="Technical">Technical & Derivations</option>
                  <option value="Exam-focused">Exam-focused & Traps</option>
                </select>
              </div>

              {/* 5. Available Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Available Time</span>
                </label>
                <select
                  value={profile.available_time}
                  onChange={(e) => setProfile({ ...profile, available_time: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                >
                  <option value="10 minutes">10 minutes (Quick Summary)</option>
                  <option value="20 minutes">20 minutes</option>
                  <option value="30 minutes">30 minutes (Standard Session)</option>
                  <option value="45 minutes">45 minutes</option>
                  <option value="60 minutes">60 minutes (Deep Dive)</option>
                </select>
              </div>

              {/* 6. Desired Depth */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Desired Depth</span>
                </label>
                <select
                  value={profile.desired_depth}
                  onChange={(e: any) => setProfile({ ...profile, desired_depth: e.target.value })}
                  className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                >
                  <option value="Deep">Deep dive</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Quick">Quick overview</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 rounded-xl primary-button font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? "Synthesizing Personalized Curriculum..." : "Generate Personalized Lesson Plan"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Footer Security Note */}
            <p className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 text-center">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Your data is secure and used only for personalized learning.</span>
            </p>
          </div>
        </form>
      </section>

      {/* ----------------- SECTION 2: EDUCATIONAL ARCHITECT CURRICULUM ----------------- */}
      <section id="curriculum-section" className="space-y-6">
        {/* Curriculum Header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-600 block">
                EDUCATIONAL ARCHITECT CURRICULUM
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {generatedPlan ? generatedPlan.title : "Electricity & Ohm's Law — Tailored Lesson Plan"}
              </h2>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center space-x-2.5 self-start sm:self-auto">
              <button
                onClick={() => alert("Curriculum exported as PDF/JSON")}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>

              <button
                onClick={() => alert("Curriculum share link copied to clipboard")}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Undergraduate / College</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
              <Target className="w-3.5 h-3.5" />
              <span>Foundational understanding</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>Socratic Style</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>30 minutes</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Deep dive</span>
            </span>
          </div>
        </div>

        {/* Two-Column Curriculum Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (4 cols): Profile Summary, Overview & Session Summary */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Learner Profile Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>Learner Profile Summary</span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
                <div className="pt-1">
                  <span className="font-semibold text-slate-800">Level & Goal: </span>
                  <span>Undergraduate / College | Foundational understanding</span>
                </div>
                <div className="pt-2">
                  <span className="font-semibold text-slate-800">Format: </span>
                  <span>Socratic Style</span>
                </div>
                <div className="pt-2">
                  <span className="font-semibold text-slate-800">Total Time: </span>
                  <span>30 minutes</span>
                </div>
                <div className="pt-2">
                  <span className="font-semibold text-slate-800">Depth: </span>
                  <span>Deep dive</span>
                </div>
              </div>
            </div>

            {/* 2. Curriculum Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Curriculum Overview</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                This structured curriculum uses intuitive physical analogies and quantitative derivation to build a deep, lasting understanding of Ohm's Law and its real-world applications.
              </p>

              {/* View Toggle Buttons */}
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveCurriculumView('visual')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeCurriculumView === 'visual'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>&lt;/&gt; Visual Curriculum</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCurriculumView('markdown')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeCurriculumView === 'markdown'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>&lt;/&gt; Markdown Output</span>
                </button>
              </div>
            </div>

            {/* 3. Session Summary with 100% Circle Progress */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Session Summary</span>
                </div>
                <div className="flex items-center space-x-6 text-xs text-slate-600">
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-bold">Total Time</span>
                    <span className="font-bold text-slate-800 text-sm">30 minutes</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-bold">Sections</span>
                    <span className="font-bold text-slate-800 text-sm">3</span>
                  </div>
                </div>
              </div>

              {/* Circular Gauge */}
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="100, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-slate-800">100%</span>
              </div>
            </div>
          </div>

          {/* Right Column (8 cols): Curriculum Section Cards */}
          <div className="lg:col-span-8 space-y-4">
            {/* SECTION 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 hover:border-indigo-200 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-md bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    01
                  </span>
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Section 1: Intuitive Physical Foundations & Core Variables
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                    ⏱ 10 min
                  </span>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-100 text-slate-700">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-slate-900">Key Concepts</span>
                  <span className="text-slate-500">3 Topics</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-slate-700">
                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold text-slate-900">Guided Exercise</span>
                  <span className="text-slate-500">Water Pipe Analogy</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50/80 border border-purple-100 text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-semibold text-slate-900">Knowledge Check</span>
                  <span className="text-slate-500">2 Questions</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-50/80 border border-cyan-100 text-slate-700">
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="font-semibold text-slate-900">Real-world Connection</span>
                  <span className="text-slate-500">Hydraulic Analogy</span>
                </div>
              </div>
            </div>

            {/* SECTION 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    02
                  </span>
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Section 2: Mathematical Formulation & Quantitative Derivation
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                    ⏱ 12 min
                  </span>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-100 text-slate-700">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-slate-900">Key Concepts</span>
                  <span className="text-slate-500">4 Topics</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-slate-700">
                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold text-slate-900">Guided Exercise</span>
                  <span className="text-slate-500">Circuit Problem Solving</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50/80 border border-purple-100 text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-semibold text-slate-900">Knowledge Check</span>
                  <span className="text-slate-500">2 Questions</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-50/80 border border-cyan-100 text-slate-700">
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="font-semibold text-slate-900">Real-world Connection</span>
                  <span className="text-slate-500">Automotive Circuit</span>
                </div>
              </div>
            </div>

            {/* SECTION 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 hover:border-emerald-200 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-7 h-7 rounded-md bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    03
                  </span>
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Section 3: Practical Circuit Application & Misconception Traps
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                    ⏱ 8 min
                  </span>
                </div>
              </div>

              {/* Tag Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-100 text-slate-700">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-slate-900">Key Concepts</span>
                  <span className="text-slate-500">3 Topics</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-slate-700">
                  <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-semibold text-slate-900">Guided Exercise</span>
                  <span className="text-slate-500">Real Circuit Analysis</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50/80 border border-purple-100 text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                  <span className="font-semibold text-slate-900">Knowledge Check</span>
                  <span className="text-slate-500">2 Questions</span>
                </div>

                <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-50/80 border border-cyan-100 text-slate-700">
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-500" />
                  <span className="font-semibold text-slate-900">Real-world Connection</span>
                  <span className="text-slate-500">Household Circuits</span>
                </div>
              </div>
            </div>

            {/* Next Steps & Practice Roadmap Card */}
            <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Next Steps & Practice Roadmap</span>
              </div>
              <div className="text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-800">Immediate Action: </span>
                  <span>Solve 5 Ohm's Law problems from real circuits.</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Further Exploration: </span>
                  <span>• Kirchhoff's Laws • Series & Parallel Circuits • Power & Energy</span>
                </div>
              </div>
            </div>

            {/* Launch Interactive AI Classroom Button */}
            <div className="pt-2">
              <button
                onClick={() => handleStartClassroom()}
                className="w-full py-4 rounded-xl primary-button font-bold text-sm sm:text-base flex items-center justify-center space-x-3 shadow-lg cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Interactive AI Video Classroom</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
