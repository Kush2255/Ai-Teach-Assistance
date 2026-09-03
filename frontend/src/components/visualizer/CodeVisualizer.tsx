import React from 'react';
import { Code, Terminal } from 'lucide-react';

interface CodeProps {
  data: {
    title?: string;
    language?: string;
    code?: string;
    output?: string;
  };
}

export const CodeVisualizer: React.FC<CodeProps> = ({ data }) => {
  const codeText = data.code || `def calculate_current(voltage: float, resistance: float) -> float:
    if resistance <= 0:
        raise ValueError("Resistance must be positive")
    return voltage / resistance

# Test calculation
print("Current:", calculate_current(12.0, 4.0), "Amperes")`;

  return (
    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3 text-emerald-400">
          <Code className="w-6 h-6" />
          <h3 className="text-lg font-semibold tracking-wide text-white">{data.title || "Code Implementation"}</h3>
        </div>
        <span className="font-mono text-xs text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-500/30 uppercase">
          {data.language || 'python'}
        </span>
      </div>

      {/* Code Editor Box */}
      <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-sm text-emerald-300 overflow-x-auto">
        <pre className="whitespace-pre">{codeText}</pre>
      </div>

      {/* Execution Output */}
      {data.output && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-1">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Terminal Execution Output</span>
          </div>
          <p className="font-mono text-xs text-slate-200">{data.output}</p>
        </div>
      )}
    </div>
  );
};
