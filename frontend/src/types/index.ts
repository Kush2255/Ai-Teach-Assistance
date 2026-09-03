export interface LearnerProfile {
  name: string;
  education_level: 'Beginner' | 'Intermediate' | 'Advanced';
  current_knowledge?: string;
  learning_goal: string;
  preferred_language: 'English' | 'Hindi' | 'Hinglish' | 'Telugu';
  teaching_style: 'Simple & Friendly' | 'Visual' | 'Storytelling' | 'Technical' | 'Socratic' | 'Exam-focused';
  available_time: string;
  desired_depth: 'Quick' | 'Balanced' | 'Deep';
}

export interface LessonSection {
  id: string;
  title: string;
  duration: number;
  explanation?: string;
  concepts: string[];
  examples: string[];
  visual_type: 'diagram' | 'equation' | 'graph' | 'code' | 'timeline' | 'concept_map';
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
  objective: string;
  estimated_minutes: number;
  difficulty: string;
  language: string;
  sections: LessonSection[];
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
