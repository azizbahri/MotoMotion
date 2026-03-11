import React, { Suspense, lazy, useMemo } from "react";
import {
  LayoutDashboard,
  Activity as ActivityIcon,
  Beaker,
  Bike,
  History,
} from "lucide-react";
import Sidebar from "./components/Sidebar";
import useStore, { BIKE_PROFILES } from "./store/useStore";
import { generateMockSession } from "./physics/engine";

const Dashboard = lazy(() => import("./views/Dashboard"));
const Telemetry = lazy(() => import("./views/Telemetry"));
const TuningLab = lazy(() => import("./views/TuningLab"));
const Garage = lazy(() => import("./views/Garage"));
const Library = lazy(() => import("./views/Library"));

export default function App() {
  const {
    activeTab,
    setActiveTab,
    isSyncing,
    startSync,
    finishSync,
    activeProfileId,
    setActiveProfileId,
    sessions,
    activeSessionId,
    setActiveSessionId,
    settings,
    setSettings,
  } = useStore();

  const activeProfile = BIKE_PROFILES[activeProfileId];
  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) || sessions[0],
    [sessions, activeSessionId]
  );

  const handleSync = () => {
    startSync();

    setTimeout(() => {
      const newSession = generateMockSession(`Sync: ${activeProfile.model}`);
      finishSync(newSession);
    }, 1800);
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "telemetry", label: "Telemetry", icon: ActivityIcon },
    { id: "tuning", label: "Tuning Lab", icon: Beaker },
    { id: "garage", label: "Garage", icon: Bike },
    { id: "history", label: "Library", icon: History },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex overflow-hidden font-sans selection:bg-cyan-500/30">
      <Sidebar
        menuItems={menuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleSync={handleSync}
        isSyncing={isSyncing}
      />

      <main className="flex-1 flex flex-col overflow-hidden bg-black">
        <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-zinc-950/30 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">
              {menuItems.find((item) => item.id === activeTab)?.label}
            </h2>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs text-white font-black italic tracking-tighter uppercase">
              {activeProfile?.model}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic tracking-tighter">
              Current Session
            </span>
            <span className="text-xs font-black text-cyan-500 uppercase italic tracking-tighter">
              {activeSession?.name}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            <Suspense
              fallback={
                <div className="h-56 grid place-items-center rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-black uppercase tracking-widest italic text-zinc-500">
                  Loading Module...
                </div>
              }
            >
              {activeTab === "dashboard" && <Dashboard activeSession={activeSession} />}
              {activeTab === "telemetry" && (
                <Telemetry rawTelemetry={activeSession?.data || []} profile={activeProfile} />
              )}
              {activeTab === "tuning" && (
                <TuningLab
                  settings={settings}
                  setSettings={setSettings}
                  rawTelemetry={activeSession?.data || []}
                  profile={activeProfile}
                />
              )}
              {activeTab === "garage" && (
                <Garage
                  profiles={BIKE_PROFILES}
                  activeProfileId={activeProfileId}
                  onSelectProfile={setActiveProfileId}
                />
              )}
              {activeTab === "history" && (
                <Library
                  sessions={sessions}
                  activeSessionId={activeSessionId}
                  onSelectSession={setActiveSessionId}
                />
              )}
            </Suspense>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #06b6d4; }
      `}</style>
    </div>
  );
}
