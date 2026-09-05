import { API_BASE as ROOT_API_BASE } from './api';
const API_BASE = `${ROOT_API_BASE}/classroom`;

export interface VideoScene {
  scene_id: string;
  scene_type: string;
  duration: number;
  teacher_narration: string;
  visual_type: string;
  visual_prompt?: string;
  on_screen_text?: string;
  visual_data?: any;
  transition?: string;
}

export interface VideoStatusData {
  video_id: string;
  lesson_id: string;
  section_id?: string;
  topic: string;
  language: string;
  status: 'processing' | 'completed' | 'failed';
  progress_step?: string;
  progress_percentage: number;
  video_url?: string;
  duration: number;
  teacher_profile: {
    teacher_id: string;
    name: string;
    gender: string;
    appearance: string;
    voice: string;
    language: string;
    personality: string;
  };
  scenes: VideoScene[];
  timed_captions: Array<{
    start: number;
    end: number;
    text: string;
    on_screen_text?: string;
    scene_id?: string;
    visual_type?: string;
  }>;
  error_message?: string;
  created_at?: string;
}

export interface VideoGenerateParams {
  lesson_id: string;
  section_id?: string;
  topic: string;
  language?: string;
  teaching_style?: string;
  education_level?: string;
  learning_goal?: string;
  desired_depth?: string;
}

export async function requestTeachingVideo(params: VideoGenerateParams): Promise<{ video_id: string; status: string; progress_step: string; progress_percentage: number }> {
  const res = await fetch(`${API_BASE}/video/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(`Video generation request failed: ${res.statusText}`);
  }
  return res.json();
}

export async function pollTeachingVideoStatus(videoId: string): Promise<VideoStatusData> {
  const res = await fetch(`${API_BASE}/video/${videoId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch video status: ${res.statusText}`);
  }
  return res.json();
}
