import React, { useState, useCallback } from 'react';
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
  Edit3,
  Copy,
  Check,
  Brain,
  Search,
  Database,
  Layers,
  AlertCircle,
  X as XIcon,
} from 'lucide-react';
import type { LearnerProfile, LessonPlan, UnderstandingStage, LearningContextApiResponse } from '../types';
import { createLessonPlan, uploadDocument, understandLearnerContext, API_BASE } from '../services/api';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("Electricity & Ohm's Law");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCurriculumView, setActiveCurriculumView] = useState<'visual' | 'markdown'>('visual');
  const [copied, setCopied] = useState(false);

  // Workflow 2: Understanding state
  const [understandingStages, setUnderstandingStages] = useState<UnderstandingStage[]>([]);
  const [isUnderstanding, setIsUnderstanding] = useState(false);
  const [understandingError, setUnderstandingError] = useState<string | null>(null);
  const [learningContextResponse, setLearningContextResponse] = useState<LearningContextApiResponse | null>(null);

  const [profile, setProfile] = useState<LearnerProfile>({
    name: 'Learner',
    education_level: 'Undergraduate',
    current_knowledge: 'Undergraduate science foundations',
    learning_goal: 'Foundational understanding',
    preferred_language: 'English',
    teaching_style: 'Socratic',
    available_time: '30 minutes',
    desired_depth: 'Deep dive',
  });

  // Default rich initial plan
  const defaultPlan: LessonPlan = {
    id: "lesson_demo_default",
    title: "Electricity & Ohm's Law — Tailored Lesson Plan",
    topic: "Electricity & Ohm's Law",
    objective: "Master the intuitive principles, quantitative models, and practical applications of Electricity & Ohm's Law.",
    overview: "This structured curriculum uses intuitive physical analogies and quantitative derivation to build a deep, lasting understanding of Ohm's Law and its real-world applications.",
    estimated_minutes: 30,
    difficulty: "Undergraduate / College",
    language: "English",
    teaching_style: "Socratic",
    desired_depth: "Deep dive",
    immediate_action: "Solve 5 Ohm's Law problems from real circuits.",
    further_exploration: [
      "Kirchhoff's Voltage and Current Laws (KVL & KCL)",
      "Series & Parallel Resistor Combinations",
      "Power & Energy in Electrical Circuits (P = V × I)"
    ],
    markdown_curriculum: `# Electricity & Ohm's Law — Tailored Lesson Plan

> **Learner Profile Summary**
> - **Level & Goal**: Undergraduate / College | Foundational understanding
> - **Format**: Socratic Style | 30 minutes Total | Deep dive Depth

---

## Curriculum Overview
*This structured curriculum uses intuitive physical analogies and quantitative derivation to build a deep, lasting understanding of Ohm's Law and its real-world applications.*

---

## Section 1: Intuitive Physical Foundations & Core Variables
- **Allocated Time**: 10 mins
- **Section Objective**: Establish intuitive physical foundations and core parameters of electric circuits.

### 1. Key Concepts
- **Voltage as Potential Difference**: Electrical pressure pushing charge through conductors.
- **Current as Flow Rate**: Charge displacement rate measured in Amperes (Coulombs/sec).
- **Resistance as Friction**: Atomic lattice opposition to charge flow measured in Ohms.

### 2. Guided Exercise / Example
- Water pipe hydraulic analogy: Pressure corresponds to Voltage, Flow Rate to Current, and Pipe Narrowing to Resistance.

### 3. Knowledge Check & Reflection
- What happens to current in a circuit when resistance increases while voltage remains constant?
- Distinguish between potential difference and charge flow rate.

---

## Section 2: Mathematical Formulation & Quantitative Derivation
- **Allocated Time**: 12 mins
- **Section Objective**: Formulate V = I × R and compute quantitative parameters in circuit systems.

### 1. Key Concepts
- **Linear Ohm's Law Relation**: Voltage is directly proportional to Current under constant temperature (V = I × R).
- **Slope Interpretation**: The slope of the V-I characteristic curve corresponds directly to Resistance R.
- **Inverse Proportionality**: Current I = V / R decreases as Resistance increases.

### 2. Guided Exercise / Example
- Automotive 12V DC system powering a 4Ω headlamp: Compute Current I = 12 / 4 = 3 Amperes.

### 3. Knowledge Check & Reflection
- If potential V = 12V and resistance R = 4Ω, calculate Current I.
- Why is the V-I curve linear for ohmic materials?

---

## Section 3: Practical Circuit Application & Misconception Traps
- **Allocated Time**: 8 mins
- **Section Objective**: Diagnose real-world load behaviors and deconstruct common misconception traps.

### 1. Key Concepts
- **Internal Resistance**: Voltage drop across non-ideal power sources.
- **Load Balancing**: Series vs Parallel behavior under load variations.
- **Common Misconceptions**: Debunking the idea that "Current is consumed" or "Current increases with resistance".

### 2. Guided Exercise / Example
- Household circuit diagnostic: Identify why total current increases when additional appliances are connected in parallel.

### 3. Knowledge Check & Reflection
- Why does total current decrease when adding series resistance?
- How does internal source impedance affect delivered power?

---

## Next Steps & Practice Roadmap
- **Immediate Action**: Solve 5 Ohm's Law problems from real circuits.
- **Further Exploration**:
  • Kirchhoff's Laws (KVL & KCL)
  • Series & Parallel Circuits
  • Power & Energy in Circuits (P = V × I)`,
    sections: [
      {
        id: "sec_1",
        title: "Section 1: Intuitive Physical Foundations & Core Variables",
        duration: 10,
        section_objective: "Establish intuitive physical foundations and core parameters of electric circuits.",
        concepts: [
          "Voltage as Potential Difference (Driving pressure)",
          "Current as Flow Rate (Amperes / Coulombs per second)",
          "Resistance as Material Impedance (Ohms)"
        ],
        guided_exercise: "Water Pipe Analogy: Relate water pump pressure to voltage, pipe diameter to resistance, and flow rate to current.",
        examples: ["Hydraulic Analogy"],
        knowledge_check: [
          "What happens to current in a circuit when resistance increases while voltage remains constant?",
          "How does potential difference differ from current flow rate?"
        ],
        real_world_connection: "Hydraulic Analogy & Fluid Dynamics",
        visual_type: "graph",
        question: "What happens to the current flowing through a circuit if resistance increases while voltage stays constant?",
        expected_answer: "Current decreases because resistance opposes charge flow (I = V/R)."
      },
      {
        id: "sec_2",
        title: "Section 2: Mathematical Formulation & Quantitative Derivation",
        duration: 12,
        section_objective: "Formulate V = I × R and solve quantitative parameters in circuit systems.",
        concepts: [
          "V = I × R Formula Derivation",
          "Linear V-I Curve & Slope Interpretation",
          "Inverse Proportionality of Current & Resistance",
          "Ohmic vs Non-Ohmic Conductor Properties"
        ],
        guided_exercise: "Automotive 12V DC circuit problem: Calculate current when powering a 4 Ohm headlamp.",
        examples: ["Automotive Headlamp Circuit"],
        knowledge_check: [
          "If supply is 12V and load is 4 Ohms, what is Current I?",
          "Why is the V-I curve linear for ohmic materials?"
        ],
        real_world_connection: "Automotive Headlamp & Battery Circuit",
        visual_type: "equation",
        question: "If V = 12V and R = 4 Ohms, calculate Current I.",
        expected_answer: "3 Amperes (I = V/R = 12/4 = 3A)"
      },
      {
        id: "sec_3",
        title: "Section 3: Practical Circuit Application & Misconception Traps",
        duration: 8,
        section_objective: "Diagnose real-world load behaviors and deconstruct common misconception traps.",
        concepts: [
          "Internal Source Impedance",
          "Series vs Parallel Current Distribution",
          "Common Misconception: Current is not 'consumed' across resistors"
        ],
        guided_exercise: "Real Circuit Analysis: Deconstruct household electrical appliances and fuse trip behaviors.",
        examples: ["Household Electrical Outlets"],
        knowledge_check: [
          "Why does current not increase when adding series resistance?",
          "How does source impedance impact delivered power?"
        ],
        real_world_connection: "Household Circuits & Breakers",
        visual_type: "diagram",
        question: "Why does adding resistance in series decrease total circuit current?",
        expected_answer: "Total equivalent resistance increases, which reduces current according to Ohm's Law."
      }
    ]
  };

  const [currentPlan, setCurrentPlan] = useState<LessonPlan>(defaultPlan);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'pptx', 'txt', 'doc', 'ppt'].includes(ext || '')) {
      setUploadError('Unsupported file format. Please upload PDF, DOCX, PPTX, or TXT.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File is too large. Maximum size is 20MB.');
      return;
    }
    setSelectedFile(file);
    setUploadError(null);
    setIsUploading(true);
    try {
      const res = await uploadDocument(file);
      setDocumentId(res.document_id);
    } catch (e: any) {
      setUploadError(e.message || 'File upload failed. You can continue with topic-based learning.');
      setDocumentId(undefined);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper: update a single stage's status
  const updateStage = useCallback(
    (id: string, status: UnderstandingStage['status']) => {
      setUnderstandingStages(prev =>
        prev.map(s => s.id === id ? { ...s, status } : s)
      );
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Input validation
    if (!topic.trim()) {
      setUnderstandingError('Please enter a topic to continue.');
      return;
    }

    setIsGenerating(true);
    setIsUnderstanding(true);
    setUnderstandingError(null);
    setLearningContextResponse(null);

    // Initialize stages — document stage only shown if file is uploaded
    const hasDocument = Boolean(documentId);
    const stages: UnderstandingStage[] = [
      {
        id: 'profile',
        label: 'Understanding your learner profile',
        description: 'Analyzing education level, goals, and learning style',
        status: 'active',
      },
      {
        id: 'goal',
        label: 'Identifying your learning goal',
        description: 'Mapping goal to appropriate pedagogical strategy',
        status: 'pending',
      },
      {
        id: 'topic',
        label: 'Analyzing the topic',
        description: 'Identifying core concepts, prerequisites, and relationships',
        status: 'pending',
      },
      ...(hasDocument ? [{
        id: 'rag',
        label: 'Reviewing your uploaded material',
        description: 'Extracting and retrieving relevant content from your document',
        status: 'pending' as UnderstandingStage['status'],
      }] : []),
      {
        id: 'context',
        label: 'Building your learning context',
        description: 'Assembling structured context for the lesson planner',
        status: 'pending',
      },
    ];
    setUnderstandingStages(stages);

    // Scroll to progress panel
    setTimeout(() => {
      document.getElementById('understanding-panel')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    try {
      // --- PHASE 1: Profile understood ---
      await new Promise(r => setTimeout(r, 300)); // brief visual pause
      updateStage('profile', 'done');
      updateStage('goal', 'active');

      await new Promise(r => setTimeout(r, 400));
      updateStage('goal', 'done');
      updateStage('topic', 'active');

      if (hasDocument) {
        await new Promise(r => setTimeout(r, 400));
        updateStage('topic', 'done');
        updateStage('rag', 'active');
      }

      // --- PHASE 2: Call the AI Understanding API ---
      updateStage('context', 'active');
      const contextResponse = await understandLearnerContext(topic, profile, documentId);

      // Mark remaining stages done
      if (hasDocument) updateStage('rag', 'done');
      else updateStage('topic', 'done');
      updateStage('context', 'done');

      setLearningContextResponse(contextResponse);
      setIsUnderstanding(false);

      // --- PHASE 3: Lesson Plan generation (Workflow 3 hand-off) ---
      const plan = await createLessonPlan(
        contextResponse.learning_context.topic,
        profile,
        documentId,
        contextResponse.session_id,
        contextResponse.learning_context,
      );

      setCurrentPlan(plan);
      setTimeout(() => {
        const curriculumEl = document.getElementById('curriculum-section');
        if (curriculumEl) {
          curriculumEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (e: any) {
      const message = e.message || 'Something went wrong. Please try again.';
      setUnderstandingError(message);
      setIsUnderstanding(false);
      // Mark the last active stage as error
      setUnderstandingStages(prev =>
        prev.map(s => s.status === 'active' ? { ...s, status: 'error' } : s)
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    const textToCopy = currentPlan.markdown_curriculum || defaultPlan.markdown_curriculum || "";
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportMarkdown = () => {
    const textToExport = currentPlan.markdown_curriculum || defaultPlan.markdown_curriculum || "";
    const blob = new Blob([textToExport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentPlan.topic.replace(/\s+/g, '_')}_Curriculum.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStartClassroom = async () => {
    let lessonId = currentPlan.id;
    if (!lessonId || lessonId === 'lesson_demo_default') {
      try {
        const res = await fetch(`${API_BASE}/demo/start`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          lessonId = data.demo_lesson_id || 'demo_electricity_101';
        } else {
          lessonId = 'demo_electricity_101';
        }
      } catch {
        lessonId = 'demo_electricity_101';
      }
    }
    navigate(`/teach/${lessonId}`);
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
            {/* Left Column: Topic & Document Upload */}
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

            {/* Right Column: 6 Styled Form Controls */}
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
                  <option value="Elementary">Elementary</option>
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate / College</option>
                  <option value="Professional">Professional</option>
                  <option value="Self-Taught">Self-Taught</option>
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
                  <option value="Practical skill acquisition">Practical skill acquisition</option>
                  <option value="Concept mastery">Concept mastery</option>
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
                  <option value="First Principles">First Principles (Fundamental Truths)</option>
                  <option value="Project-Based">Project-Based (Applied Practice)</option>
                  <option value="Storytelling">Storytelling & Analogies</option>
                  <option value="Direct Instruction">Direct Instruction & Technical</option>
                  <option value="Visual">Visual Diagrams & Curves</option>
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
                  <option value="High-level overview">High-level overview</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Deep dive">Deep dive</option>
                  <option value="Mastery">Mastery</option>
                  <option value="Modular reference">Modular reference</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isGenerating || isUploading}
              className="w-full py-3.5 rounded-xl primary-button font-bold text-sm sm:text-base flex items-center justify-center space-x-2 shadow-md cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>AI Teacher is preparing your lesson...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Personalized Lesson Plan</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Footer Security Note */}
            <p className="flex items-center justify-center space-x-1.5 text-xs text-slate-400 text-center">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Your data is secure and used only for personalized learning.</span>
            </p>
          </div>
        </form>

        {/* ── UNDERSTANDING PROGRESS PANEL ── */}
        {(isUnderstanding || understandingStages.length > 0) && (
          <div
            id="understanding-panel"
            className="mt-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-slate-50/80 p-5 sm:p-6 space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">AI Teacher Preparation</p>
                  <p className="text-[11px] text-slate-500">Understanding you before teaching</p>
                </div>
              </div>
              {isUnderstanding && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                  <span>Processing</span>
                </span>
              )}
              {!isUnderstanding && !understandingError && understandingStages.length > 0 && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                  <Check className="w-3 h-3" />
                  <span>Complete</span>
                </span>
              )}
            </div>

            {/* Stage List */}
            <div className="space-y-2">
              {understandingStages.map((stage) => {
                const stageIcons: Record<string, React.ReactNode> = {
                  profile: <User className="w-3.5 h-3.5" />,
                  goal: <Target className="w-3.5 h-3.5" />,
                  topic: <Search className="w-3.5 h-3.5" />,
                  rag: <Database className="w-3.5 h-3.5" />,
                  context: <Layers className="w-3.5 h-3.5" />,
                };

                return (
                  <div key={stage.id} className="flex items-center space-x-3">
                    {/* Status icon */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        stage.status === 'done'
                          ? 'bg-emerald-100 text-emerald-600'
                          : stage.status === 'active'
                          ? 'bg-indigo-100 text-indigo-600 animate-pulse'
                          : stage.status === 'error'
                          ? 'bg-red-100 text-red-500'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {stage.status === 'done' && <Check className="w-3.5 h-3.5" />}
                      {stage.status === 'active' && (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {stage.status === 'error' && <XIcon className="w-3 h-3" />}
                      {stage.status === 'pending' && stageIcons[stage.id]}
                    </div>

                    {/* Stage text */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold truncate ${
                          stage.status === 'done'
                            ? 'text-emerald-700'
                            : stage.status === 'active'
                            ? 'text-indigo-700'
                            : stage.status === 'error'
                            ? 'text-red-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {stage.label}
                      </p>
                      {stage.status === 'active' && (
                        <p className="text-[10px] text-slate-500 truncate">{stage.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Source type badge */}
            {learningContextResponse && (
              <div className="flex items-center space-x-2 pt-1 border-t border-indigo-100">
                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  learningContextResponse.source_type === 'uploaded_material'
                    ? 'bg-blue-50 border-blue-100 text-blue-700'
                    : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}>
                  {learningContextResponse.source_type === 'uploaded_material'
                    ? <><Database className="w-3 h-3" /><span>Document-grounded</span></>
                    : <><Brain className="w-3 h-3" /><span>Topic knowledge</span></>}
                </span>
                {learningContextResponse.core_concepts_count > 0 && (
                  <span className="text-[11px] text-slate-500">
                    {learningContextResponse.core_concepts_count} concepts identified
                  </span>
                )}
              </div>
            )}

            {/* Error state */}
            {understandingError && (
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-red-700">Something went wrong</p>
                  <p className="text-[11px] text-red-600 mt-0.5">{understandingError}</p>
                  {documentId && (
                    <button
                      type="button"
                      onClick={() => { setDocumentId(undefined); setSelectedFile(null); setUploadError(null); }}
                      className="mt-1.5 text-[11px] text-red-600 underline font-medium cursor-pointer"
                    >
                      Remove document and try again with topic only
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div className="flex items-start space-x-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mt-3">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-700 font-medium">{uploadError}</p>
              <p className="text-[11px] text-amber-600 mt-0.5">You can continue without the document.</p>
            </div>
          </div>
        )}
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
                {currentPlan.title}
              </h2>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center space-x-2.5 self-start sm:self-auto">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                title="Download Markdown File"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                title="Copy formatted Markdown curriculum"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{profile.education_level || currentPlan.difficulty}</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
              <Target className="w-3.5 h-3.5" />
              <span>{profile.learning_goal}</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              <span>{profile.teaching_style} Style</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentPlan.estimated_minutes} minutes</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold">
              <BarChart2 className="w-3.5 h-3.5" />
              <span>{profile.desired_depth}</span>
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
                  <span>{profile.education_level} | {profile.learning_goal}</span>
                </div>
                <div className="pt-2">
                  <span className="font-semibold text-slate-800">Format: </span>
                  <span>{profile.teaching_style} Style</span>
                </div>
                <div className="pt-2">
                  <span className="font-semibold text-slate-800">Total Time: </span>
                  <span>{currentPlan.estimated_minutes} minutes</span>
                </div>
                <div className="pt-2">
                  <span className="font-semibold text-slate-800">Depth: </span>
                  <span>{profile.desired_depth}</span>
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
                {currentPlan.overview || "This structured curriculum uses intuitive physical analogies and quantitative derivation to build a deep, lasting understanding of Ohm's Law and its real-world applications."}
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
                    <span className="font-bold text-slate-800 text-sm">{currentPlan.estimated_minutes} mins</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase font-bold">Sections</span>
                    <span className="font-bold text-slate-800 text-sm">{currentPlan.sections?.length || 3}</span>
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

          {/* Right Column (8 cols): Curriculum Section Cards or Markdown View */}
          <div className="lg:col-span-8 space-y-4">
            {activeCurriculumView === 'markdown' ? (
              /* Markdown Output View */
              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md p-6 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto relative space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 font-sans">
                  <span className="text-xs font-bold text-indigo-400">Standard Markdown Schema Output</span>
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy Markdown"}</span>
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-slate-300 text-[11px] leading-relaxed">
                  {currentPlan.markdown_curriculum || defaultPlan.markdown_curriculum}
                </pre>
              </div>
            ) : (
              /* Visual Interactive Curriculum Cards */
              <>
                {currentPlan.sections?.map((sec, idx) => {
                  const num = (idx + 1).toString().padStart(2, '0');
                  const icons = [
                    <Zap key="1" className="w-4 h-4 fill-current" />,
                    <Calculator key="2" className="w-4 h-4" />,
                    <Cpu key="3" className="w-4 h-4" />
                  ];
                  const colors = [
                    { badge: 'bg-indigo-600', iconBg: 'bg-indigo-50 text-indigo-600', hover: 'hover:border-indigo-200' },
                    { badge: 'bg-blue-600', iconBg: 'bg-blue-50 text-blue-600', hover: 'hover:border-blue-200' },
                    { badge: 'bg-emerald-600', iconBg: 'bg-emerald-50 text-emerald-600', hover: 'hover:border-emerald-200' }
                  ];
                  const style = colors[idx % colors.length];

                  return (
                    <div
                      key={sec.id || idx}
                      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5 ${style.hover} transition-all`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`w-7 h-7 rounded-md ${style.badge} text-white font-bold text-xs flex items-center justify-center`}>
                            {num}
                          </span>
                          <div className={`w-8 h-8 rounded-full ${style.iconBg} flex items-center justify-center`}>
                            {icons[idx % icons.length]}
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                            {sec.title}
                          </h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
                            ⏱ {sec.duration || 10} min
                          </span>
                        </div>
                      </div>

                      {/* Tag Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50/80 border border-amber-100 text-slate-700">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-semibold text-slate-900">Key Concepts</span>
                          <span className="text-slate-500">{sec.concepts?.length || 3} Topics</span>
                        </div>

                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-100 text-slate-700">
                          <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-semibold text-slate-900">Guided Exercise</span>
                          <span className="text-slate-500">{sec.guided_exercise || sec.examples?.[0] || 'Interactive Simulation'}</span>
                        </div>

                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-50/80 border border-purple-100 text-slate-700">
                          <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-semibold text-slate-900">Knowledge Check</span>
                          <span className="text-slate-500">{sec.knowledge_check?.length || 2} Questions</span>
                        </div>

                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-50/80 border border-cyan-100 text-slate-700">
                          <LinkIcon className="w-3.5 h-3.5 text-cyan-500" />
                          <span className="font-semibold text-slate-900">Real-world Connection</span>
                          <span className="text-slate-500">{sec.real_world_connection || 'Applied Engineering'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Next Steps & Practice Roadmap Card */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-2">
                  <div className="flex items-center space-x-2 text-indigo-700 font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                    <span>Next Steps & Practice Roadmap</span>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-800">Immediate Action: </span>
                      <span>{currentPlan.immediate_action || "Solve 5 Ohm's Law problems from real circuits."}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">Further Exploration: </span>
                      <span>
                        {currentPlan.further_exploration?.map(f => `• ${f}`).join(' ') || "• Kirchhoff's Laws • Series & Parallel Circuits • Power & Energy"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Launch Interactive AI Classroom Button */}
                <div className="pt-2">
                  <button
                    onClick={handleStartClassroom}
                    className="w-full py-4 rounded-xl primary-button font-bold text-sm sm:text-base flex items-center justify-center space-x-3 shadow-lg cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Start Interactive AI Video Classroom</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
