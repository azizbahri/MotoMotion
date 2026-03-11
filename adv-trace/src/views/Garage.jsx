import React from "react";

export default function Garage({ profiles, activeProfileId, onSelectProfile }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-top-4">
      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter underline decoration-cyan-500 decoration-4 underline-offset-8">
        Garage
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.values(profiles).map((profile) => (
          <button
            key={profile.id}
            onClick={() => onSelectProfile(profile.id)}
            className={`p-6 rounded-2xl border text-left transition-all ${
              activeProfileId === profile.id
                ? "bg-cyan-500/5 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">
              {profile.manufacturer}
            </p>
            <h3 className="text-xl font-black text-white italic leading-none mb-4">{profile.model}</h3>
            <div className="flex gap-4 text-[10px] text-zinc-500 font-mono uppercase font-bold">
              <span>F: {profile.frontTravel}mm</span>
              <span>R: {profile.rearTravel}mm</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
