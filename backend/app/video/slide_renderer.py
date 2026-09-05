"""
Slide Renderer — Pillow-based PNG generator for lesson scenes.

Renders each teaching scene as a styled 1280x720 slide image:
- Dark themed background with subtle gradient
- Topic-aware accent colors
- Title, narration excerpt, key formula/on-screen text
- Bullet point concepts
- Teacher name watermark
"""

import os
import logging
import textwrap
from typing import Dict, Any, Optional, Tuple

logger = logging.getLogger(__name__)

# Try importing Pillow
try:
    from PIL import Image, ImageDraw, ImageFont
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False
    logger.warning("[SlideRenderer] Pillow not installed. Slide rendering disabled.")

# Slide dimensions (16:9 HD)
SLIDE_W = 1280
SLIDE_H = 720

# Color palette
COLORS = {
    "bg_top":       (10, 15, 35),      # Deep navy top
    "bg_bottom":    (15, 10, 40),      # Deep purple bottom
    "accent_blue":  (99, 102, 241),    # Indigo-500
    "accent_cyan":  (34, 211, 238),    # Cyan-400
    "accent_green": (52, 211, 153),    # Emerald-400
    "accent_amber": (251, 191, 36),    # Amber-400
    "accent_rose":  (251, 113, 133),   # Rose-400
    "white":        (255, 255, 255),
    "slate300":     (203, 213, 225),
    "slate400":     (148, 163, 184),
    "slate700":     (51, 65, 85),
    "formula_bg":   (20, 30, 60),
    "card_bg":      (20, 25, 50),
}

# Topic-to-accent color mapping
TOPIC_ACCENT = {
    "electricity": "accent_amber",
    "ohm":         "accent_amber",
    "circuit":     "accent_amber",
    "physics":     "accent_blue",
    "biology":     "accent_green",
    "chemistry":   "accent_cyan",
    "math":        "accent_rose",
    "calculus":    "accent_rose",
    "code":        "accent_green",
    "algorithm":   "accent_green",
}

TOPIC_EMOJI = {
    "electricity": "⚡",
    "ohm":         "⚡",
    "circuit":     "🔌",
    "physics":     "⚛️",
    "biology":     "🧬",
    "photosynthesis": "🌿",
    "chemistry":   "🧪",
    "math":        "∫",
    "calculus":    "∫",
    "code":        "💻",
    "algorithm":   "🔣",
}


def _get_topic_accent(topic: str) -> Tuple[Tuple[int,int,int], str]:
    """Returns (RGB color, emoji) for a given topic string."""
    tl = topic.lower()
    for key, color_name in TOPIC_ACCENT.items():
        if key in tl:
            return COLORS[color_name], TOPIC_EMOJI.get(key, "✨")
    return COLORS["accent_blue"], "📚"


def _load_font(size: int, bold: bool = False):
    """Attempt to load a system font, fall back to default."""
    candidates_bold = [
        "C:/Windows/Fonts/arialbd.ttf",
        "C:/Windows/Fonts/calibrib.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    candidates_regular = [
        "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/calibri.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ]
    candidates = candidates_bold if bold else candidates_regular
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    # Pillow built-in fallback
    try:
        return ImageFont.load_default(size=size)
    except Exception:
        return ImageFont.load_default()


def render_slide(
    scene: Dict[str, Any],
    topic: str,
    output_path: str,
    teacher_name: str = "Dr. Sarah Adams",
    scene_number: int = 1,
    total_scenes: int = 1,
) -> bool:
    """
    Render a single scene as a PNG slide.

    Args:
        scene: Scene dict with teacher_narration, on_screen_text, visual_type, etc.
        topic: Lesson topic string
        output_path: Absolute path to save the PNG
        teacher_name: Teacher name for watermark
        scene_number: Current scene index (1-based)
        total_scenes: Total number of scenes

    Returns:
        True if successful, False otherwise
    """
    if not PILLOW_AVAILABLE:
        return False

    try:
        img = Image.new("RGB", (SLIDE_W, SLIDE_H), COLORS["bg_top"])
        draw = ImageDraw.Draw(img)

        accent_color, topic_emoji = _get_topic_accent(topic)

        # === BACKGROUND GRADIENT (vertical bands approximation) ===
        for y in range(SLIDE_H):
            t = y / SLIDE_H
            r = int(COLORS["bg_top"][0] + t * (COLORS["bg_bottom"][0] - COLORS["bg_top"][0]))
            g = int(COLORS["bg_top"][1] + t * (COLORS["bg_bottom"][1] - COLORS["bg_top"][1]))
            b = int(COLORS["bg_top"][2] + t * (COLORS["bg_bottom"][2] - COLORS["bg_top"][2]))
            draw.line([(0, y), (SLIDE_W, y)], fill=(r, g, b))

        # === GRID LINES (subtle sci-fi effect) ===
        grid_color = (30, 40, 80)
        for x in range(0, SLIDE_W, 80):
            draw.line([(x, 0), (x, SLIDE_H)], fill=grid_color, width=1)
        for y in range(0, SLIDE_H, 60):
            draw.line([(0, y), (SLIDE_W, y)], fill=grid_color, width=1)

        # === TOP ACCENT BAR ===
        draw.rectangle([(0, 0), (SLIDE_W, 6)], fill=accent_color)

        # === SCENE COUNTER (top right) ===
        font_small = _load_font(18)
        counter_text = f"SCENE {scene_number}/{total_scenes}"
        draw.text((SLIDE_W - 160, 18), counter_text, font=font_small, fill=COLORS["slate400"])

        # === TOPIC BADGE (top left) ===
        badge_text = f" {topic_emoji}  {topic.upper()[:24]} "
        draw.rounded_rectangle([(20, 14), (len(badge_text) * 9 + 30, 42)],
                                radius=8, fill=(25, 30, 60), outline=accent_color, width=1)
        draw.text((28, 18), badge_text, font=_load_font(16), fill=accent_color)

        # === SCENE TYPE TAG ===
        scene_type = scene.get("scene_type", "EXPLANATION")
        type_colors = {
            "TEACHER_INTRO": COLORS["accent_cyan"],
            "TEACHER_EXPLANATION": COLORS["accent_blue"],
            "CONCEPT_VISUAL": COLORS["accent_green"],
            "FORMULA": COLORS["accent_amber"],
            "WORKED_EXAMPLE": COLORS["accent_amber"],
            "CODE_EXAMPLE": COLORS["accent_green"],
            "SUMMARY": COLORS["accent_rose"],
            "TIMELINE": COLORS["accent_cyan"],
        }
        tag_color = type_colors.get(scene_type, COLORS["accent_blue"])

        # === MAIN TITLE ===
        title_text = scene.get("on_screen_text") or scene.get("title") or topic
        title_text = title_text[:72]
        font_title = _load_font(46, bold=True)
        title_y = 80

        # Title shadow
        draw.text((42, title_y + 2), title_text, font=font_title, fill=(0, 0, 0))
        draw.text((40, title_y), title_text, font=font_title, fill=COLORS["white"])

        # === DIVIDER LINE ===
        draw.rectangle([(40, title_y + 60), (40 + 120, title_y + 64)], fill=accent_color)
        draw.rectangle([(40 + 124, title_y + 60), (SLIDE_W - 40, title_y + 64)], fill=COLORS["slate700"])

        # === NARRATION TEXT (excerpt) ===
        narration = scene.get("teacher_narration", "")
        # Take first 200 chars for readability
        narration_excerpt = narration[:220] + ("..." if len(narration) > 220 else "")
        font_body = _load_font(24)

        # Word wrap
        wrapped = textwrap.wrap(narration_excerpt, width=68)
        body_y = title_y + 80
        for i, line in enumerate(wrapped[:5]):  # max 5 lines
            alpha = max(0.4, 1 - i * 0.12)
            shade = int(203 * alpha)
            draw.text((40, body_y + i * 32), line, font=font_body,
                      fill=(shade, int(213 * alpha), int(225 * alpha)))

        # === CONCEPT BULLET POINTS (bottom left card) ===
        visual_data = scene.get("visual_data", {})
        concepts = []
        if isinstance(visual_data, dict):
            concepts = (visual_data.get("concepts") or
                        visual_data.get("points") or
                        visual_data.get("core_points") or [])

        if concepts:
            card_x, card_y = 40, 430
            card_w, card_h = 500, len(concepts) * 36 + 50
            draw.rounded_rectangle(
                [(card_x, card_y), (card_x + card_w, card_y + card_h)],
                radius=12, fill=COLORS["card_bg"], outline=COLORS["slate700"], width=1
            )
            draw.text((card_x + 14, card_y + 10), "KEY CONCEPTS", font=_load_font(14),
                      fill=accent_color)
            font_bullet = _load_font(20)
            for i, concept in enumerate(concepts[:4]):
                bullet_y = card_y + 36 + i * 34
                draw.ellipse([(card_x + 16, bullet_y + 6), (card_x + 24, bullet_y + 14)],
                             fill=accent_color)
                draw.text((card_x + 32, bullet_y), str(concept)[:50], font=font_bullet,
                          fill=COLORS["slate300"])

        # === FORMULA / ON-SCREEN TEXT highlight (bottom right) ===
        formula = None
        if isinstance(visual_data, dict):
            formula = (visual_data.get("latex") or
                       visual_data.get("formula") or
                       visual_data.get("on_screen_text"))
        if not formula:
            formula = scene.get("on_screen_text")

        if formula and formula != title_text:
            fx, fy = 580, 430
            fw, fh = 660, 100
            draw.rounded_rectangle(
                [(fx, fy), (fx + fw, fy + fh)],
                radius=12, fill=COLORS["formula_bg"], outline=accent_color, width=2
            )
            font_formula = _load_font(36, bold=True)
            formula_short = formula[:40]
            draw.text((fx + fw // 2 - len(formula_short) * 11, fy + 30),
                      formula_short, font=font_formula, fill=accent_color)

        # === VISUAL TYPE BADGE ===
        visual_type = scene.get("visual_type", "")
        if visual_type:
            vt_text = f"[ {visual_type.upper()} ]"
            draw.text((SLIDE_W - 180, SLIDE_H - 55), vt_text, font=_load_font(15),
                      fill=tag_color)

        # === BOTTOM TEACHER WATERMARK BAR ===
        draw.rectangle([(0, SLIDE_H - 40), (SLIDE_W, SLIDE_H)], fill=(8, 12, 28))
        draw.text((20, SLIDE_H - 28), f"AI Teacher: {teacher_name}", font=_load_font(16),
                  fill=COLORS["slate400"])
        draw.text((SLIDE_W - 300, SLIDE_H - 28), "AI Teaching Assistant  •  Live Lesson",
                  font=_load_font(16), fill=COLORS["slate700"])

        # === CORNER SCI-FI BRACKETS ===
        br_size = 22
        bw = 3
        corners = [
            (0, 0, 1, 1),           # top-left
            (SLIDE_W, 0, -1, 1),    # top-right
            (0, SLIDE_H, 1, -1),    # bottom-left
            (SLIDE_W, SLIDE_H, -1, -1),  # bottom-right
        ]
        for cx, cy, dx, dy in corners:
            draw.line([(cx, cy), (cx + dx * br_size, cy)], fill=COLORS["accent_cyan"], width=bw)
            draw.line([(cx, cy), (cx, cy + dy * br_size)], fill=COLORS["accent_cyan"], width=bw)

        # === SAVE ===
        img.save(output_path, "PNG", quality=95)
        logger.info(f"[SlideRenderer] Saved slide → {output_path}")
        return True

    except Exception as e:
        logger.error(f"[SlideRenderer] Failed to render slide: {e}", exc_info=True)
        return False


def render_all_slides(
    scenes: list,
    topic: str,
    output_dir: str,
    teacher_name: str = "Dr. Sarah Adams",
) -> list:
    """
    Render all scenes as PNG slides.

    Returns:
        List of (slide_path, duration) tuples for successfully rendered slides.
    """
    os.makedirs(output_dir, exist_ok=True)
    results = []
    total = len(scenes)
    for i, scene in enumerate(scenes):
        slide_path = os.path.join(output_dir, f"slide_{i:03d}.png")
        success = render_slide(
            scene=scene,
            topic=topic,
            output_path=slide_path,
            teacher_name=teacher_name,
            scene_number=i + 1,
            total_scenes=total,
        )
        duration = scene.get("duration", 10)
        if success:
            results.append((slide_path, duration))
        else:
            logger.warning(f"[SlideRenderer] Skipping scene {i} (render failed)")
    return results
