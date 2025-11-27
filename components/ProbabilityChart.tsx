import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProbabilityChartProps {
  data: { name: string; value: number }[];
}

const ProbabilityChart: React.FC<ProbabilityChartProps> = ({ data }) => {
  const COLORS = ['#34d399', '#60a5fa', '#a78bfa'];

  if (data.length === 0) return <div className="text-slate-500 text-sm">No probability data generated yet.</div>;

  return (
    <div className="w-full h-40">
      <h3 className="text-slate-300 text-xs uppercase font-bold mb-2">Next Token Probabilities</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={80} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{fill: '#1e293b'}}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProbabilityChart;
