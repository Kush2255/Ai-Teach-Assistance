import React from 'react';
import { Table, Check, ArrowRight } from 'lucide-react';

interface ComparisonTableProps {
  data: {
    title?: string;
    headers?: string[];
    rows?: string[][];
  };
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  const headers = data.headers || ["Criteria", "Case A", "Case B"];
  const rows = data.rows || [];

  return (
    <div className="bg-slate-900/95 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Table className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Comparative Analysis</span>
          <h3 className="text-base font-bold text-white leading-tight">{data.title || "Concept Comparison Matrix"}</h3>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700 text-indigo-300 font-semibold uppercase tracking-wider text-[10px]">
              {headers.map((h, i) => (
                <th key={i} className="py-3 px-4 first:rounded-tl-xl last:rounded-tr-xl">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className={`py-3 px-4 ${
                      cIdx === 0
                        ? "font-semibold text-slate-200 bg-slate-900/40"
                        : "text-slate-300"
                    }`}
                  >
                    <div className="flex items-center space-x-1.5">
                      {cIdx > 0 && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                      <span>{cell}</span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
        <span>Structured breakdown according to current teaching segment</span>
        <span className="flex items-center space-x-1 text-indigo-400 font-medium">
          <span>Synthesized Live</span>
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
