import React, { useEffect, useRef } from 'react';
import { Sparkles, Dna, Activity, Cpu, Atom, Compass } from 'lucide-react';

interface HolographicTopicVisualizerProps {
  topic?: string;
  segmentTitle?: string;
  visualData?: any;
  isSpeaking?: boolean;
}

export const HolographicTopicVisualizer: React.FC<HolographicTopicVisualizerProps> = ({
  topic = '',
  segmentTitle = '',
  visualData = {},
  isSpeaking = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const topicLower = `${topic} ${segmentTitle} ${visualData?.title || ''}`.toLowerCase();

  // Detect domain for tailored holographic rendering
  const isBiology = topicLower.includes('dna') || topicLower.includes('gene') || topicLower.includes('bio') || topicLower.includes('cell') || topicLower.includes('protein');
  const isEvolution = topicLower.includes('evolution') || topicLower.includes('history') || topicLower.includes('human') || topicLower.includes('timeline') || topicLower.includes('era');
  const isCS = topicLower.includes('code') || topicLower.includes('algorithm') || topicLower.includes('binary') || topicLower.includes('data') || topicLower.includes('ai') || topicLower.includes('network') || topicLower.includes('python') || topicLower.includes('search');
  const isPhysics = topicLower.includes('physics') || topicLower.includes('gravity') || topicLower.includes('planet') || topicLower.includes('orbit') || topicLower.includes('force') || topicLower.includes('quantum') || topicLower.includes('wave');
  const isMath = topicLower.includes('math') || topicLower.includes('calculus') || topicLower.includes('graph') || topicLower.includes('equation') || topicLower.includes('integral') || topicLower.includes('function');
  const isChemistry = topicLower.includes('chem') || topicLower.includes('atom') || topicLower.includes('molecule') || topicLower.includes('bond') || topicLower.includes('reaction');

  // Interactive 3D Canvas rendering for Hologram
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let angle = 0;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Cyber Grid Background Lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      angle += isSpeaking ? 0.025 : 0.008;

      if (isBiology || (!isEvolution && !isCS && !isPhysics && !isMath && !isChemistry)) {
        // --- 3D ROTATING DNA DOUBLE HELIX (Matches user's example screenshot 1) ---
        const numPairs = 18;
        const radius = 60;
        const centerY = H / 2;
        const speed = angle;

        for (let i = 0; i < numPairs; i++) {
          const x = 50 + (i / numPairs) * (W - 100);
          const theta = speed + (i * Math.PI) / 4.5;
          const y1 = centerY + Math.sin(theta) * radius;
          const y2 = centerY - Math.sin(theta) * radius;
          const z = Math.cos(theta);

          // Connection rung
          const alpha = 0.2 + (z + 1) * 0.35;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 2 + (z + 1);
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();

          // Base Pair Nodes (Strand A: Cyan, Strand B: Indigo/Magenta)
          const nodeSize = 3.5 + (z + 1) * 2;

          // Node 1
          ctx.fillStyle = z > 0 ? '#38bdf8' : '#0284c7';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = z > 0 ? 12 : 4;
          ctx.beginPath();
          ctx.arc(x, y1, nodeSize, 0, Math.PI * 2);
          ctx.fill();

          // Node 2
          ctx.fillStyle = z > 0 ? '#a855f7' : '#7e22ce';
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = z > 0 ? 12 : 4;
          ctx.beginPath();
          ctx.arc(x, y2, nodeSize, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      } else if (isPhysics) {
        // --- HOLOGRAPHIC ORBIT & ATOMIC FIELD ---
        const cx = W / 2;
        const cy = H / 2;

        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();

        [0, Math.PI / 3, (Math.PI * 2) / 3].forEach((rot, idx) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(rot);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.ellipse(0, 0, 110, 40, 0, 0, Math.PI * 2);
          ctx.stroke();

          const eTheta = angle * (1.5 + idx * 0.4);
          const ex = Math.cos(eTheta) * 110;
          const ey = Math.sin(eTheta) * 40;
          ctx.fillStyle = idx === 0 ? '#38bdf8' : idx === 1 ? '#a855f7' : '#34d399';
          ctx.shadowColor = ctx.fillStyle;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
        ctx.shadowBlur = 0;
      } else if (isCS) {
        // --- HOLOGRAPHIC NEURAL GRAPH / BINARY MATRIX ---
        const layers = [3, 5, 5, 3];
        const layerSpacing = (W - 120) / (layers.length - 1);
        const nodePositions: { x: number; y: number }[][] = [];

        layers.forEach((count, lIdx) => {
          const x = 60 + lIdx * layerSpacing;
          const layerNodes: { x: number; y: number }[] = [];
          const vSpacing = (H - 80) / (count + 1);
          for (let n = 1; n <= count; n++) {
            const y = 40 + n * vSpacing;
            layerNodes.push({ x, y });
          }
          nodePositions.push(layerNodes);
        });

        for (let l = 0; l < nodePositions.length - 1; l++) {
          const current = nodePositions[l];
          const next = nodePositions[l + 1];
          current.forEach((n1, i1) => {
            next.forEach((n2, i2) => {
              const pulse = Math.sin(angle * 4 + l + i1 * 0.5 + i2 * 0.7);
              const alpha = 0.1 + (pulse > 0.4 ? pulse * 0.5 : 0.05);
              ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
              ctx.lineWidth = pulse > 0.5 ? 2 : 1;
              ctx.beginPath();
              ctx.moveTo(n1.x, n1.y);
              ctx.lineTo(n2.x, n2.y);
              ctx.stroke();
            });
          });
        }

        nodePositions.forEach((layer) => {
          layer.forEach((node) => {
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          });
        });
      } else if (isMath) {
        // --- HOLOGRAPHIC DYNAMIC CALCULUS CURVE ---
        const cx = 50;
        const cy = H / 2;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, 20);
        ctx.lineTo(cx, H - 20);
        ctx.moveTo(cx, cy);
        ctx.lineTo(W - 30, cy);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        for (let x = 0; x <= W - cx - 50; x += 3) {
          const y = cy - Math.sin((x * 0.02) + angle) * 70 * Math.exp(-x * 0.001);
          ctx.lineTo(cx + x, y);
        }
        ctx.lineTo(W - 50, cy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        for (let x = 0; x <= W - cx - 50; x += 3) {
          const y = cy - Math.sin((x * 0.02) + angle) * 70 * Math.exp(-x * 0.001);
          if (x === 0) ctx.moveTo(cx + x, y);
          else ctx.lineTo(cx + x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animRef.current);
  }, [isSpeaking, isBiology, isEvolution, isCS, isPhysics, isMath, isChemistry]);

  // Evolution cards data (Matches screenshot 2)
  const evolutionStages = [
    { name: 'Australopithecus', era: '4.0 - 2.0 Ma', trait: 'Bipedal walking, small brain capacity (400-500 cc)', icon: '🚶' },
    { name: 'Homo Habilis', era: '2.4 - 1.4 Ma', trait: 'First toolmaker, primitive Oldowan stone tools', icon: '🪨' },
    { name: 'Homo Erectus', era: '1.9 Ma - 110 ka', trait: 'Control of fire, upright stature, Acheulean axes', icon: '🔥' },
    { name: 'Neanderthalensis', era: '400 - 40 ka', trait: 'Complex culture, burial rituals, robust build', icon: '🏹' },
    { name: 'Homo Sapiens', era: '300 ka - Present', trait: 'Advanced language, symbolic art, abstract thought', icon: '🧠' },
  ];

  return (
    <div className="bg-slate-950/90 border-2 border-cyan-500/40 rounded-2xl p-4 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col justify-between h-full group">
      {/* Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

      {/* Top Header with Telemetry Tags */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/30">
        <div className="flex items-center space-x-2">
          {isBiology && <Dna className="w-4 h-4 text-cyan-400 animate-pulse" />}
          {isPhysics && <Atom className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />}
          {isCS && <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />}
          {isMath && <Activity className="w-4 h-4 text-cyan-400" />}
          {isEvolution && <Compass className="w-4 h-4 text-cyan-400" />}
          {!isBiology && !isPhysics && !isCS && !isMath && !isEvolution && <Sparkles className="w-4 h-4 text-cyan-400" />}

          <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-200">
            {isBiology ? 'Holographic Genomic Engine' : isEvolution ? 'Evolutionary Horizon Visualizer' : isCS ? 'Algorithm Matrix HUD' : isPhysics ? 'Orbital Physics Field' : isMath ? 'Calculus Simulation Model' : 'Holographic AI Model'}
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400">
          <span className="bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 text-[9px] font-bold tracking-wider">
            LIVE SYNC
          </span>
          <span className="hidden sm:inline text-cyan-300/60">SYS.v4.2</span>
        </div>
      </div>

      {/* Main Hologram Area */}
      <div className="flex-1 my-3 relative min-h-[220px] flex items-center justify-center">
        {isEvolution ? (
          /* Evolutionary Progressive Horizon (Screenshot 2 style) */
          <div className="w-full grid grid-cols-1 sm:grid-cols-5 gap-2.5 z-10">
            {evolutionStages.map((stage, idx) => (
              <div
                key={stage.name}
                className="bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 rounded-xl p-2.5 flex flex-col justify-between transition-all hover:scale-105 shadow-lg group/card"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-base">{stage.icon}</span>
                  <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-500/30">
                    Step {idx + 1}
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs mt-1.5 leading-tight">{stage.name}</h4>
                <p className="text-[10px] text-cyan-300 font-mono mt-0.5">{stage.era}</p>
                <p className="text-[9px] text-slate-300 mt-1 leading-snug line-clamp-2">{stage.trait}</p>
              </div>
            ))}
          </div>
        ) : (
          /* Dynamic 3D HTML5 Hologram Canvas */
          <canvas
            ref={canvasRef}
            width={480}
            height={220}
            className="w-full h-full rounded-xl"
          />
        )}
      </div>

      {/* Bottom Telemetry HUD Bar */}
      <div className="pt-2 border-t border-cyan-500/30 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center space-x-3">
          <span className="text-cyan-300 font-bold">TOPIC: <span className="text-white">{topic || 'Foundational Principles'}</span></span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:inline text-slate-300">{segmentTitle || 'Active Explanation'}</span>
        </div>

        <div className="flex items-center space-x-1.5 text-cyan-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold uppercase tracking-wider text-[9px]">Topic-Aware HUD</span>
        </div>
      </div>
    </div>
  );
};
