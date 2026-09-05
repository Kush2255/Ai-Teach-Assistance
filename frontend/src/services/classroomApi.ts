/**
 * Frontend API client for Workflow 4: Interactive AI Classroom
 */

import { API_BASE as ROOT_API_BASE } from './api';
const API_BASE = `${ROOT_API_BASE}/classroom`;

export interface TeachingSegment {
  segment_id: string;
  segment_type: string;
  title: string;
  narration: string;
  visual_type: string;
  visual_title?: string;
  visual_description?: string;
  visual_data?: any;
  emphasis: string[];
  duration_seconds: number;
}

export interface SectionSummary {
  index: number;
  id: string;
  title: string;
  duration: number;
  status: 'completed' | 'active' | 'upcoming';
  visual_type: string;
  total_segments: number;
}

export interface ClassroomSessionState {
  session_id: string;
  lesson_id: string;
  topic: string;
  title: string;
  current_section_index: number;
  current_segment_index: number;
  total_sections: number;
  total_segments_in_section: number;
  status: string;
  language: string;
  teaching_style: string;
  teacher_info: {
    name?: string;
    role?: string;
    avatar_type?: string;
    provider?: string;
  };
  current_section: any;
  current_segment?: TeachingSegment;
  visual?: {
    type: string;
    title?: string;
    description?: string;
    data: any;
    emphasis?: string[];
  };
  transcript: Array<{
    segment_id: string;
    title: string;
    text: string;
    type: string;
  }>;
  progress_percentage: number;
  sections_summary: SectionSummary[];
  handoff_state?: any;
}

export interface ClassroomSegmentResponse {
  session_id: string;
  section_index: number;
  segment_index: number;
  total_segments_in_section: number;
  segment: TeachingSegment;
  visual: {
    type: string;
    title?: string;
    description?: string;
    data: any;
    emphasis?: string[];
  };
  video_stream: {
    provider: string;
    video_url?: string;
    stream_url?: string;
    voice_url?: string;
    duration_seconds: number;
    status: string;
    avatar_persona?: any;
    timed_captions?: Array<{ start: number; end: number; text: string }>;
  };
  captions: string;
  is_section_completed: boolean;
  is_lesson_completed: boolean;
  handoff_state?: any;
}

export async function startClassroomSession(
  lessonId: string,
  sessionId?: string,
  language: string = 'English',
  teachingStyle: string = 'Visual'
): Promise<ClassroomSessionState> {
  const res = await fetch(`${API_BASE}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lesson_id: lessonId,
      session_id: sessionId,
      language,
      teaching_style: teachingStyle,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to initialize AI classroom' }));
    throw new Error(err.detail || `Classroom error HTTP ${res.status}`);
  }

  return res.json();
}

export async function getClassroomSessionState(sessionId: string): Promise<ClassroomSessionState> {
  const res = await fetch(`${API_BASE}/session/${sessionId}`);
  if (!res.ok) {
    throw new Error(`Failed to load session state for ${sessionId}`);
  }
  return res.json();
}

export async function getTeachingSegment(
  sessionId: string,
  sectionIdx: number,
  segmentIdx: number
): Promise<ClassroomSegmentResponse> {
  const res = await fetch(`${API_BASE}/session/${sessionId}/segment/${sectionIdx}/${segmentIdx}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch teaching segment`);
  }
  return res.json();
}

export async function advanceClassroomSegment(sessionId: string): Promise<ClassroomSegmentResponse> {
  const res = await fetch(`${API_BASE}/session/${sessionId}/next`, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to advance classroom segment');
  }
  return res.json();
}

export async function previousClassroomSegment(sessionId: string): Promise<ClassroomSegmentResponse> {
  const res = await fetch(`${API_BASE}/session/${sessionId}/previous`, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to step back to previous segment');
  }
  return res.json();
}

export async function jumpToClassroomSection(
  sessionId: string,
  sectionIdx: number
): Promise<ClassroomSegmentResponse> {
  const res = await fetch(`${API_BASE}/session/${sessionId}/jump/${sectionIdx}`, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to jump to section');
  }
  return res.json();
}

export async function switchClassroomLanguage(
  sessionId: string,
  newLanguage: string
): Promise<ClassroomSessionState> {
  const res = await fetch(`${API_BASE}/session/${sessionId}/switch-language`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_language: newLanguage }),
  });

  if (!res.ok) {
    throw new Error('Failed to switch classroom language');
  }
  return res.json();
}

export async function getClassroomHandoff(sessionId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/session/${sessionId}/handoff`);
  if (!res.ok) {
    throw new Error('Failed to retrieve classroom handoff state');
  }
  return res.json();
}
