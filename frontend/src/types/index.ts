export interface LearnerProfile {
  name: string;
  education_level: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  current_knowledge?: string;
  learning_goal: string;
  preferred_language: 'English' | 'Hindi' | 'Hinglish' | 'Telugu' | string;
  teaching_style: 'Simple & Friendly' | 'Visual' | 'Storytelling' | 'Technical' | 'Socratic' | 'Exam-focused' | string;
  available_time: string;
  desired_depth: 'Quick' | 'Balanced' | 'Deep' | string;
}

export interface LessonSection {
  id: string;
  title: string;
  duration: number;
  section_objective?: string;
  explanation?: string;
  concepts: string[];
  examples: string[];
  guided_exercise?: string;
  knowledge_check?: string[];
  real_world_connection?: string;
  visual_type: 'diagram' | 'equation' | 'graph' | 'code' | 'timeline' | 'concept_map' | string;
  visual_data?: any;
  question?: string;
  question_type?: 'conceptual' | 'problem_solving' | 'mcq' | string;
  question_options?: string[];
  expected_answer?: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  topic: string;
  objective: string;
  overview?: string;
  estimated_minutes: number;
  difficulty: string;
  language: string;
  teaching_style?: string;
  desired_depth?: string;
  sections: LessonSection[];
  immediate_action?: string;
  further_exploration?: string[];
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
