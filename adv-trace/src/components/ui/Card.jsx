import React from "react";

export default function Card({ title, icon: Icon, children, className = "", badge }) {
  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col ${className}`}>
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-cyan-500" />}
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.1em]">{title}</h3>
        </div>
        {badge && (
          <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            {badge}
          </span>
        )}
      </div>
      <div className="p-4 flex-1">{children}</div>
    </div>
  );
}
