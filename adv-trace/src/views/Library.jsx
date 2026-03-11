import React from "react";
import { Activity as ActivityIcon } from "lucide-react";

export default function Library({ sessions, activeSessionId, onSelectSession }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-top-4 pb-20">
      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
        Session Library
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${
              activeSessionId === session.id
                ? "bg-cyan-500/5 border-cyan-500"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg ${
                  activeSessionId === session.id
                    ? "bg-cyan-500 text-black"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                <ActivityIcon size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">
                  {session.name}
                </h4>
                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">
                  {session.date}
                </p>
              </div>
            </div>
            {activeSessionId === session.id && (
              <span className="text-[10px] font-black text-cyan-500 uppercase italic">Active</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
