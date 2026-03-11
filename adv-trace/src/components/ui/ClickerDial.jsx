import React from "react";

export default function ClickerDial({
  label,
  value,
  onChange,
  min = 0,
  max = 22,
  unit = "Clicks",
}) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-zinc-800/20 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all group">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-zinc-500 uppercase group-hover:text-zinc-300">
          {label}
        </span>
        <span className="text-sm font-black text-cyan-400 font-mono tracking-tighter">
          {value} <span className="text-[8px] text-zinc-600">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
      />
    </div>
  );
}
