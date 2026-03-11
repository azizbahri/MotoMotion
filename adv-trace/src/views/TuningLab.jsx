import React, { useMemo } from "react";
import { Beaker, History, Settings2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import Card from "../components/ui/Card";
import ClickerDial from "../components/ui/ClickerDial";
import { calculateSimulatedPath } from "../physics/engine";

export default function TuningLab({ settings, setSettings, rawTelemetry, profile }) {
  const simulatedData = useMemo(
    () => calculateSimulatedPath(rawTelemetry, settings, profile),
    [settings, rawTelemetry, profile]
  );

  const chartData = useMemo(() => {
    if (!rawTelemetry) return [];

    return rawTelemetry.map((frame, i) => ({
      ...frame,
      simFork: simulatedData?.[i] ? simulatedData[i].forkTravel : frame.forkTravel,
      simShock: simulatedData?.[i] ? simulatedData[i].shockTravel : frame.shockTravel,
    }));
  }, [rawTelemetry, simulatedData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in zoom-in-95 duration-500">
      <div className="lg:col-span-8 space-y-6">
        <Card title="Predictive Multi-Channel Trace" icon={Beaker} badge="Simulation Engine">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    fontSize: "10px",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  wrapperStyle={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}
                />

                <ReferenceArea
                  y1={profile.frontTravel * 0.9}
                  y2={profile.frontTravel}
                  fill="#ef4444"
                  fillOpacity={0.05}
                />

                <Area
                  type="monotone"
                  dataKey="forkTravel"
                  name="Recorded (F)"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.02}
                  dot={false}
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="simFork"
                  name="Predictive (F)"
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  fill="transparent"
                  dot={false}
                  strokeWidth={2}
                />

                <Area
                  type="monotone"
                  dataKey="shockTravel"
                  name="Recorded (R)"
                  stroke="#ec4899"
                  fill="#ec4899"
                  fillOpacity={0.02}
                  dot={false}
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="simShock"
                  name="Predictive (R)"
                  stroke="#a855f7"
                  strokeDasharray="4 4"
                  fill="transparent"
                  dot={false}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card title="Front Suspension" icon={Settings2}>
            <div className="space-y-3">
              <ClickerDial
                label="Comp (In-Stroke)"
                value={settings.frontCompClicks}
                onChange={(value) => setSettings({ ...settings, frontCompClicks: value })}
              />
              <ClickerDial
                label="Reb (Out-Stroke)"
                value={settings.frontReboundClicks}
                onChange={(value) => setSettings({ ...settings, frontReboundClicks: value })}
              />
            </div>
          </Card>

          <Card title="Rear Shock" icon={Settings2}>
            <div className="space-y-3">
              <ClickerDial
                label="Comp (In-Stroke)"
                value={settings.rearCompClicks}
                onChange={(value) => setSettings({ ...settings, rearCompClicks: value })}
              />
              <ClickerDial
                label="Reb (Out-Stroke)"
                value={settings.rearReboundClicks}
                onChange={(value) => setSettings({ ...settings, rearReboundClicks: value })}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <Card title="Dynamic Prediction" icon={History}>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
              <p className="text-[11px] text-zinc-400 italic">
                "Virtual ride dynamic modeling suggests that stiffening compression will reduce peak
                dive by 14.2mm, while increasing rear rebound will stabilize the rebound kick."
              </p>
            </div>
            <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase text-[10px] tracking-widest rounded-lg shadow-xl">
              COMMIT SETUP
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
