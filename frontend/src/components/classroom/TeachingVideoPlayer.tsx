import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  BookOpen,
  Lightbulb,
  BarChart2,
  AlignLeft,
  CheckCircle,
} from 'lucide-react';
import type { VideoStatusData, VideoScene } from '../../services/videoApi';
import { speechService } from '../../services/speech';

interface TeachingVideoPlayerProps {
  videoData: VideoStatusData;
  onSectionComplete?: () => void;
  language?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

// ─── Dynamic Canvas Visualizer per scene ─────────────────────────────────────
const SceneVisualCanvas: React.FC<{
  scene: VideoScene;
  topic: string;
  isPlaying: boolean;
}> = ({ scene, topic, isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const vtype = (scene.visual_type || 'diagram').toLowerCase();
    const vdata = scene.visual_data || {};
    const onScreenText = scene.on_screen_text || topic;

    const draw = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, W, H);

      // ── Background gradient ────────────────────────────────────────────────
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#0f172a');
      bg.addColorStop(1, '#1e293b');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── Render by visual type ──────────────────────────────────────────────
      if (vtype === 'formula' || vtype === 'equation') {
        drawFormula(ctx, W, H, vdata, onScreenText, frameRef.current);
      } else if (vtype === 'concept_card' || vtype === 'card') {
        drawConceptCard(ctx, W, H, vdata, onScreenText, frameRef.current);
      } else if (vtype === 'process' || vtype === 'diagram' || vtype === 'flow') {
        drawStepProcess(ctx, W, H, vdata, onScreenText, frameRef.current);
      } else if (vtype === 'graph' || vtype === 'chart') {
        drawGraph(ctx, W, H, vdata, onScreenText, frameRef.current);
      } else if (vtype === 'table' || vtype === 'comparison') {
        drawComparisonTable(ctx, W, H, vdata, onScreenText, frameRef.current);
      } else if (vtype === 'timeline' || vtype === 'history') {
        drawTimeline(ctx, W, H, vdata, onScreenText, frameRef.current);
      } else if (vtype === 'code' || vtype === 'algorithm') {
        drawCode(ctx, W, H, vdata, onScreenText, frameRef.current);
      } else if (vtype === 'map' || vtype === 'concept_map') {
        drawConceptMap(ctx, W, H, vdata, onScreenText, frameRef.current);
      } else {
        drawConceptCard(ctx, W, H, vdata, onScreenText, frameRef.current);
      }

      if (isPlaying) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [scene, topic, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={900}
      height={500}
      className="w-full h-full rounded-xl"
      style={{ display: 'block' }}
    />
  );
};

// ─── FORMULA / EQUATION RENDERER ─────────────────────────────────────────────
function drawFormula(ctx: CanvasRenderingContext2D, W: number, H: number, data: any, title: string, frame: number) {
  const pulse = Math.sin(frame * 0.04) * 0.12 + 0.88;

  // Title
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || title, W / 2, 50);

  // Large formula text
  const formula = data.latex || title;
  ctx.fillStyle = `rgba(251, 191, 36, ${pulse})`;
  ctx.font = `bold ${Math.min(72, Math.floor(W / (formula.length * 0.7 + 1)))}px monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(formula, W / 2, H / 2 - 30);

  // Glow effect
  ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
  ctx.shadowBlur = 20 * pulse;
  ctx.fillText(formula, W / 2, H / 2 - 30);
  ctx.shadowBlur = 0;

  // Variables breakdown
  const variables: any[] = data.variables || [];
  const colW = Math.floor(W / Math.max(variables.length, 1));
  variables.forEach((v: any, i: number) => {
    const x = colW * i + colW / 2;
    const y = H / 2 + 60;

    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.beginPath();
    ctx.roundRect(x - colW / 2 + 8, y - 16, colW - 16, 80, 12);
    ctx.fill();

    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(v.symbol || '', x, y + 14);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText(v.name || '', x, y + 34);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`(${v.unit || ''})`, x, y + 52);
  });

  // Steps
  const steps: string[] = data.step_by_step || [];
  steps.forEach((step: string, i: number) => {
    ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#a78bfa';
    ctx.font = '13px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`● ${step}`, 30, H - 90 + i * 22);
  });
}

// ─── CONCEPT CARD RENDERER ────────────────────────────────────────────────────
function drawConceptCard(ctx: CanvasRenderingContext2D, W: number, H: number, data: any, title: string, frame: number) {
  const shimmer = (Math.sin(frame * 0.03) + 1) / 2;

  // Card background
  const grad = ctx.createLinearGradient(20, 20, W - 20, H - 20);
  grad.addColorStop(0, 'rgba(99,102,241,0.15)');
  grad.addColorStop(1, 'rgba(139,92,246,0.08)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(20, 20, W - 40, H - 40, 20);
  ctx.fill();

  // Border glow
  ctx.strokeStyle = `rgba(99,102,241,${0.4 + shimmer * 0.3})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(20, 20, W - 40, H - 40, 20);
  ctx.stroke();

  // Title
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 26px Inter, sans-serif';
  ctx.textAlign = 'center';
  const displayTitle = data.title || title;
  ctx.fillText(displayTitle.length > 50 ? displayTitle.slice(0, 48) + '…' : displayTitle, W / 2, 80);

  // Description
  ctx.fillStyle = '#94a3b8';
  ctx.font = '15px Inter, sans-serif';
  const desc = data.description || '';
  wrapText(ctx, desc, W / 2, 120, W - 80, 22, 'center');

  // Points / bullet list
  const points: string[] = data.points || [];
  points.slice(0, 5).forEach((pt: string, i: number) => {
    const y = 200 + i * 52;
    const isAnim = i === Math.floor((frame / 60) % points.length);

    ctx.fillStyle = isAnim ? 'rgba(99,102,241,0.3)' : 'rgba(30,41,59,0.8)';
    ctx.beginPath();
    ctx.roundRect(40, y - 20, W - 80, 44, 10);
    ctx.fill();

    ctx.fillStyle = isAnim ? '#818cf8' : '#4ade80';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('✓', 60, y + 6);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(pt.length > 70 ? pt.slice(0, 68) + '…' : pt, 90, y + 6);
  });
}

// ─── STEP PROCESS / DIAGRAM RENDERER ─────────────────────────────────────────
function drawStepProcess(ctx: CanvasRenderingContext2D, W: number, H: number, data: any, title: string, frame: number) {
  const steps: any[] = data.steps || [];
  const activeStep = Math.floor((frame / 80) % Math.max(steps.length, 1));
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || title, W / 2, 46);

  const stepH = Math.min(90, (H - 80) / Math.max(steps.length, 1));

  steps.forEach((step: any, i: number) => {
    const y = 70 + i * (stepH + 10);
    const isActive = i === activeStep;
    const color = colors[i % colors.length];

    // Step card
    ctx.fillStyle = isActive ? `${color}33` : 'rgba(15,23,42,0.8)';
    ctx.beginPath();
    ctx.roundRect(30, y, W - 60, stepH, 12);
    ctx.fill();

    ctx.strokeStyle = isActive ? color : 'rgba(71,85,105,0.5)';
    ctx.lineWidth = isActive ? 2 : 1;
    ctx.beginPath();
    ctx.roundRect(30, y, W - 60, stepH, 12);
    ctx.stroke();

    // Step number circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(70, y + stepH / 2, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(step.step || i + 1), 70, y + stepH / 2 + 5);

    // Step title
    ctx.fillStyle = isActive ? '#e2e8f0' : '#94a3b8';
    ctx.font = `bold ${isActive ? 16 : 14}px Inter, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(step.title || `Step ${i + 1}`, 100, y + 22);

    // Step description
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    const desc = step.description || '';
    ctx.fillText(desc.length > 85 ? desc.slice(0, 83) + '…' : desc, 100, y + 44);

    // Arrow between steps
    if (i < steps.length - 1) {
      const ay = y + stepH + 5;
      ctx.fillStyle = `rgba(${hexToRgb(color)},0.6)`;
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('↓', W / 2, ay + 4);
    }
  });
}

// ─── GRAPH / CHART RENDERER ───────────────────────────────────────────────────
function drawGraph(ctx: CanvasRenderingContext2D, W: number, H: number, data: any, title: string, frame: number) {
  const series: any[] = data.series || [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }];
  const animPct = Math.min(1, frame / 120);

  const margin = { left: 70, right: 30, top: 60, bottom: 60 };
  const cW = W - margin.left - margin.right;
  const cH = H - margin.top - margin.bottom;

  // Title
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 20px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || title, W / 2, 38);

  // Axes
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + cH);
  ctx.lineTo(margin.left + cW, margin.top + cH);
  ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#64748b';
  ctx.font = '12px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.x_axis || 'X', margin.left + cW / 2, H - 10);
  ctx.save();
  ctx.translate(16, margin.top + cH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(data.y_axis || 'Y', 0, 0);
  ctx.restore();

  // Scale
  const xs = series.map((p: any) => p.x);
  const ys = series.map((p: any) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys, 0), maxY = Math.max(...ys);
  const toX = (x: number) => margin.left + ((x - minX) / (maxX - minX || 1)) * cW;
  const toY = (y: number) => margin.top + cH - ((y - minY) / (maxY - minY || 1)) * cH;

  // Animated line
  const totalLen = series.length - 1;
  const drawn = Math.floor(animPct * totalLen);

  const gradient = ctx.createLinearGradient(margin.left, 0, margin.left + cW, 0);
  gradient.addColorStop(0, '#6366f1');
  gradient.addColorStop(0.5, '#8b5cf6');
  gradient.addColorStop(1, '#06b6d4');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.beginPath();
  series.slice(0, drawn + 2).forEach((pt: any, i: number) => {
    const px = toX(pt.x), py = toY(pt.y);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Fill area under curve
  ctx.fillStyle = 'rgba(99,102,241,0.1)';
  ctx.beginPath();
  series.slice(0, drawn + 2).forEach((pt: any, i: number) => {
    const px = toX(pt.x), py = toY(pt.y);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  ctx.lineTo(toX(series[Math.min(drawn + 1, series.length - 1)].x), margin.top + cH);
  ctx.lineTo(toX(series[0].x), margin.top + cH);
  ctx.closePath();
  ctx.fill();

  // Dots
  series.slice(0, drawn + 2).forEach((pt: any) => {
    ctx.fillStyle = '#818cf8';
    ctx.beginPath();
    ctx.arc(toX(pt.x), toY(pt.y), 5, 0, Math.PI * 2);
    ctx.fill();

    if (pt.label) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(pt.label, toX(pt.x), toY(pt.y) - 10);
    }
  });

  // Formula label
  if (data.formula) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(data.formula, W - 20, H - 10);
  }
}

// ─── COMPARISON TABLE RENDERER ────────────────────────────────────────────────
function drawComparisonTable(ctx: CanvasRenderingContext2D, W: number, H: number, data: any, title: string, frame: number) {
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || title, W / 2, 44);

  const headers: string[] = data.headers || ['Item', 'Value'];
  const rows: any[][] = data.rows || [];
  const colW = (W - 60) / headers.length;
  const rowH = Math.min(50, (H - 120) / (rows.length + 1));

  // Header row
  headers.forEach((h: string, i: number) => {
    const x = 30 + i * colW;
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(x, 60, colW - 4, rowH - 4);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(h), x + colW / 2, 60 + rowH / 2 + 5);
  });

  // Data rows
  const activeRow = Math.floor((frame / 90) % Math.max(rows.length, 1));
  rows.forEach((row: any[], ri: number) => {
    const y = 60 + (ri + 1) * rowH;
    row.forEach((cell: any, ci: number) => {
      const x = 30 + ci * colW;
      ctx.fillStyle = ri === activeRow ? 'rgba(99,102,241,0.25)' : ri % 2 === 0 ? 'rgba(15,23,42,0.7)' : 'rgba(30,41,59,0.7)';
      ctx.fillRect(x, y, colW - 4, rowH - 4);
      ctx.fillStyle = ri === activeRow ? '#e2e8f0' : '#94a3b8';
      ctx.font = `${ri === activeRow ? 'bold ' : ''}13px Inter, sans-serif`;
      ctx.textAlign = 'center';
      const cellStr = String(cell);
      ctx.fillText(cellStr.length > 30 ? cellStr.slice(0, 28) + '…' : cellStr, x + colW / 2, y + rowH / 2 + 5);
    });
  });
}

// ─── TIMELINE RENDERER ────────────────────────────────────────────────────────
function drawTimeline(ctx: CanvasRenderingContext2D, W: number, H: number, data: any, title: string, frame: number) {
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || title, W / 2, 44);

  const events: any[] = data.events || data.steps || [];
  const activeIdx = Math.floor((frame / 90) % Math.max(events.length, 1));
  const margin = 60;
  const lineY = H / 2;

  // Main timeline line
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(margin, lineY);
  ctx.lineTo(W - margin, lineY);
  ctx.stroke();

  if (events.length === 0) return;

  const spacing = (W - margin * 2) / (events.length - 1 || 1);
  const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  events.forEach((ev: any, i: number) => {
    const x = margin + i * spacing;
    const isActive = i === activeIdx;
    const color = colors[i % colors.length];

    // Dot
    ctx.fillStyle = isActive ? color : '#334155';
    ctx.beginPath();
    ctx.arc(x, lineY, isActive ? 14 : 9, 0, Math.PI * 2);
    ctx.fill();

    if (isActive) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, lineY, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Label above/below alternating
    const above = i % 2 === 0;
    const labelY = above ? lineY - 40 : lineY + 50;

    ctx.fillStyle = isActive ? '#e2e8f0' : '#64748b';
    ctx.font = `${isActive ? 'bold ' : ''}12px Inter, sans-serif`;
    ctx.textAlign = 'center';
    const yr = ev.year || ev.date || '';
    const label = ev.event || ev.title || '';
    if (yr) ctx.fillText(String(yr), x, labelY - 16);
    ctx.fillText(label.length > 18 ? label.slice(0, 16) + '…' : label, x, labelY);
  });
}

// ─── CODE RENDERER ────────────────────────────────────────────────────────────
function drawCode(ctx: CanvasRenderingContext2D, W: number, H: number, data: any, title: string, frame: number) {
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 18px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(data.title || title, W / 2, 38);

  const code = data.code || data.snippet || `// ${title}\nfunction main() {\n  // Implementation\n  return result;\n}`;
  const lines = code.split('\n');
  const animLine = Math.floor(frame / 25) % (lines.length + 1);

  // Code box
  ctx.fillStyle = '#020617';
  ctx.beginPath();
  ctx.roundRect(30, 56, W - 60, H - 80, 12);
  ctx.fill();

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(30, 56, W - 60, H - 80, 12);
  ctx.stroke();

  const lineH = Math.min(26, (H - 90) / Math.max(lines.length, 1));

  lines.forEach((line: string, i: number) => {
    const y = 82 + i * lineH;
    if (i === animLine) {
      ctx.fillStyle = 'rgba(99,102,241,0.2)';
      ctx.fillRect(32, y - lineH + 4, W - 64, lineH);
    }

    // Line number
    ctx.fillStyle = '#475569';
    ctx.font = `${Math.min(14, lineH - 4)}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(String(i + 1), 75, y);

    // Code text with basic syntax coloring
    const trimmed = line.trim();
    let color = '#e2e8f0';
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) color = '#64748b';
    else if (/^(function|def|class|return|if|else|for|while|const|let|var|import|from)\b/.test(trimmed)) color = '#818cf8';
    else if (/["']/.test(trimmed)) color = '#4ade80';
    else if (/\d/.test(trimmed)) color = '#fb923c';

    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(line, 90, y);
  });

  if (data.language) {
    ctx.fillStyle = '#475569';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(data.language.toUpperCase(), W - 40, 74);
  }
}

// ─── CONCEPT MAP RENDERER ─────────────────────────────────────────────────────
function drawConceptMap(ctx: CanvasRenderingContext2D, W: number, H: number, data: any, title: string, frame: number) {
  const pulse = Math.sin(frame * 0.04) * 0.15 + 0.85;
  const nodes: any[] = data.nodes || [];

  // Center node
  const cx = W / 2, cy = H / 2;
  ctx.fillStyle = `rgba(99,102,241,${pulse})`;
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px Inter, sans-serif';
  ctx.textAlign = 'center';
  const central = (data.central || title).split(' ').slice(0, 3).join(' ');
  ctx.fillText(central, cx, cy + 5);

  // Surrounding nodes
  const count = Math.min(nodes.length, 6);
  const colors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const r = Math.min(W, H) * 0.33;
    const nx = cx + Math.cos(angle) * r;
    const ny = cy + Math.sin(angle) * r;

    // Connection line
    ctx.strokeStyle = `rgba(${hexToRgb(colors[i % colors.length])},0.4)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    ctx.stroke();
    ctx.setLineDash([]);

    // Satellite node
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(nx, ny, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    const label = (nodes[i].label || nodes[i].name || `Concept ${i + 1}`).split(' ').slice(0, 2).join(' ');
    ctx.fillText(label, nx, ny + 4);
  }
}

// ─── Helper utilities ─────────────────────────────────────────────────────────
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number, align: CanvasTextAlign = 'left') {
  ctx.textAlign = align;
  const words = text.split(' ');
  let line = '';
  let dy = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y + dy);
      line = word;
      dy += lineH;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y + dy);
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '99,102,241';
}

// ─── Main Player Component ────────────────────────────────────────────────────
export const TeachingVideoPlayer: React.FC<TeachingVideoPlayerProps> = ({
  videoData,
  onSectionComplete,
  language = 'English',
  isMuted = false,
  onToggleMute,
}) => {
  const scenes = videoData.scenes || [];
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const TEACHER_PROFILES = [
    {
      id: 'dr_sarah',
      name: 'Dr. Sarah Adams',
      role: 'AI Master Educator',
      videoUrl: '/assets/real_ai_teacher.mp4',
      avatarImg: '/assets/ai_teacher_avatar.jpg',
    },
    {
      id: 'prof_elena',
      name: 'Prof. Elena Rostova',
      role: 'Interactive Lecture Master',
      videoUrl: '/assets/teacher_lecture.mp4',
      avatarImg: '/assets/ai_teacher_avatar.jpg',
    },
    {
      id: 'prof_alex',
      name: 'Prof. Alex Mercer',
      role: 'Visual & Conceptual Tutor',
      videoUrl: '/assets/teacher_presentation.mp4',
      avatarImg: '/assets/ai_teacher_avatar.jpg',
    },
  ];

  const [selectedTeacherIndex, setSelectedTeacherIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showChapterMenu, setShowChapterMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [presenterSize, setPresenterSize] = useState<'compact' | 'expanded'>('compact');

  const containerRef = useRef<HTMLDivElement>(null);
  const teacherVideoRef = useRef<HTMLVideoElement>(null);
  const sceneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeScene: VideoScene | undefined = scenes[currentSceneIndex];
  const narrationText = activeScene?.teacher_narration || '';
  const words = narrationText.split(/\s+/).filter(Boolean);

  const activeTeacher = TEACHER_PROFILES[selectedTeacherIndex];

  // Dynamic teacher video source
  const teacherVideoSrc =
    activeTeacher.videoUrl ||
    videoData.video_url ||
    videoData.teacher_profile?.video_url ||
    '/assets/real_ai_teacher.mp4';

  // Sync teacher video element with isPlaying state and playback speed
  useEffect(() => {
    if (teacherVideoRef.current) {
      teacherVideoRef.current.playbackRate = playbackSpeed;
      if (isPlaying) {
        teacherVideoRef.current.play().catch(() => {});
      } else {
        teacherVideoRef.current.pause();
      }
    }
  }, [isPlaying, playbackSpeed]);

  // Global Keyboard shortcuts (Space = Play/Pause, Left/Right = Scenes, M = Mute, F = Fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
        setHasStarted(true);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (currentSceneIndex < scenes.length - 1) handleSeek(currentSceneIndex + 1);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentSceneIndex > 0) handleSeek(currentSceneIndex - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        onToggleMute?.();
      } else if (e.key === 'f' || e.key === 'F') {
        handleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSceneIndex, scenes.length]);

  // ── Start / Pause playback ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || !activeScene) {
      speechService.stopSpeaking();
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
      return;
    }

    const duration = (activeScene.duration || 14) * 1000;

    // TTS narration
    if (!isMuted && narrationText) {
      speechService.speak(
        narrationText,
        () => {
          if (currentSceneIndex < scenes.length - 1) {
            setCurrentSceneIndex(prev => prev + 1);
            setCurrentWordIndex(0);
          } else {
            setIsPlaying(false);
            onSectionComplete?.();
          }
        },
        language
      );
    } else if (isMuted) {
      sceneTimerRef.current = setTimeout(() => {
        if (currentSceneIndex < scenes.length - 1) {
          setCurrentSceneIndex(prev => prev + 1);
          setCurrentWordIndex(0);
        } else {
          setIsPlaying(false);
          onSectionComplete?.();
        }
      }, duration);
    }

    // Word-by-word caption highlighter
    setCurrentWordIndex(0);
    const msPerWord = words.length > 0 ? duration / words.length : 400;
    let wi = 0;
    wordTimerRef.current = setInterval(() => {
      wi++;
      if (wi < words.length) setCurrentWordIndex(wi);
      else if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    }, msPerWord);

    return () => {
      speechService.stopSpeaking();
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    };
  }, [currentSceneIndex, isPlaying, isMuted, language]);

  const handlePlay = () => {
    setHasStarted(true);
    setIsPlaying(prev => !prev);
  };

  const handleSeek = (idx: number) => {
    if (idx >= 0 && idx < scenes.length) {
      speechService.stopSpeaking();
      setCurrentSceneIndex(idx);
      setCurrentWordIndex(0);
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const sceneProgress = scenes.length > 0 ? ((currentSceneIndex + 1) / scenes.length) * 100 : 0;

  // Caption window
  const captionStart = Math.max(0, currentWordIndex - 3);
  const captionEnd = Math.min(words.length, currentWordIndex + 10);
  const captionSlice = words.slice(captionStart, captionEnd);

  const sceneTypeIcon = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('formula') || t.includes('equation')) return '∑';
    if (t.includes('intro')) return '👋';
    if (t.includes('example') || t.includes('worked')) return '🔧';
    if (t.includes('summary')) return '📋';
    if (t.includes('check') || t.includes('question')) return '❓';
    if (t.includes('visual') || t.includes('concept')) return '💡';
    return '📖';
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 select-none"
      style={{ minHeight: 560 }}
    >
      {/* ── MAIN STAGE: Full Educational Visual ──────────────────────────── */}
      <div className="relative w-full" style={{ height: isFullscreen ? '100vh' : 500 }}>
        {/* Canvas visualizer fills the entire stage */}
        {activeScene ? (
          <SceneVisualCanvas
            scene={activeScene}
            topic={videoData.topic}
            isPlaying={isPlaying}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <span>No scenes generated</span>
          </div>
        )}

        {/* ── Top-left: Scene badge ───────────────────────────────────────── */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-1.5 flex items-center space-x-2">
            <span className="text-base">{sceneTypeIcon(activeScene?.scene_type || '')}</span>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              {(activeScene?.scene_type || '').replace(/_/g, ' ')}
            </span>
          </div>
          {isPlaying && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl px-2.5 py-1 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-300">LIVE</span>
            </div>
          )}
        </div>

        {/* ── Top-right: Topic badge ─────────────────────────────────────── */}
        <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-indigo-500/40 rounded-xl px-3 py-1.5">
          <span className="text-xs font-bold text-indigo-300">{videoData.topic}</span>
        </div>

        {/* ── AI Human-Like Teacher Presenter Overlay (bottom-left) ─────────── */}
        <div className="absolute bottom-20 left-4 z-20 flex items-end space-x-3">
          <div className="relative group">
            {/* Realistic Teacher Video / Avatar Box */}
            <div
              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 shadow-2xl bg-slate-900 ${
                isPlaying ? 'border-emerald-400 shadow-emerald-500/20 ring-4 ring-emerald-500/10' : 'border-slate-700'
              }`}
              style={{ width: presenterSize === 'expanded' ? 220 : 130, height: presenterSize === 'expanded' ? 160 : 96 }}
            >
              {/* Human Teacher Video */}
              <video
                ref={teacherVideoRef}
                src={teacherVideoSrc}
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                poster="/assets/ai_teacher_avatar.jpg"
                onError={(e) => {
                  // Fallback to high-res portrait if video fails
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const img = target.parentElement?.querySelector('img');
                  if (img) img.style.display = 'block';
                }}
              />
              {/* Fallback image */}
              <img
                src="/assets/ai_teacher_avatar.jpg"
                alt="Dr. Sarah Adams"
                className="w-full h-full object-cover hidden"
              />

              {/* Status overlay on avatar */}
              <div className="absolute top-1.5 left-1.5 bg-slate-950/80 backdrop-blur-md rounded-md px-1.5 py-0.5 flex items-center space-x-1 border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                <span className="text-[9px] font-bold text-slate-200">
                  {isPlaying ? 'SPEAKING' : 'READY'}
                </span>
              </div>

              {/* Live Audio Equalizer Bars when speaking */}
              {isPlaying && (
                <div className="absolute bottom-1.5 right-1.5 flex items-end space-x-0.5 bg-slate-950/80 backdrop-blur-md px-1 py-0.5 rounded">
                  {[40, 80, 60, 100, 50, 90].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-emerald-400 rounded-full animate-pulse"
                      style={{
                        height: `${h * 0.12}px`,
                        animationDelay: `${i * 120}ms`,
                        animationDuration: '600ms',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Resize Toggle Button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPresenterSize(prev => (prev === 'compact' ? 'expanded' : 'compact'));
                }}
                className="absolute top-1.5 right-1.5 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title={presenterSize === 'expanded' ? 'Shrink Presenter' : 'Expand Presenter'}
              >
                {presenterSize === 'expanded' ? (
                  <Minimize2 className="w-3 h-3" />
                ) : (
                  <Maximize2 className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Teacher Credentials Badge */}
          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-3 py-1.5 mb-1 shadow-lg">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <p className="text-xs font-bold text-white">{videoData.teacher_profile?.name || 'Dr. Sarah Adams'}</p>
            </div>
            <p className="text-[10px] text-indigo-300/90 font-medium">
              {videoData.teacher_profile?.role || 'Holographic AI Master Instructor'}
            </p>
          </div>
        </div>

        {/* ── CAPTIONS (bottom center) ───────────────────────────────────── */}
        {showCaptions && narrationText && hasStarted && (
          <div className="absolute bottom-4 left-20 right-4 bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-2xl px-4 py-3 text-center shadow-xl">
            <p className="text-sm sm:text-base leading-relaxed font-medium">
              {captionSlice.map((w, idx) => {
                const globalIdx = captionStart + idx;
                const isCurrentWord = globalIdx === currentWordIndex;
                return (
                  <span
                    key={`${globalIdx}-${w}`}
                    className={`inline transition-all mx-[2px] ${
                      isCurrentWord ? 'text-indigo-300 font-extrabold underline decoration-indigo-400' : 'text-slate-200'
                    }`}
                  >
                    {w}{' '}
                  </span>
                );
              })}
            </p>
          </div>
        )}

        {/* ── Play button overlay (before starting) ─────────────────────── */}
        {!hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
            <button
              onClick={handlePlay}
              className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all cursor-pointer"
            >
              <Play className="w-10 h-10 text-white fill-white ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* ── BOTTOM CONTROL BAR ───────────────────────────────────────────── */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 py-3 space-y-2.5">
        {/* Scene progress indicator strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>
              Scene {currentSceneIndex + 1} of {scenes.length}
              {activeScene?.on_screen_text ? ` — ${activeScene.on_screen_text}` : ''}
            </span>
            <span className="font-bold text-indigo-400">{Math.round(sceneProgress)}%</span>
          </div>

          {/* Clickable scene segments */}
          <div className="flex gap-1">
            {scenes.map((sc, idx) => (
              <button
                key={sc.scene_id || idx}
                onClick={() => handleSeek(idx)}
                title={`Scene ${idx + 1}: ${sc.on_screen_text || sc.scene_type}`}
                className={`flex-1 h-2.5 rounded-full transition-all cursor-pointer ${
                  idx < currentSceneIndex
                    ? 'bg-emerald-500'
                    : idx === currentSceneIndex
                    ? 'bg-indigo-500 scale-y-150'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Left: playback buttons */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => handleSeek(currentSceneIndex - 1)}
              disabled={currentSceneIndex === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlay}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'Pause' : hasStarted ? 'Resume' : 'Play Video'}</span>
            </button>

            <button
              onClick={() => handleSeek(currentSceneIndex + 1)}
              disabled={currentSceneIndex >= scenes.length - 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { setCurrentSceneIndex(0); setCurrentWordIndex(0); setIsPlaying(true); setHasStarted(true); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
              title="Restart video"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Center: scene label & teacher selector */}
          <div className="hidden sm:flex items-center space-x-3 text-xs text-slate-400">
            {/* Teacher persona quick-picker */}
            <div className="flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700/80 rounded-xl px-2.5 py-1">
              <span className="text-[10px] text-slate-400 font-semibold">Teacher:</span>
              <select
                value={selectedTeacherIndex}
                onChange={(e) => setSelectedTeacherIndex(Number(e.target.value))}
                className="bg-transparent text-indigo-300 font-bold text-xs focus:outline-none cursor-pointer"
              >
                {TEACHER_PROFILES.map((tp, i) => (
                  <option key={tp.id} value={i} className="bg-slate-900 text-white">
                    {tp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium max-w-[160px] truncate">
                {activeScene?.on_screen_text || activeScene?.scene_type?.replace(/_/g, ' ') || videoData.topic}
              </span>
            </div>
          </div>

          {/* Right: speed, captions, mute, fullscreen */}
          <div className="flex items-center space-x-1.5">
            {/* Playback speed toggle */}
            <button
              onClick={() => {
                const speeds = [0.8, 1.0, 1.25, 1.5];
                const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                setPlaybackSpeed(speeds[nextIdx]);
              }}
              className="px-2 py-1 rounded-xl bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              title="Change playback speed"
            >
              {playbackSpeed}x
            </button>

            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`p-2 rounded-xl border text-xs flex items-center space-x-1 transition-all cursor-pointer ${
                showCaptions ? 'bg-indigo-950 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
              title="Toggle captions (C)"
            >
              <AlignLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleMute}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isMuted ? 'bg-amber-950/60 border-amber-500/40 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleFullscreen}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── SCENE NAVIGATION DOTS at bottom ──────────────────────────────── */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center space-x-2 overflow-x-auto">
        {scenes.map((sc, idx) => (
          <button
            key={sc.scene_id || idx}
            onClick={() => handleSeek(idx)}
            className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              idx === currentSceneIndex
                ? 'bg-indigo-600 text-white'
                : idx < currentSceneIndex
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {idx < currentSceneIndex ? (
              <CheckCircle className="w-3 h-3 text-emerald-400" />
            ) : (
              <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[9px] font-bold">
                {idx + 1}
              </span>
            )}
            <span className="max-w-[100px] truncate">
              {sc.on_screen_text || (sc.scene_type || '').replace(/_/g, ' ')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
