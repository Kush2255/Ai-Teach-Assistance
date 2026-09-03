import type { LearnerProfile, LessonPlan, AnswerEvaluation, AssessmentReport } from '../types';

const API_BASE = 'http://localhost:8000/api';

export async function uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to upload document');
  }

  return response.json();
}

export async function createLessonPlan(topic: string, profile: LearnerProfile, documentId?: string): Promise<LessonPlan> {
  const response = await fetch(`${API_BASE}/lessons/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      document_id: documentId,
      profile,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate lesson plan');
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
