import React from 'react';
import { Network, ArrowUpRight } from 'lucide-react';

interface ConceptMapProps {
  data: {
    title?: string;
    nodes?: Array<{ id: string; label: string; category: string }>;
    edges?: Array<{ from: string; to: string; label: string }>;
  };
}

export const ConceptMap: React.FC<ConceptMapProps> = ({ data }) => {
  const nodes = data.nodes || [
    { id: 'c1', label: 'Voltage (V)', category: 'Cause' },
    { id: 'c2', label: 'Current (I)', category: 'Effect' },
    { id: 'c3', label: 'Resistance (R)', category: 'Moderator' },
  ];

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-3 text-cyan-400">
        <Network className="w-6 h-6" />
        <h3 className="text-lg font-semibold tracking-wide text-white">{data.title || "Concept Relationship Network"}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((n, i) => (
          <div key={i} className="bg-slate-950/80 border border-cyan-500/20 rounded-xl p-4 space-y-2 hover:border-cyan-400 transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded">
              {n.category}
            </span>
            <h4 className="font-semibold text-white text-sm">{n.label}</h4>
            <div className="flex items-center text-xs text-slate-400 space-x-1 pt-1">
              <span>Connected in network</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
