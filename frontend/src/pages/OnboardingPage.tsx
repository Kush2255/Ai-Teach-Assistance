import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Upload, Clock, Sparkles, Target, Globe2, Compass, Layers } from 'lucide-react';
import type { LearnerProfile } from '../types';
import { createLessonPlan, uploadDocument } from '../services/api';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("Electricity & Ohm's Law");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [profile, setProfile] = useState<LearnerProfile>({
    name: 'Learner',
    education_level: 'Beginner',
    current_knowledge: 'Basic high school science',
    learning_goal: 'Understand fundamentals',
    preferred_language: 'English',
    teaching_style: 'Simple & Friendly',
    available_time: '20 minutes',
    desired_depth: 'Balanced',
  });

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
      navigate(`/planning`, { state: { plan, profile } });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center space-x-2">
          <Sparkles className="w-6 h-6 text-blue-400" />
          <span>Learner Setup & Personalization</span>
        </h1>
        <p className="text-sm text-slate-400">Tailor your AI Educator to your exact learning goals, style, and time constraints.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl space-y-8 border border-slate-800">
        {/* Step 1: Topic or Material */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>1. What do you want to learn?</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Machine Learning, Electricity & Ohm's Law, React Hooks"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm"
            required
          />

          {/* Optional Document Drag-and-Drop */}
          <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 text-center transition-all bg-slate-950/40">
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">Upload Educational Material (PDF, DOCX, PPTX, TXT)</p>
            <p className="text-[10px] text-slate-500 mt-1">Optional. Prioritizes uploaded content with citations.</p>
            <input
              type="file"
              accept=".pdf,.docx,.pptx,.txt"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-blue-300 cursor-pointer border border-slate-700"
            >
              {isUploading ? "Processing Document..." : selectedFile ? `Selected: ${selectedFile.name}` : "Browse File"}
            </label>
          </div>
        </div>

        {/* Step 2: Level & Goal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Education Level</span>
            </label>
            <select
              value={profile.education_level}
              onChange={(e: any) => setProfile({ ...profile, education_level: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Learning Goal</span>
            </label>
            <select
              value={profile.learning_goal}
              onChange={(e) => setProfile({ ...profile, learning_goal: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500"
            >
              <option value="Understand fundamentals">Understand fundamentals</option>
              <option value="Exam preparation">Exam preparation</option>
              <option value="Interview preparation">Interview preparation</option>
              <option value="Academic learning">Academic learning</option>
              <option value="Practical skills">Practical skills</option>
              <option value="Revision">Revision</option>
            </select>
          </div>
        </div>

        {/* Step 3: Language & Teaching Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Globe2 className="w-4 h-4 text-purple-400" />
              <span>Preferred Language</span>
            </label>
            <select
              value={profile.preferred_language}
              onChange={(e: any) => setProfile({ ...profile, preferred_language: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Hinglish">Hinglish (Hindi + English)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Teaching Style</span>
            </label>
            <select
              value={profile.teaching_style}
              onChange={(e: any) => setProfile({ ...profile, teaching_style: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500"
            >
              <option value="Simple & Friendly">Simple & Friendly</option>
              <option value="Visual">Visual Diagrams & Graphs</option>
              <option value="Storytelling">Storytelling & Analogies</option>
              <option value="Technical">Technical & Derivations</option>
              <option value="Socratic">Socratic Questioning</option>
              <option value="Exam-focused">Exam-focused & Traps</option>
            </select>
          </div>
        </div>

        {/* Step 4: Time & Depth */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Available Time</span>
            </label>
            <select
              value={profile.available_time}
              onChange={(e) => setProfile({ ...profile, available_time: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500"
            >
              <option value="5 minutes">5 minutes (Quick summary)</option>
              <option value="10 minutes">10 minutes</option>
              <option value="20 minutes">20 minutes (Standard)</option>
              <option value="30 minutes">30 minutes</option>
              <option value="60 minutes">60 minutes (Deep Dive)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Desired Depth</span>
            </label>
            <select
              value={profile.desired_depth}
              onChange={(e: any) => setProfile({ ...profile, desired_depth: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-sm focus:border-blue-500"
            >
              <option value="Quick">Quick Overview</option>
              <option value="Balanced">Balanced Core + Examples</option>
              <option value="Deep">Deep Comprehensive Derivation</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 rounded-xl gradient-button font-bold text-base shadow-xl flex items-center justify-center space-x-2"
        >
          <span>{isGenerating ? "Generating Curriculum Plan..." : "Generate Personalized Lesson Plan"}</span>
        </button>
      </form>
    </div>
  );
};
