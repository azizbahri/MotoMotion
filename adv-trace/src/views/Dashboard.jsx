import React, { useMemo } from "react";
import { ArrowUpDown, Cpu, Beaker, Navigation, Zap, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import Card from "../components/ui/Card";
import { calculateDashboardStats } from "../physics/engine";

export default function Dashboard({ activeSession }) {
  const stats = useMemo(() => {
    const base = calculateDashboardStats(activeSession?.data || []);
    return [
      { ...base[0], icon: Navigation },
      { ...base[1], icon: Zap },
      { ...base[2], icon: RefreshCw },
    ];
  }, [activeSession]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-2 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-default"
            >
              <stat.icon size={16} className={`mb-2 ${stat.color || "text-cyan-500"}`} />
              <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-white italic">{stat.val}</p>
              <p className="text-[9px] text-zinc-600 font-mono mt-1 uppercase truncate tracking-tighter">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        <Card title="Dynamic Pitch Response (IMU)" icon={ArrowUpDown} badge="Stability Engine">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSession?.data || []}>
                <defs>
                  <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <Area
                  type="monotone"
                  dataKey="pitchRate"
                  stroke="#f59e0b"
                  fill="url(#pitchGrad)"
                  dot={false}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-2 italic">
            <span>Dive (+)</span>
            <span>Balanced Ride</span>
            <span>Bucking (-)</span>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Module Status" icon={Cpu}>
          <div className="space-y-3">
            {["Fork Pot", "Shock Pot", "Front IMU", "Rear IMU"].map((label) => (
              <div
                key={label}
                className="flex justify-between items-center text-[10px] p-2 bg-zinc-800/30 rounded border border-zinc-800"
              >
                <span className="text-zinc-500 uppercase font-bold tracking-tighter">{label}</span>
                <span className="text-cyan-500 font-mono font-black italic">ACTIVE</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Suspension Insight" icon={Beaker}>
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <p className="text-[10px] text-amber-200/70 leading-relaxed italic">
              "MotoMotion detected excessive longitudinal pitch during heavy braking. Adjusting fork
              compression is recommended to maintain ride geometry."
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
