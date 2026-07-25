'use client';

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const sampleData = [
  { velocity: 0, ke: 0 },
  { velocity: 2, ke: 4 },
  { velocity: 4, ke: 16 },
  { velocity: 6, ke: 36 },
  { velocity: 8, ke: 64 },
  { velocity: 10, ke: 100 },
];

export const InteractiveChart: React.FC = () => {
  return (
    <div className="my-4 rounded-xl border border-indigo-500/20 bg-[#18181b] p-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
          <span>✨</span> Interactive Energy Scaling
        </div>
        <span className="text-[9px] uppercase tracking-wider font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
          Live Simulation
        </span>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sampleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="velocity" stroke="#71717a" fontSize={10} />
            <YAxis stroke="#71717a" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px' }}
              itemStyle={{ color: '#818cf8' }}
            />
            <Line type="monotone" dataKey="ke" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#818cf8', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 rounded-md bg-[#09090b] border border-gray-800 p-2 text-center text-[11px] text-gray-400">
        Visualizing: Kinetic Energy <span className="text-indigo-300 font-mono">KE = ½mv²</span> with Mass = 2kg
      </div>
    </div>
  );
};