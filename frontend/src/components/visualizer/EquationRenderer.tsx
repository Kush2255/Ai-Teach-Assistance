import React from 'react';
import { Calculator, CheckCircle2 } from 'lucide-react';

interface EquationProps {
  data: {
    title?: string;
    latex?: string;
    equation?: string;
    variables?: Array<{ symbol: string; name: string; unit: string; desc: string }>;
    step_by_step?: string[];
  };
}

export const EquationRenderer: React.FC<EquationProps> = ({ data }) => {
  const eqStr = data.latex || data.equation || "y = f(x)";

  return (
    <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center space-x-3 text-indigo-400">
        <Calculator className="w-6 h-6" />
        <h3 className="text-lg font-semibold tracking-wide text-white">{data.title || "Mathematical Model"}</h3>
      </div>

      {/* Main Equation Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-6 text-center shadow-inner">
        <div className="text-3xl md:text-4xl font-mono font-bold tracking-wider text-blue-400 py-2">
          {eqStr}
        </div>
        <p className="text-xs text-slate-400 mt-2">Quantitative Formula Representation</p>
      </div>

      {/* Variable Definitions */}
      {data.variables && data.variables.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.variables.map((v, i) => (
            <div key={i} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-indigo-400 font-bold bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-500/40">
                  {v.symbol}
                </span>
                <span className="font-medium text-white">{v.name}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{v.desc} ({v.unit})</p>
            </div>
          ))}
        </div>
      )}

      {/* Step-by-Step Breakdown */}
      {data.step_by_step && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Step-by-Step Derivation</h4>
          <div className="space-y-2">
            {data.step_by_step.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3 text-sm bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-200">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
