import React from 'react';
import { History } from 'lucide-react';

interface TimelineProps {
  data: {
    title?: string;
    events?: Array<{ year: string; event: string }>;
  };
}

export const Timeline: React.FC<TimelineProps> = ({ data }) => {
  const events = data.events && data.events.length > 0 ? data.events : [
    { year: 'Step 1', event: 'Foundations established and early observations recorded.' },
    { year: 'Step 2', event: 'Key theories and principles developed.' },
    { year: 'Step 3', event: 'Modern applications and practical use cases emerged.' },
  ];

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-3 text-amber-400">
        <History className="w-6 h-6" />
        <h3 className="text-lg font-semibold tracking-wide text-white">{data.title || "Historical Timeline"}</h3>
      </div>

      <div className="relative border-l-2 border-amber-500/40 ml-4 space-y-6">
        {events.map((ev, idx) => (
          <div key={idx} className="relative pl-6">
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-amber-400" />
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                {ev.year}
              </span>
              <p className="text-sm text-slate-200 mt-2">{ev.event}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
