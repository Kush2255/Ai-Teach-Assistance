/**
 * useVideoGeneration — React hook for the full MP4 video generation lifecycle.
 *
 * Usage:
 *   const { isGenerating, progress, progressStep, videoUrl, downloadUrl, error, generateVideo, reset } = useVideoGeneration();
 *   generateVideo({ lessonId, topic, language });
 */

import { useState, useRef, useCallback } from 'react';
import { BACKEND_URL, API_BASE as ROOT_API_BASE } from './api';

const API_BASE = `${ROOT_API_BASE}/video`;

export interface VideoGenerationParams {
  lessonId: string;
  topic: string;
  language?: string;
  teachingStyle?: string;
  educationLevel?: string;
  desiredDepth?: string;
  sections?: any[];
}

export interface VideoGenerationState {
  isGenerating: boolean;
  isComplete: boolean;
  progress: number;         // 0–100
  progressStep: string;
  videoUrl: string | null;  // Static URL for video element src
  downloadUrl: string | null; // URL for download button
  durationSeconds: number | null;
  sceneCount: number | null;
  hasAudio: boolean;
  error: string | null;
  jobId: string | null;
}

const INITIAL_STATE: VideoGenerationState = {
  isGenerating: false,
  isComplete: false,
  progress: 0,
  progressStep: '',
  videoUrl: null,
  downloadUrl: null,
  durationSeconds: null,
  sceneCount: null,
  hasAudio: false,
  error: null,
  jobId: null,
};

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 200; // ~5 minutes max

export function useVideoGeneration() {
  const [state, setState] = useState<VideoGenerationState>(INITIAL_STATE);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const attemptsRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setState(INITIAL_STATE);
    attemptsRef.current = 0;
  }, [stopPolling]);

  const generateVideo = useCallback(async (params: VideoGenerationParams) => {
    stopPolling();
    attemptsRef.current = 0;

    setState({
      ...INITIAL_STATE,
      isGenerating: true,
      progress: 5,
      progressStep: '🚀 Starting video pipeline...',
    });

    try {
      // POST to start generation
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lesson_id: params.lessonId,
          topic: params.topic,
          language: params.language || 'English',
          teaching_style: params.teachingStyle || 'Visual',
          education_level: params.educationLevel || 'Intermediate',
          desired_depth: params.desiredDepth || 'Comprehensive',
          sections: params.sections || null,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error ${res.status}: ${res.statusText}`);
      }

      const job = await res.json();
      const jobId: string = job.job_id;

      setState(prev => ({
        ...prev,
        jobId,
        progress: job.progress_pct || 5,
        progressStep: job.progress_step || '🎬 Starting...',
      }));

      // Begin polling
      pollRef.current = setInterval(async () => {
        attemptsRef.current++;

        if (attemptsRef.current > MAX_POLL_ATTEMPTS) {
          stopPolling();
          setState(prev => ({
            ...prev,
            isGenerating: false,
            error: 'Video generation timed out. Please try again.',
          }));
          return;
        }

        try {
          const statusRes = await fetch(`${API_BASE}/status/${jobId}`);
          if (!statusRes.ok) return;

          const status = await statusRes.json();

          if (status.status === 'completed') {
            stopPolling();
            setState(prev => ({
              ...prev,
              isGenerating: false,
              isComplete: true,
              progress: 100,
              progressStep: '✅ Video ready!',
              videoUrl: status.video_url ? `${BACKEND_URL}${status.video_url}` : null,
              downloadUrl: status.download_url ? `${BACKEND_URL}${status.download_url}` : null,
              durationSeconds: status.duration_seconds,
              sceneCount: status.scene_count,
              hasAudio: status.has_audio || false,
            }));
          } else if (status.status === 'failed' || status.status === 'cancelled') {
            stopPolling();
            setState(prev => ({
              ...prev,
              isGenerating: false,
              progress: 100,
              progressStep: '❌ Generation failed',
              error: status.error || 'Video generation failed. Check server logs.',
            }));
          } else {
            // Still processing
            setState(prev => ({
              ...prev,
              progress: status.progress_pct || prev.progress,
              progressStep: status.progress_step || prev.progressStep,
              sceneCount: status.scene_count || prev.sceneCount,
            }));
          }
        } catch (pollErr) {
          // Network hiccup — keep polling
          console.warn('[useVideoGeneration] Poll error (will retry):', pollErr);
        }
      }, POLL_INTERVAL_MS);

    } catch (err: any) {
      stopPolling();
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err.message || 'Failed to start video generation.',
      }));
    }
  }, [stopPolling]);

  return { ...state, generateVideo, reset };
}
