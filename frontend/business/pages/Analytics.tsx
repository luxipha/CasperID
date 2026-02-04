
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const data = [
  { name: 'Mon', verifications: 400, errors: 24, calls: 2400 },
  { name: 'Tue', verifications: 300, errors: 13, calls: 2210 },
  { name: 'Wed', verifications: 200, errors: 98, calls: 2290 },
  { name: 'Thu', verifications: 278, errors: 39, calls: 2000 },
  { name: 'Fri', verifications: 189, errors: 48, calls: 2181 },
  { name: 'Sat', verifications: 239, errors: 38, calls: 2500 },
  { name: 'Sun', verifications: 349, errors: 43, calls: 2100 },
];

const Analytics: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Analytics & Insights</h2>
        <p className="text-text-muted">Monitor verification trends, API usage, and error rates in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-border-muted shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-text-main">Verification Volume</h3>
            <span className="text-xs text-text-muted font-bold px-2 py-1 bg-background-light rounded">Weekly View</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVer" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8651e1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#8651e1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#716586" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#716586" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="verifications" stroke="#8651e1" fillOpacity={1} fill="url(#colorVer)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border-muted shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-text-main">API Call Distribution</h3>
            <span className="text-xs text-text-muted font-bold px-2 py-1 bg-background-light rounded">Last 7 Days</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#716586" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#716586" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="calls" fill="#00F0FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-border-muted shadow-sm flex flex-col gap-4">
        <h3 className="font-bold text-text-main">Platform Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Avg Latency', value: '42ms', sub: 'Last hour', color: 'text-primary' },
            { label: 'Error Rate', value: '0.04%', sub: 'Healthy', color: 'text-green-600' },
            { label: 'Concurrent Users', value: '842', sub: 'Currently active', color: 'text-text-main' },
          ].map((m, i) => (
            <div key={i} className="p-4 rounded-xl bg-background-light/50 border border-border-muted flex flex-col gap-1">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{m.label}</span>
              <span className={`text-2xl font-black ${m.color}`}>{m.value}</span>
              <span className="text-xs text-text-muted italic">{m.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
