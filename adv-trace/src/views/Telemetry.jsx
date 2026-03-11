import React from "react";
import { Activity, Gauge, Zap, Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import Card from "../components/ui/Card";

export default function Telemetry({ rawTelemetry, profile }) {
  const chartConfig = {
    strokeWidth: 2,
    dot: false,
    grid: { strokeDasharray: "3 3", stroke: "#27272a", vertical: false },
    tooltip: {
      backgroundColor: "#18181b",
      border: "1px solid #27272a",
      borderRadius: "8px",
      fontSize: "10px",
    },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <Card title="Suspension Displacement (mm)" icon={Activity} badge="Linear Potentiometers">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rawTelemetry || []}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#52525b" fontSize={9} domain={[0, profile.frontTravel]} />
              <Tooltip contentStyle={chartConfig.tooltip} />
              <Line
                type="monotone"
                dataKey="forkTravel"
                stroke="#06b6d4"
                name="Front Travel"
                strokeWidth={chartConfig.strokeWidth}
                dot={chartConfig.dot}
              />
              <Line
                type="monotone"
                dataKey="shockTravel"
                stroke="#ec4899"
                name="Rear Travel"
                strokeWidth={chartConfig.strokeWidth}
                dot={chartConfig.dot}
              />
              <Legend
                wrapperStyle={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  paddingTop: "10px",
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Piston Velocity (mm/s)" icon={Gauge} badge="Derivative Logic">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rawTelemetry || []}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#52525b" fontSize={9} />
              <Tooltip contentStyle={chartConfig.tooltip} />
              <Area
                type="monotone"
                dataKey="forkVelocity"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.1}
                name="F-Velocity"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="shockVelocity"
                stroke="#ec4899"
                fill="#ec4899"
                fillOpacity={0.1}
                name="R-Velocity"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[8px] text-zinc-600 mt-2 uppercase font-bold tracking-widest italic">
          High Velocity indicates square-edge hits / Low velocity indicates chassis undulations.
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Front Chassis Dynamics (G)" icon={Zap} badge="IMU Node 01">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rawTelemetry || []}>
                <CartesianGrid {...chartConfig.grid} />
                <XAxis dataKey="timestamp" stroke="#52525b" fontSize={9} tickFormatter={(v) => `${v}s`} />
                <YAxis stroke="#52525b" fontSize={9} />
                <Tooltip contentStyle={chartConfig.tooltip} />
                <Line type="monotone" dataKey="frontAccelZ" stroke="#06b6d4" name="Vertical (Z)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="frontAccelX" stroke="#f59e0b" name="Longitudinal (X)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="frontAccelY" stroke="#22c55e" name="Lateral (Y)" strokeWidth={1} dot={false} />
                <Legend wrapperStyle={{ fontSize: "9px", textTransform: "uppercase" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Rear Chassis Dynamics (G)" icon={Zap} badge="IMU Node 02">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rawTelemetry || []}>
                <CartesianGrid {...chartConfig.grid} />
                <XAxis dataKey="timestamp" stroke="#52525b" fontSize={9} tickFormatter={(v) => `${v}s`} />
                <YAxis stroke="#52525b" fontSize={9} />
                <Tooltip contentStyle={chartConfig.tooltip} />
                <Line type="monotone" dataKey="rearAccelZ" stroke="#ec4899" name="Vertical (Z)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="rearAccelX" stroke="#f59e0b" name="Longitudinal (X)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="rearAccelY" stroke="#22c55e" name="Lateral (Y)" strokeWidth={1} dot={false} />
                <Legend wrapperStyle={{ fontSize: "9px", textTransform: "uppercase" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-start gap-4">
        <Info size={24} className="text-cyan-500 mt-1" />
        <div>
          <h4 className="text-xs font-black text-white uppercase mb-1 italic">Correlation Engine</h4>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            By aligning <strong>Linear Displacement</strong> with <strong>Chassis G-Loads</strong>,
            MotoMotion can identify if a bottoming event was caused by a massive vertical impact
            (High Z-Accel) or an excessive weight transfer during braking (High X-Accel).
            Professional tuners use this data to differentiate between Spring Rate needs and
            Damping needs.
          </p>
        </div>
      </div>
    </div>
  );
}
