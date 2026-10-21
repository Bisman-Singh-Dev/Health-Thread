"use client";

import { Activity, Heart, Moon, Wind, Radio, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const heartRateData = [
  { time: "00:00", value: 0 }, { time: "04:00", value: 0 },
  { time: "08:00", value: 0 }, { time: "12:00", value: 0 },
  { time: "16:00", value: 0 }, { time: "20:00", value: 0 },
];

const sleepData = [
  { day: "Mon", hours: 0 }, { day: "Tue", hours: 0 },
  { day: "Wed", hours: 0 }, { day: "Thu", hours: 0 },
  { day: "Fri", hours: 0 }, { day: "Sat", hours: 0 },
  { day: "Sun", hours: 0 },
];

export default function MyHealthTab({ user }: { user: any }) {
  const isConnected = false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#00a896] text-xs font-semibold mb-2">
            <Radio className="w-3.5 h-3.5" />
            <span>Beacon Connected Ecosystem</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Beacon Physiological Telemetry</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Real-time vitals and biometrics stream from Beacon Home Health Hub.</p>
        </div>
        
        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 ${isConnected ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></div>
          <span>{isConnected ? "Beacon Connected" : "Hub In Standby"}</span>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          icon={<Heart className="w-5 h-5 text-[#00a896]" />}
          title="Resting Heart Rate"
          value={isConnected ? "72" : "0"}
          unit="bpm"
          trend={isConnected ? "Optimal" : "--"}
          trendUp={true}
        />
        <StatCard 
          icon={<Moon className="w-5 h-5 text-[#0077b6]" />}
          title="Sleep Architecture"
          value={isConnected ? "7h 12m" : "0h 0m"}
          unit="avg"
          trend={isConnected ? "+15 min" : "--"}
          trendUp={true}
        />
        <StatCard 
          icon={<Wind className="w-5 h-5 text-[#48cae4]" />}
          title="Blood Oxygen (SpO2)"
          value={isConnected ? "98" : "0"}
          unit="%"
          trend={isConnected ? "Normal" : "--"}
          trendUp={true}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Heart Rate Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Heart Rate Trend (24h Telemetry)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heartRateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a896" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00a896" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00a896" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4">Sleep Recovery Duration (7 Days)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="hours" fill="#0077b6" radius={[6, 6, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Connection Prompt */}
      {!isConnected && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-3 text-[#00a896]">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <h4 className="font-bold text-slate-900 mb-1 text-base">Connect Beacon Home Hub</h4>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-5 leading-relaxed">
            Link your Beacon device to automatically stream heart rate, respiratory rhythms, and sleep architecture into your Vault.
          </p>
          <button className="px-5 py-2.5 bg-[#00a896] hover:bg-[#0077b6] text-white rounded-xl text-xs font-bold transition-colors shadow-2xs">
            Pair Beacon Hub Now
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, title, value, unit, trend, trendUp }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#00a896] transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp && trend !== "--" ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500">{title}</p>
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          <span className="text-xs text-slate-400 font-medium">{unit}</span>
        </div>
      </div>
    </div>
  );
}
