"""
Video Assembler — Combines slide PNG images + TTS MP3 audio into MP4.

Pipeline:
  1. For each scene: load PNG slide + load MP3 audio
  2. Assemble into video parts with synchronized audio
  3. Concatenate all scene clips into a single high quality MP4
  4. Save to data/video/<job_id>.mp4

Uses imageio-ffmpeg / direct ffmpeg for fast, robust encoding with full audio sync.
"""

import os
import logging
import subprocess
import tempfile
from typing import List, Tuple, Optional

logger = logging.getLogger(__name__)

# Try getting ffmpeg executable from imageio_ffmpeg
FFMPEG_EXE: Optional[str] = None
try:
    import imageio_ffmpeg
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
    logger.info(f"[Assembler] Using FFmpeg at {FFMPEG_EXE}")
except Exception as e:
    logger.warning(f"[Assembler] imageio_ffmpeg not available: {e}")

# Try MoviePy as fallback
MOVIEPY_AVAILABLE = False
try:
    try:
        from moviepy import ImageClip, AudioFileClip, concatenate_videoclips
        MOVIEPY_AVAILABLE = True
    except ImportError:
        from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips
        MOVIEPY_AVAILABLE = True
except Exception:
    MOVIEPY_AVAILABLE = False


def assemble_video(
    slide_audio_pairs: List[Tuple[str, Optional[str], float]],
    output_path: str,
    fps: int = 24,
) -> bool:
    """
    Assemble a list of (slide_png_path, audio_mp3_path_or_None, duration_seconds) into an MP4.

    Args:
        slide_audio_pairs: List of (slide_path, audio_path, duration). audio_path can be None.
        output_path: Destination MP4 file path.
        fps: Frames per second for the output video.

    Returns:
        True if MP4 was created successfully, False otherwise.
    """
    if FFMPEG_EXE and os.path.exists(FFMPEG_EXE):
        success = _assemble_with_ffmpeg(slide_audio_pairs, output_path, fps)
        if success:
            return True
        logger.warning("[Assembler] FFmpeg assembly returned False, trying MoviePy fallback...")

    if MOVIEPY_AVAILABLE:
        return _assemble_with_moviepy(slide_audio_pairs, output_path, fps)

    logger.error("[Assembler] No video assembly engine available.")
    return False


def _assemble_with_ffmpeg(
    slide_audio_pairs: List[Tuple[str, Optional[str], float]],
    output_path: str,
    fps: int,
) -> bool:
    """
    Direct FFmpeg assembly:
    Creates an MP4 segment for each slide+audio pair, then concatenates them.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    temp_dir = tempfile.mkdtemp(prefix="video_assemble_")

    try:
        segment_files = []
        for idx, (slide_path, audio_path, duration) in enumerate(slide_audio_pairs):
            if not os.path.exists(slide_path):
                logger.warning(f"[Assembler] Slide missing: {slide_path}, skipping")
                continue

            seg_out = os.path.join(temp_dir, f"seg_{idx:03d}.mp4")
            duration = max(2.5, min(float(duration), 120.0))

            # If valid audio file exists and is not empty
            has_audio = audio_path and os.path.exists(audio_path) and os.path.getsize(audio_path) > 100

            if has_audio:
                cmd = [
                    FFMPEG_EXE,
                    "-y",
                    "-loop", "1",
                    "-i", slide_path,
                    "-i", audio_path,
                    "-c:v", "libx264",
                    "-tune", "stillimage",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-pix_fmt", "yuv420p",
                    "-r", str(fps),
                    "-shortest",
                    seg_out
                ]
            else:
                # Generate silent audio track
                cmd = [
                    FFMPEG_EXE,
                    "-y",
                    "-loop", "1",
                    "-i", slide_path,
                    "-f", "lavfi",
                    "-i", "anullsrc=r=44100:cl=stereo",
                    "-c:v", "libx264",
                    "-tune", "stillimage",
                    "-c:a", "aac",
                    "-b:a", "192k",
                    "-pix_fmt", "yuv420p",
                    "-r", str(fps),
                    "-t", str(duration),
                    seg_out
                ]

            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if res.returncode == 0 and os.path.exists(seg_out):
                segment_files.append(seg_out)
            else:
                logger.warning(f"[Assembler] Segment {idx} failed: {res.stderr[:200]}")

        if not segment_files:
            logger.error("[Assembler] No valid segments created")
            return False

        if len(segment_files) == 1:
            # Only one segment, copy directly
            import shutil
            shutil.copyfile(segment_files[0], output_path)
            logger.info(f"[Assembler] ✅ Single segment copied to {output_path}")
            return True

        # Concatenate multiple segments via concat demuxer
        concat_txt = os.path.join(temp_dir, "concat.txt")
        with open(concat_txt, "w", encoding="utf-8") as f:
            for seg in segment_files:
                # FFmpeg concat file format requires escaped forward slashes or safe paths
                safe_path = seg.replace("\\", "/")
                f.write(f"file '{safe_path}'\n")

        concat_cmd = [
            FFMPEG_EXE,
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_txt,
            "-c", "copy",
            output_path
        ]

        res = subprocess.run(concat_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0 and os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            logger.info(f"[Assembler] ✅ FFmpeg MP4 successfully created: {output_path} ({os.path.getsize(output_path)} bytes)")
            return True
        else:
            # Try re-encoding concat as fallback
            logger.warning(f"[Assembler] Concat copy failed ({res.stderr[:200]}), trying re-encoding...")
            reencode_cmd = [
                FFMPEG_EXE,
                "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_txt,
                "-c:v", "libx264",
                "-c:a", "aac",
                "-pix_fmt", "yuv420p",
                output_path
            ]
            res2 = subprocess.run(reencode_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if res2.returncode == 0 and os.path.exists(output_path):
                logger.info(f"[Assembler] ✅ FFmpeg Re-encode MP4 created: {output_path}")
                return True
            logger.error(f"[Assembler] Concat re-encode failed: {res2.stderr[:300]}")
            return False

    except Exception as e:
        logger.error(f"[Assembler] FFmpeg assembly exception: {e}", exc_info=True)
        return False
    finally:
        # Cleanup temp directory
        try:
            import shutil
            shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception:
            pass


def _assemble_with_moviepy(
    slide_audio_pairs: List[Tuple[str, Optional[str], float]],
    output_path: str,
    fps: int,
) -> bool:
    """MoviePy-based video assembly fallback."""
    try:
        clips = []
        for slide_path, audio_path, duration in slide_audio_pairs:
            if not os.path.exists(slide_path):
                continue

            if audio_path and os.path.exists(audio_path):
                try:
                    audio_clip = AudioFileClip(audio_path)
                    clip_duration = audio_clip.duration
                except Exception:
                    audio_clip = None
                    clip_duration = duration
            else:
                audio_clip = None
                clip_duration = duration

            clip_duration = max(2.5, min(clip_duration, 120.0))
            img_clip = ImageClip(slide_path).with_duration(clip_duration) if hasattr(ImageClip, 'with_duration') else ImageClip(slide_path).set_duration(clip_duration)

            if audio_clip:
                if hasattr(img_clip, 'with_audio'):
                    img_clip = img_clip.with_audio(audio_clip)
                else:
                    img_clip = img_clip.set_audio(audio_clip)

            clips.append(img_clip)

        if not clips:
            return False

        final = concatenate_videoclips(clips, method="compose")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        final.write_videofile(
            output_path,
            fps=fps,
            codec="libx264",
            audio_codec="aac",
            temp_audiofile=output_path + ".temp_audio.m4a",
            remove_temp=True,
            logger=None,
        )

        for c in clips:
            try:
                c.close()
            except Exception:
                pass
        try:
            final.close()
        except Exception:
            pass

        return True

    except Exception as e:
        logger.error(f"[Assembler] MoviePy assembly failed: {e}", exc_info=True)
        return False


def get_output_path(video_dir: str, job_id: str) -> str:
    """Returns the expected MP4 output path for a given job."""
    return os.path.join(video_dir, f"lesson_{job_id}.mp4")

