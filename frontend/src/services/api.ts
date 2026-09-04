import type { LearnerProfile, LessonPlan, AnswerEvaluation, AssessmentReport, LearningContextApiResponse } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Failed to upload document');
  }

  return response.json();
}

/**
 * Workflow 2: AI Understanding Layer.
 *
 * Sends learner profile + optional document_id to the backend understanding engine.
 * Returns a structured LearningContext that captures the AI's understanding of
 * the learner, topic, and any uploaded educational material.
 */
export async function understandLearnerContext(
  topic: string,
  profile: LearnerProfile,
  documentId?: string,
): Promise<LearningContextApiResponse> {
  const response = await fetch(`${API_BASE}/lessons/understand`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      education_level: profile.education_level,
      learning_goal: profile.learning_goal,
      preferred_language: profile.preferred_language,
      teaching_style: profile.teaching_style,
      available_time: profile.available_time,
      desired_depth: profile.desired_depth,
      current_knowledge: profile.current_knowledge,
      document_id: documentId,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Understanding failed' }));
    throw new Error(err.detail || 'AI understanding failed. Please try again.');
  }

  return response.json();
}

export async function createLessonPlan(
  topic: string,
  profile: LearnerProfile,
  documentId?: string,
  sessionId?: string,
  learningContext?: any
): Promise<LessonPlan> {
  const response = await fetch(`${API_BASE}/lessons/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      document_id: documentId,
      session_id: sessionId,
      profile,
      learning_context: learningContext,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Failed to generate lesson plan' }));
    throw new Error(err.detail || 'Failed to generate lesson plan');
  }

  return response.json();
}

export async function startLesson(lessonId: string) {
  const response = await fetch(`${API_BASE}/lessons/${lessonId}/start`, {
    method: 'POST',
  });
  return response.json();
}

export async function submitAnswer(lessonId: string, sectionId: string, studentAnswer: string): Promise<AnswerEvaluation> {
  const response = await fetch(`${API_BASE}/lessons/${lessonId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      section_id: sectionId,
      student_answer: studentAnswer,
    }),
  });

  return response.json();
}

export async function switchLanguage(lessonId: string, newLanguage: string) {
  const response = await fetch(`${API_BASE}/lessons/${lessonId}/switch-language`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_language: newLanguage }),
  });
  return response.json();
}

export async function fetchAssessmentReport(lessonId: string): Promise<AssessmentReport> {
  const response = await fetch(`${API_BASE}/lessons/${lessonId}/report`);
  return response.json();
}

export async function startDemoScenario() {
  const response = await fetch(`${API_BASE}/demo/start`, { method: 'POST' });
  return response.json();
}

export async function fetchDashboardProgress() {
  const response = await fetch(`${API_BASE}/student/progress`);
  return response.json();
}

export async function fetchLearningPath() {
  const response = await fetch(`${API_BASE}/student/learning-path`);
  return response.json();
}
