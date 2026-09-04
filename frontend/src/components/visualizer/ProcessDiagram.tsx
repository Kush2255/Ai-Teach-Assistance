import React from 'react';
import { Layers } from 'lucide-react';

interface ProcessProps {
  data: {
    title?: string;
    steps?: Array<{ step: number; title: string; description: string }>;
  };
}

export const ProcessDiagram: React.FC<ProcessProps> = ({ data }) => {
  const steps = data.steps && data.steps.length > 0 ? data.steps : [
    { step: 1, title: "Input", description: "Receive the primary inputs for this process." },
    { step: 2, title: "Processing", description: "Apply the core transformations and logic." },
    { step: 3, title: "Output", description: "Produce the final result or observable outcome." }
  ];

  return (
    <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-3 text-teal-400">
        <Layers className="w-6 h-6" />
        <h3 className="text-lg font-semibold tracking-wide text-white">{data.title || "Process Mechanics"}</h3>
      </div>

      <div className="space-y-3">
        {steps.map((s, idx) => (
          <div key={idx} className="flex items-start space-x-4 bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <span className="w-7 h-7 rounded-full bg-teal-950 border border-teal-500/40 text-teal-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
              {s.step}
            </span>
            <div>
              <h4 className="font-semibold text-white text-sm">{s.title}</h4>
              <p className="text-xs text-slate-400 mt-1">{s.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
