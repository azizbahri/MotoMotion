import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ReferenceArea, BarChart, Bar, Legend
} from 'recharts';
import { 
  Settings2, Activity, Zap, Map as MapIcon, Info, RefreshCw,
  AlertTriangle, ChevronRight, LayoutDashboard, Database, Beaker, 
  Bike, History, Gauge, CheckCircle2, Bluetooth, Signal, Cpu, 
  Trash2, PlayCircle, ArrowUpDown, Navigation, Timer, Activity as ActivityIcon,
  Maximize2
} from 'lucide-react';

// ==========================================
// 1. PHYSICS ENGINE (Enhanced Data Stream)
// ==========================================

const PhysicsEngine = {
  calculateSimulatedPath: (rawData, settings, profile) => {
    if (!rawData || !profile) return [];
    
    const fCompK = 1 + (settings.frontCompClicks - 12) * 0.05;
    const rCompK = 1 + (settings.rearCompClicks - 12) * 0.05;
    const fRebK = 1 + (settings.frontReboundClicks - 12) * 0.08;
    const rRebK = 1 + (settings.rearReboundClicks - 12) * 0.08;

    return rawData.map((frame, i) => {
      const prevFrame = rawData[i - 1] || frame;
      const velocity = frame.forkTravel - prevFrame.forkTravel;
      const isExtending = velocity < 0;

      const fMod = isExtending ? fRebK : fCompK;
      const rMod = isExtending ? rRebK : rCompK;

      return {
        ...frame,
        forkTravel: frame.forkTravel * fMod,
        shockTravel: frame.shockTravel * rMod,
        isSimulated: true
      };
    });
  },

  generateMockSession: (label = "Log Session") => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      const time = i / 10;
      const impact = (i >= 45 && i <= 55) ? Math.sin((i - 45) * 0.35) * 75 : 0;
      const reboundTail = (i > 55 && i < 80) ? Math.sin((i - 55) * 0.5) * (10 * (1 - (i - 55) / 25)) : 0;

      // Displacement
      const forkTravel = 50 + Math.sin(time * 2) * 5 + impact + reboundTail;
      const shockTravel = 35 + Math.sin(time * 1.5) * 3 + (impact * 0.6) + (reboundTail * 0.4);

      // IMU Data (Front)
      const fAccelZ = 1 + (impact > 0 ? (impact * 0.04) : Math.random() * 0.1); // Vertical hit
      const fAccelX = impact > 0 ? -0.5 : 0.1; // Longitudinal (Braking/Acceleration)
      const fAccelY = Math.sin(time) * 0.3; // Lateral (Cornering/Lean)

      // IMU Data (Rear) - Slighly delayed and different magnitude
      const rAccelZ = 1 + (i > 48 && i < 60 ? Math.sin((i-48)*0.35)*3.2 : Math.random() * 0.1);
      const rAccelX = impact > 0 ? 0.2 : 0.4;
      const rAccelY = Math.sin(time) * 0.25;

      data.push({
        timestamp: time,
        forkTravel,
        shockTravel,
        frontAccelX: fAccelX,
        frontAccelY: fAccelY,
        frontAccelZ: fAccelZ,
        rearAccelX: rAccelX,
        rearAccelY: rAccelY,
        rearAccelZ: rAccelZ,
        // Calculated Velocity (mm/s based on 100Hz sampling)
        forkVelocity: (forkTravel - (data[i-1]?.forkTravel || forkTravel)) * 100,
        shockVelocity: (shockTravel - (data[i-1]?.shockTravel || shockTravel)) * 100,
        pitchRate: (fAccelZ - rAccelZ) * 8,
      });
    }
    return { id: Math.random().toString(36).substr(2, 9), name: label, date: new Date().toLocaleTimeString(), data };
  }
};

// ==========================================
// 2. CONFIGURATION DATA
// ==========================================

const BIKE_PROFILES = {
  t700_2025: {
    id: 't700_2025',
    manufacturer: 'Yamaha',
    model: 'Tenere 700',
    year: '2025',
    hardware: 'KYB 43mm / Monocross',
    frontTravel: 210,
    rearTravel: 200,
    dampingSensitivity: 0.045,
  },
  ktm890_2024: {
    id: 'ktm890_2024',
    manufacturer: 'KTM',
    model: '890 Adventure R',
    year: '2024',
    hardware: 'WP XPLOR Pro',
    frontTravel: 240,
    rearTravel: 240,
    dampingSensitivity: 0.055,
  }
};

// ==========================================
// 3. UI COMPONENTS
// ==========================================

const Card = ({ title, icon: Icon, children, className = "", badge }) => (
  <div className={`bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col ${className}`}>
    <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-cyan-500" />}
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.1em]">{title}</h3>
      </div>
      {badge && <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">{badge}</span>}
    </div>
    <div className="p-4 flex-1">{children}</div>
  </div>
);

const ClickerDial = ({ label, value, onChange, min = 0, max = 22, unit = "Clicks" }) => (
  <div className="flex flex-col gap-2 p-3 bg-zinc-800/20 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all group">
    <div className="flex justify-between items-center">
      <span className="text-[9px] font-bold text-zinc-500 uppercase group-hover:text-zinc-300">{label}</span>
      <span className="text-sm font-black text-cyan-400 font-mono tracking-tighter">{value} <span className="text-[8px] text-zinc-600">{unit}</span></span>
    </div>
    <input 
      type="range" min={min} max={max} value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
    />
  </div>
);

// ==========================================
// 4. MAIN VIEWS
// ==========================================

const DashboardView = ({ profile, activeSession }) => {
  const stats = useMemo(() => {
    const data = activeSession?.data || [];
    const avgPitch = data.length > 0 ? data.reduce((acc, curr) => acc + Math.abs(curr.pitchRate), 0) / data.length : 0;
    const flatness = Math.max(0, 100 - (avgPitch * 10)).toFixed(0);

    return [
      { label: 'Chassis Flatness', val: `${flatness}%`, sub: flatness > 80 ? 'Stable' : 'High Pitch Rate', icon: Navigation, color: flatness > 80 ? 'text-green-500' : 'text-amber-500' },
      { label: 'Max Vertical Load', val: '3.2 G', sub: 'Rear Chassis IMU', icon: Zap, color: 'text-cyan-500' },
      { label: 'Stroke Sync', val: '94%', sub: 'Fork/Shock Timing', icon: RefreshCw, color: 'text-cyan-500' },
    ];
  }, [activeSession]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="md:col-span-2 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors cursor-default">
              <stat.icon size={16} className={`mb-2 ${stat.color || 'text-cyan-500'}`} />
              <p className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-white italic">{stat.val}</p>
              <p className="text-[9px] text-zinc-600 font-mono mt-1 uppercase truncate tracking-tighter">{stat.sub}</p>
            </div>
          ))}
        </div>
        <Card title="Dynamic Pitch Response (IMU)" icon={ArrowUpDown} badge="Stability Engine">
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSession?.data || []}>
                <defs>
                  <linearGradient id="pitchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <Area type="monotone" dataKey="pitchRate" stroke="#f59e0b" fill="url(#pitchGrad)" dot={false} strokeWidth={2} />
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
            {['Fork Pot', 'Shock Pot', 'Front IMU', 'Rear IMU'].map(label => (
              <div key={label} className="flex justify-between items-center text-[10px] p-2 bg-zinc-800/30 rounded border border-zinc-800">
                <span className="text-zinc-500 uppercase font-bold tracking-tighter">{label}</span>
                <span className="text-cyan-500 font-mono font-black italic">ACTIVE</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Suspension Insight" icon={Beaker}>
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <p className="text-[10px] text-amber-200/70 leading-relaxed italic italic">
              "MotoMotion detected excessive longitudinal pitch during heavy braking. Adjusting fork compression is recommended to maintain ride geometry."
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const TelemetryView = ({ rawTelemetry, profile }) => {
  const chartConfig = {
    strokeWidth: 2,
    dot: false,
    grid: { strokeDasharray: "3 3", stroke: "#27272a", vertical: false },
    tooltip: { backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* CHANNEL 1: DISPLACEMENT */}
      <Card title="Suspension Displacement (mm)" icon={Activity} badge="Linear Potentiometers">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rawTelemetry || []}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#52525b" fontSize={9} domain={[0, profile.frontTravel]} />
              <Tooltip contentStyle={chartConfig.tooltip} />
              <Line type="monotone" dataKey="forkTravel" stroke="#06b6d4" name="Front Travel" strokeWidth={chartConfig.strokeWidth} dot={chartConfig.dot} />
              <Line type="monotone" dataKey="shockTravel" stroke="#ec4899" name="Rear Travel" strokeWidth={chartConfig.strokeWidth} dot={chartConfig.dot} />
              <Legend wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', paddingTop: '10px' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* CHANNEL 2: VELOCITY */}
      <Card title="Piston Velocity (mm/s)" icon={Gauge} badge="Derivative Logic">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rawTelemetry || []}>
              <CartesianGrid {...chartConfig.grid} />
              <XAxis dataKey="timestamp" hide />
              <YAxis stroke="#52525b" fontSize={9} />
              <Tooltip contentStyle={chartConfig.tooltip} />
              <Area type="monotone" dataKey="forkVelocity" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.1} name="F-Velocity" dot={false} />
              <Area type="monotone" dataKey="shockVelocity" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} name="R-Velocity" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[8px] text-zinc-600 mt-2 uppercase font-bold tracking-widest italic">High Velocity indicates square-edge hits / Low velocity indicates chassis undulations.</p>
      </Card>

      {/* CHANNEL 3: FRONT IMU DYNAMICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Front Chassis Dynamics (G)" icon={Zap} badge="IMU Node 01">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rawTelemetry || []}>
                <CartesianGrid {...chartConfig.grid} />
                <XAxis dataKey="timestamp" stroke="#52525b" fontSize={9} tickFormatter={v => `${v}s`} />
                <YAxis stroke="#52525b" fontSize={9} />
                <Tooltip contentStyle={chartConfig.tooltip} />
                <Line type="monotone" dataKey="frontAccelZ" stroke="#06b6d4" name="Vertical (Z)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="frontAccelX" stroke="#f59e0b" name="Longitudinal (X)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="frontAccelY" stroke="#22c55e" name="Lateral (Y)" strokeWidth={1} dot={false} />
                <Legend wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* CHANNEL 4: REAR IMU DYNAMICS */}
        <Card title="Rear Chassis Dynamics (G)" icon={Zap} badge="IMU Node 02">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rawTelemetry || []}>
                <CartesianGrid {...chartConfig.grid} />
                <XAxis dataKey="timestamp" stroke="#52525b" fontSize={9} tickFormatter={v => `${v}s`} />
                <YAxis stroke="#52525b" fontSize={9} />
                <Tooltip contentStyle={chartConfig.tooltip} />
                <Line type="monotone" dataKey="rearAccelZ" stroke="#ec4899" name="Vertical (Z)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="rearAccelX" stroke="#f59e0b" name="Longitudinal (X)" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="rearAccelY" stroke="#22c55e" name="Lateral (Y)" strokeWidth={1} dot={false} />
                <Legend wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase' }} />
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
            By aligning <strong>Linear Displacement</strong> with <strong>Chassis G-Loads</strong>, MotoMotion can identify if a bottoming event was caused by a massive vertical impact (High Z-Accel) or an excessive weight transfer during braking (High X-Accel). Professional tuners use this data to differentiate between Spring Rate needs and Damping needs.
          </p>
        </div>
      </div>
    </div>
  );
};

const TuningLabView = ({ settings, setSettings, rawTelemetry, profile }) => {
  const simulatedData = useMemo(() => PhysicsEngine.calculateSimulatedPath(rawTelemetry, settings, profile), [settings, rawTelemetry, profile]);
  const chartData = useMemo(() => {
    if (!rawTelemetry) return [];
    return rawTelemetry.map((f, i) => ({ 
      ...f, 
      simFork: (simulatedData && simulatedData[i]) ? simulatedData[i].forkTravel : f.forkTravel,
      simShock: (simulatedData && simulatedData[i]) ? simulatedData[i].shockTravel : f.shockTravel,
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
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', fontSize: '10px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }} />
                
                <ReferenceArea y1={profile.frontTravel * 0.9} y2={profile.frontTravel} fill="#ef4444" fillOpacity={0.05} />
                
                <Area type="monotone" dataKey="forkTravel" name="Recorded (F)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.02} dot={false} strokeWidth={1} />
                <Area type="monotone" dataKey="simFork" name="Predictive (F)" stroke="#f59e0b" strokeDasharray="4 4" fill="transparent" dot={false} strokeWidth={2} />
                
                <Area type="monotone" dataKey="shockTravel" name="Recorded (R)" stroke="#ec4899" fill="#ec4899" fillOpacity={0.02} dot={false} strokeWidth={1} />
                <Area type="monotone" dataKey="simShock" name="Predictive (R)" stroke="#a855f7" strokeDasharray="4 4" fill="transparent" dot={false} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
           <Card title="Front Suspension" icon={Settings2}>
             <div className="space-y-3">
               <ClickerDial label="Comp (In-Stroke)" value={settings.frontCompClicks} onChange={v => setSettings({...settings, frontCompClicks: v})} />
               <ClickerDial label="Reb (Out-Stroke)" value={settings.frontReboundClicks} onChange={v => setSettings({...settings, frontReboundClicks: v})} />
             </div>
           </Card>
           <Card title="Rear Shock" icon={Settings2}>
              <div className="space-y-3">
                <ClickerDial label="Comp (In-Stroke)" value={settings.rearCompClicks} onChange={v => setSettings({...settings, rearCompClicks: v})} />
                <ClickerDial label="Reb (Out-Stroke)" value={settings.rearReboundClicks} onChange={v => setSettings({...settings, rearReboundClicks: v})} />
              </div>
           </Card>
        </div>
      </div>
      
      <div className="lg:col-span-4 space-y-6">
        <Card title="Dynamic Prediction" icon={History}>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
               <p className="text-[11px] text-zinc-400 italic">
                "Virtual ride dynamic modeling suggests that stiffening compression will reduce peak dive by 14.2mm, while increasing rear rebound will stabilize the rebound kick."
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
};

// ==========================================
// 5. APP ENTRY POINT
// ==========================================

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState('t700_2025');
  
  const [sessions, setSessions] = useState([
    { id: 'm1', name: 'Baseline: Technical Loop', date: 'Oct 24, 14:30', data: PhysicsEngine.generateMockSession().data }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('m1');
  
  const activeProfile = BIKE_PROFILES[activeProfileId];
  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || sessions[0], [sessions, activeSessionId]);
  
  const [settings, setSettings] = useState({ 
    frontCompClicks: 12, frontReboundClicks: 12, 
    rearCompClicks: 12, rearReboundClicks: 12 
  });

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const newSession = PhysicsEngine.generateMockSession(`Sync: ${activeProfile.model}`);
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setIsSyncing(false);
      setActiveTab('dashboard');
    }, 1800); 
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'telemetry', label: 'Telemetry', icon: ActivityIcon },
    { id: 'tuning', label: 'Tuning Lab', icon: Beaker },
    { id: 'garage', label: 'Garage', icon: Bike },
    { id: 'history', label: 'Library', icon: History },
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex overflow-hidden font-sans selection:bg-cyan-500/30">
      
      <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950/50 backdrop-blur-xl">
        <div className="p-8">
          <h1 className="text-xl font-black text-white italic flex items-center gap-2 tracking-tighter">
            <div className="w-4 h-4 rounded bg-cyan-600 rotate-45 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            MOTO<span className="text-cyan-500 underline decoration-2 underline-offset-4">MOTION</span>
          </h1>
          <p className="text-[8px] text-zinc-600 font-bold uppercase mt-2 tracking-[0.2em] italic">Motion Engineering Suite</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-500 shadow-inner' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
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
              <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Hardware Link: Offline</span>
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

      <main className="flex-1 flex flex-col overflow-hidden bg-black">
        <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-8 bg-zinc-950/30 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em]">{menuItems.find(m => m.id === activeTab)?.label}</h2>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="text-xs text-white font-black italic tracking-tighter uppercase">{activeProfile?.model}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic tracking-tighter">Current Session</span>
            <span className="text-xs font-black text-cyan-500 uppercase italic tracking-tighter">{activeSession?.name}</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView profile={activeProfile} activeSession={activeSession} />}
            {activeTab === 'telemetry' && <TelemetryView rawTelemetry={activeSession?.data || []} profile={activeProfile} />}
            {activeTab === 'tuning' && <TuningLabView settings={settings} setSettings={setSettings} rawTelemetry={activeSession?.data || []} profile={activeProfile} />}
            {activeTab === 'garage' && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-top-4">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic underline decoration-cyan-500 decoration-4 underline-offset-8">Garage</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(BIKE_PROFILES).map((p) => (
                    <button key={p.id} onClick={() => setActiveProfileId(p.id)} className={`p-6 rounded-2xl border text-left transition-all ${activeProfileId === p.id ? 'bg-cyan-500/5 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.15)]' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}>
                      <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">{p.manufacturer}</p>
                      <h3 className="text-xl font-black text-white italic leading-none mb-4">{p.model}</h3>
                      <div className="flex gap-4 text-[10px] text-zinc-500 font-mono uppercase font-bold">
                        <span>F: {p.frontTravel}mm</span>
                        <span>R: {p.rearTravel}mm</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'history' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-top-4 pb-20">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">Session Library</h2>
                <div className="grid grid-cols-1 gap-4">
                  {sessions.map((session) => (
                    <div key={session.id} onClick={() => setActiveSessionId(session.id)} className={`flex items-center justify-between p-5 rounded-xl border cursor-pointer transition-all ${activeSessionId === session.id ? 'bg-cyan-500/5 border-cyan-500' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${activeSessionId === session.id ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}><ActivityIcon size={20} /></div>
                        <div>
                          <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">{session.name}</h4>
                          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">{session.date}</p>
                        </div>
                      </div>
                      {activeSessionId === session.id && <span className="text-[10px] font-black text-cyan-500 uppercase italic">Active</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
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