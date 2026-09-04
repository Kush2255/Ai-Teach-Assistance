import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface GraphProps {
  data: {
    title?: string;
    x_axis?: string;
    y_axis?: string;
    series?: Array<{ x: number; y: number; label?: string }>;
    formula?: string;
  };
}

export const GraphRenderer: React.FC<GraphProps> = ({ data }) => {
  const chartData = data.series && data.series.length > 0 ? data.series : [
    { x: 1, y: 2, label: 'Point A' },
    { x: 2, y: 4, label: 'Point B' },
    { x: 3, y: 6, label: 'Point C' },
    { x: 4, y: 8, label: 'Point D' },
  ];

  return (
    <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3 text-blue-400">
          <TrendingUp className="w-6 h-6" />
          <h3 className="text-lg font-semibold tracking-wide text-white">{data.title || "V-I Characteristic Curve"}</h3>
        </div>
        {data.formula && (
          <span className="font-mono text-xs text-indigo-300 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-500/40">
            {data.formula}
          </span>
        )}
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="x" stroke="#94a3b8" label={{ value: data.x_axis || "Current (I)", position: "insideBottom", offset: -10, fill: "#94a3b8" }} />
            <YAxis stroke="#94a3b8" label={{ value: data.y_axis || "Voltage (V)", angle: -90, position: "insideLeft", fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#3b82f6', borderRadius: '0.75rem', color: '#fff' }} />
            <Legend verticalAlign="top" height={36} />
            <Line type="monotone" dataKey="y" name={data.y_axis || "Voltage (V)"} stroke="#6366f1" strokeWidth={3} dot={{ r: 6, fill: "#60a5fa" }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
        <span>💡 <b>Teacher Insight:</b> {data.formula ? `The formula ${data.formula} describes this relationship. Observe how the variables interact along this curve.` : 'Observe how the variables interact along this curve and identify the trend.'}</span>
      </div>
    </div>
  );
};
