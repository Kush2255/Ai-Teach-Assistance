export interface LearnerProfile {
  name: string;
  education_level: 'Elementary' | 'High School' | 'Undergraduate' | 'Professional' | 'Self-Taught' | string;
  current_knowledge?: string;
  learning_goal: 'Exam preparation' | 'Practical skill acquisition' | 'Foundational understanding' | 'Mastery' | string;
  preferred_language: 'English' | 'Hindi' | 'Hinglish' | 'Telugu' | string;
  teaching_style: 'Socratic' | 'First Principles' | 'Project-Based' | 'Storytelling' | 'Direct Instruction' | 'Simple & Friendly' | 'Visual' | 'Technical' | 'Exam-focused' | string;
  available_time: string;
  desired_depth: 'High-level overview' | 'Deep dive' | 'Mastery' | 'Modular reference' | 'Quick' | 'Balanced' | 'Deep' | string;
}

export interface LessonSection {
  id: string;
  title: string;
  duration: number;
  objective?: string;
  explanation?: string;
  concepts: string[];
  guided_exercise?: string;
  knowledge_check?: string;
  examples: string[];
  visual_type: 'diagram' | 'equation' | 'graph' | 'code' | 'timeline' | 'concept_map' | 'process';
  visual_data?: any;
  question?: string;
  question_type: 'conceptual' | 'problem_solving' | 'mcq';
  question_options?: string[];
  expected_answer?: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  topic: string;
  objective?: string;
  overview?: string;
  education_level?: string;
  learning_goal?: string;
  teaching_style?: string;
  available_time?: string;
  desired_depth?: string;
  estimated_minutes: number;
  difficulty: string;
  language: string;
  sections: LessonSection[];
  next_steps?: {
    immediate_action: string;
    further_exploration: string[];
  };
  markdown_curriculum?: string;
}


export interface AnswerEvaluation {
  correct: boolean;
  confidence: number;
  detected_misconception?: string;
  severity?: string;
  feedback: string;
  recommended_strategy: string;
  next_question?: string;
  mastery_score: number;
}

export interface AssessmentReport {
  assessment_id: string;
  overall_score: number;
  concept_scores: Record<string, number>;
  weak_areas: string[];
  strong_areas: string[];
  recommended_revisions: string[];
  next_recommended_topic: string;
}

export interface LearningPathModule {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'unlocked' | 'locked';
  score: number;
  description: string;
}
