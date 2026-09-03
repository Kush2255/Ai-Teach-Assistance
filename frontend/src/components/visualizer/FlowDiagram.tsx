import React from 'react';
import { ArrowRight, Workflow } from 'lucide-react';

interface FlowProps {
  data: {
    title?: string;
    steps?: Array<{ step: number; title: string; description: string }>;
  };
}

export const FlowDiagram: React.FC<FlowProps> = ({ data }) => {
  const steps = data.steps || [
    { step: 1, title: 'Energy Potential', description: 'Voltage source creates electric field potential.' },
    { step: 2, title: 'Charge Drift', description: 'Free electrons drift across the conductor.' },
    { step: 3, title: 'Resistive Opposition', description: 'Collisions with lattice atoms cause energy dissipation.' },
  ];

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-3 text-purple-400">
        <Workflow className="w-6 h-6" />
        <h3 className="text-lg font-semibold tracking-wide text-white">{data.title || "Execution Flow"}</h3>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {steps.map((item, idx) => (
          <React.Fragment key={idx}>
            <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center space-y-2 relative group hover:border-purple-500/50 transition-all">
              <span className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/50 text-purple-400 font-bold flex items-center justify-center mx-auto text-xs">
                {item.step}
              </span>
              <h4 className="font-semibold text-white text-sm">{item.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
            </div>
            {idx < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-purple-400/60 hidden md:block flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
