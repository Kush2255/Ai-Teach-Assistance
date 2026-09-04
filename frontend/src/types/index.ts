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
  allocated_time_minutes?: number;
  section_objective?: string;
  explanation?: string;
  concepts: string[];
  examples: string[];
  guided_exercise?: string;
  knowledge_check?: string[];
  real_world_connection?: string;
  transition?: string;
  visual_type: 'diagram' | 'equation' | 'graph' | 'code' | 'timeline' | 'concept_map' | 'circuit' | 'flowchart' | 'table' | string;
  visual_description?: string;
  visual_data?: any;
  question?: string;
  question_type?: 'conceptual' | 'problem_solving' | 'mcq' | string;
  question_options?: string[];
  expected_answer?: string;
  expected_reasoning?: string;
}

export interface LessonPlan {
  id: string;
  session_id?: string;
  title: string;
  topic: string;
  objective: string;
  overview?: string;
  estimated_minutes: number;
  total_time_minutes?: number;
  difficulty: string;
  language: string;
  teaching_style?: string;
  desired_depth?: string;
  source_type?: string;
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

// ─────────────────────────────────────────────────────────────────────────────
// WORKFLOW 2 — AI Understanding Layer Types
// ─────────────────────────────────────────────────────────────────────────────

export interface LearnerProfileNormalized {
  education_level: string;
  learning_goal: string;
  language: string;
  teaching_style: string;
  available_time_minutes: number;
  desired_depth: string;
  prior_knowledge_summary?: string;
}

export interface RetrievedChunk {
  chunk_id: string;
  text: string;
  source: string;
  page: number;
  section: string;
  relevance_score: number;
  citation: string;
}

export interface KnowledgeSource {
  type: 'uploaded_material' | 'topic';
  documents: Record<string, any>[];
  grounding_available: boolean;
}

export interface TopicUnderstanding {
  summary: string;
  core_concepts: string[];
  prerequisites: string[];
  important_relationships: string[];
  likely_learning_scope: string[];
  source_type: string;
}

export interface TeachingConstraints {
  language: string;
  style: string;
  time_minutes: number;
  depth: string;
}

export interface LearningContext {
  session_id?: string;
  topic: string;
  learner_profile: LearnerProfileNormalized;
  knowledge_source: KnowledgeSource;
  topic_understanding: TopicUnderstanding;
  retrieved_context: RetrievedChunk[];
  teaching_constraints: TeachingConstraints;
  formatted_rag_context: string;
}

export interface LearningContextApiResponse {
  success: boolean;
  session_id?: string;
  topic: string;
  learning_context: LearningContext;
  has_document_grounding: boolean;
  retrieved_chunks_count: number;
  core_concepts_count: number;
  source_type: 'uploaded_material' | 'topic';
}

/** Represents a single stage in the AI Understanding progress panel. */
export type UnderstandingStageStatus = 'pending' | 'active' | 'done' | 'error' | 'skipped';

export interface UnderstandingStage {
  id: string;
  label: string;
  description: string;
  status: UnderstandingStageStatus;
}
