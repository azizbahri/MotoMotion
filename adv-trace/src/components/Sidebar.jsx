import React from "react";
import { RefreshCw } from "lucide-react";

export default function Sidebar({
  menuItems,
  activeTab,
  setActiveTab,
  handleSync,
  isSyncing,
}) {
  return (
    <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950/50 backdrop-blur-xl">
      <div className="p-8">
        <h1 className="text-xl font-black text-white italic flex items-center gap-2 tracking-tighter">
          <div className="w-4 h-4 rounded bg-cyan-600 rotate-45 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
          MOTO
          <span className="text-cyan-500 underline decoration-2 underline-offset-4">MOTION</span>
        </h1>
        <p className="text-[8px] text-zinc-600 font-bold uppercase mt-2 tracking-[0.2em] italic">
          Motion Engineering Suite
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
              activeTab === item.id
                ? "bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 shadow-inner"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-900/50">
        <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
              Hardware Link: Offline
            </span>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-2 italic border border-zinc-700"
          >
            <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "ACQUIRING..." : "SYNC MOTO LOG"}
          </button>
        </div>
      </div>
    </aside>
  );
}
