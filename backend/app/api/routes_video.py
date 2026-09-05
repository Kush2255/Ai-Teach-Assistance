"""
Video Generation API Routes

POST /api/video/generate    — Start a full lesson MP4 generation job
GET  /api/video/status/{job_id}  — Poll job status and progress
GET  /api/video/download/{job_id} — Stream/download the generated MP4
GET  /api/video/jobs        — List all video generation jobs (debug)
DELETE /api/video/{job_id}  — Cancel / delete a job
"""

import os
import uuid
import logging
import asyncio
from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from app.config import settings
from app.video.video_provider import video_provider
from app.video.voice_provider import voice_provider
from app.video.slide_renderer import render_all_slides, PILLOW_AVAILABLE
from app.video.assembler import assemble_video, get_output_path

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/video", tags=["Video Generation"])

# ─── In-memory job store ────────────────────────────────────────────────────
# { job_id: { status, progress_pct, progress_step, video_url, error, ... } }
VIDEO_JOBS: Dict[str, Dict[str, Any]] = {}

# ─── Request / Response schemas ─────────────────────────────────────────────

class VideoGenerateRequest(BaseModel):
    lesson_id: str
    topic: str
    language: str = "English"
    teaching_style: str = "Visual"
    education_level: str = "Intermediate"
    desired_depth: str = "Comprehensive"
    sections: Optional[list] = None   # Pre-fetched section data (optional)


class VideoJobStatus(BaseModel):
    job_id: str
    status: str           # processing | completed | failed | cancelled
    progress_pct: int
    progress_step: str
    video_url: Optional[str] = None
    download_url: Optional[str] = None
    duration_seconds: Optional[float] = None
    scene_count: Optional[int] = None
    error: Optional[str] = None
    has_audio: bool = False


# ─── Helper ─────────────────────────────────────────────────────────────────

def _video_dir() -> str:
    d = os.path.join(settings.DATA_DIR, "video")
    os.makedirs(d, exist_ok=True)
    return d


def _update_job(job_id: str, **kwargs):
    if job_id in VIDEO_JOBS:
        VIDEO_JOBS[job_id].update(kwargs)


# ─── Background pipeline ─────────────────────────────────────────────────────

async def _run_generation_pipeline(
    job_id: str,
    lesson_id: str,
    topic: str,
    language: str,
    teaching_style: str,
    education_level: str,
    desired_depth: str,
    sections: Optional[list],
):
    """Full async pipeline: scenes → slides → audio → MP4."""
    try:
        video_dir = _video_dir()
        job_dir = os.path.join(video_dir, job_id)
        os.makedirs(job_dir, exist_ok=True)

        # ── Step 1: Generate scene data ──────────────────────────────────────
        _update_job(job_id, progress_step="🎬 Planning lesson scenes...", progress_pct=10)
        await asyncio.sleep(0.1)

        # Build lesson_data and section_data for video_provider
        lesson_data = {
            "id": lesson_id,
            "title": topic,
            "language": language,
            "teaching_style": teaching_style,
            "difficulty": education_level,
        }
        learner_profile = {
            "preferred_language": language,
            "teaching_style": teaching_style,
            "education_level": education_level,
            "desired_depth": desired_depth,
        }

        # Use pre-fetched sections or let video_provider generate scenes
        if sections and len(sections) > 0:
            # Flatten sections into scenes
            all_scenes = []
            for sec in sections:
                all_scenes.append({
                    "scene_id": f"scene_{len(all_scenes):02d}",
                    "scene_type": "TEACHER_EXPLANATION",
                    "duration": 12,
                    "teacher_narration": sec.get("explanation", ""),
                    "visual_type": "diagram",
                    "on_screen_text": sec.get("title", topic),
                    "visual_data": {
                        "concepts": sec.get("concepts", []),
                        "formula": "",
                    },
                    "transition": "smooth",
                })
            scenes = all_scenes
        else:
            # Use video_provider for dynamic LLM-generated scenes
            video_record = await video_provider.generate_teaching_video(
                topic=topic,
                lesson_data=lesson_data,
                section_data=None,
                learner_profile=learner_profile,
            )

            # Wait for video_provider pipeline to finish (it runs its own async task)
            max_wait = 30  # seconds
            waited = 0
            while waited < max_wait:
                await asyncio.sleep(1)
                waited += 1
                rec = video_record  # same dict reference
                if rec.get("status") == "completed":
                    break

            scenes = video_record.get("scenes", [])

            if not scenes:
                raise ValueError("Scene generation produced no scenes.")

        _update_job(job_id, scene_count=len(scenes), progress_step=f"🖼️ Rendering {len(scenes)} slides...", progress_pct=30)
        await asyncio.sleep(0.1)

        # ── Step 2: Render slides ─────────────────────────────────────────────
        teacher_name = "Dr. Sarah Adams"

        if PILLOW_AVAILABLE:
            slide_pairs_raw = render_all_slides(
                scenes=scenes,
                topic=topic,
                output_dir=job_dir,
                teacher_name=teacher_name,
            )
        else:
            logger.warning("[VideoRoute] Pillow not available, using placeholder slides")
            slide_pairs_raw = [(None, s.get("duration", 10)) for s in scenes]

        _update_job(job_id, progress_step=f"🎙️ Generating voiceover audio...", progress_pct=55)
        await asyncio.sleep(0.1)

        # ── Step 3: Generate TTS audio per scene ─────────────────────────────
        slide_audio_pairs = []  # (slide_path, audio_path | None, duration)
        for idx, (slide_path, duration) in enumerate(slide_pairs_raw):
            scene = scenes[idx] if idx < len(scenes) else {}
            narration = scene.get("teacher_narration", "")

            audio_path = None
            if narration.strip():
                try:
                    audio_url = voice_provider.generate_speech_audio(narration, language)
                    # audio_url is like "/static/audio/voice_abc123.mp3" — get real path
                    audio_filename = audio_url.split("/static/audio/")[-1]
                    audio_path = os.path.join(settings.DATA_DIR, "audio", audio_filename)
                    if not os.path.exists(audio_path):
                        audio_path = None
                except Exception as ae:
                    logger.warning(f"[VideoRoute] Audio gen failed for scene {idx}: {ae}")

            slide_audio_pairs.append((slide_path, audio_path, duration))

        _update_job(job_id, progress_step="🎞️ Assembling final MP4...", progress_pct=75,
                    has_audio=any(p[1] for p in slide_audio_pairs))
        await asyncio.sleep(0.1)

        # ── Step 4: Assemble video ─────────────────────────────────────────────
        output_mp4 = get_output_path(video_dir, job_id)

        # Filter to valid slide paths
        valid_pairs = [(sp, ap, dur) for sp, ap, dur in slide_audio_pairs if sp and os.path.exists(sp)]

        if not valid_pairs:
            raise ValueError("No valid slide images were rendered.")

        loop = asyncio.get_event_loop()
        success = await loop.run_in_executor(
            None,
            assemble_video,
            valid_pairs,
            output_mp4,
            24,
        )

        if not success:
            raise RuntimeError("Video assembly returned failure.")

        # Calculate total duration
        total_dur = sum(dur for _, _, dur in valid_pairs)

        # ── Step 5: Complete ──────────────────────────────────────────────────
        _update_job(
            job_id,
            status="completed",
            progress_pct=100,
            progress_step="✅ Video ready!",
            video_url=f"/static/video/{os.path.basename(output_mp4)}",
            download_url=f"/api/video/download/{job_id}",
            duration_seconds=total_dur,
        )
        logger.info(f"[VideoRoute] ✅ Job {job_id} complete → {output_mp4}")

    except Exception as e:
        logger.error(f"[VideoRoute] ❌ Job {job_id} failed: {e}", exc_info=True)
        _update_job(
            job_id,
            status="failed",
            progress_pct=100,
            progress_step="❌ Generation failed",
            error=str(e),
        )


# ─── Routes ─────────────────────────────────────────────────────────────────

@router.post("/generate", response_model=VideoJobStatus, summary="Start lesson video generation")
async def generate_video(req: VideoGenerateRequest, background_tasks: BackgroundTasks):
    """
    Starts an async MP4 generation job for a lesson.
    Returns immediately with a job_id to poll.
    """
    job_id = uuid.uuid4().hex[:12]

    VIDEO_JOBS[job_id] = {
        "job_id": job_id,
        "lesson_id": req.lesson_id,
        "topic": req.topic,
        "status": "processing",
        "progress_pct": 5,
        "progress_step": "🚀 Starting video pipeline...",
        "video_url": None,
        "download_url": None,
        "duration_seconds": None,
        "scene_count": None,
        "error": None,
        "has_audio": False,
    }

    background_tasks.add_task(
        _run_generation_pipeline,
        job_id=job_id,
        lesson_id=req.lesson_id,
        topic=req.topic,
        language=req.language,
        teaching_style=req.teaching_style,
        education_level=req.education_level,
        desired_depth=req.desired_depth,
        sections=req.sections,
    )

    logger.info(f"[VideoRoute] Job {job_id} queued for topic='{req.topic}'")
    return VideoJobStatus(**VIDEO_JOBS[job_id])


@router.get("/status/{job_id}", response_model=VideoJobStatus, summary="Poll video generation status")
async def get_video_status(job_id: str):
    """Poll the status of a video generation job."""
    job = VIDEO_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    return VideoJobStatus(**job)


@router.get("/download/{job_id}", summary="Download generated MP4")
async def download_video(job_id: str):
    """Stream the generated MP4 file for download/playback."""
    job = VIDEO_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    if job["status"] != "completed":
        raise HTTPException(status_code=409, detail="Video generation not yet complete.")

    video_path = get_output_path(_video_dir(), job_id)
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail="Video file not found on server.")

    return FileResponse(
        path=video_path,
        media_type="video/mp4",
        filename=f"lesson_{job.get('topic', job_id)[:30].replace(' ', '_')}.mp4",
    )


@router.get("/jobs", summary="List all video generation jobs")
async def list_jobs():
    """Returns all active/completed video jobs (debug endpoint)."""
    return {
        "total": len(VIDEO_JOBS),
        "jobs": list(VIDEO_JOBS.values()),
    }


@router.delete("/{job_id}", summary="Cancel or remove a video generation job")
async def cancel_job(job_id: str):
    """Cancels a running job or removes a completed job record."""
    job = VIDEO_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job '{job_id}' not found.")
    if job["status"] == "processing":
        VIDEO_JOBS[job_id]["status"] = "cancelled"
        VIDEO_JOBS[job_id]["progress_step"] = "Cancelled by user"
    else:
        VIDEO_JOBS.pop(job_id, None)
    return {"success": True, "job_id": job_id}
