import { create } from "zustand";
import { generateMockSession } from "../physics/engine";

export const BIKE_PROFILES = {
  t700_2025: {
    id: "t700_2025",
    manufacturer: "Yamaha",
    model: "Tenere 700",
    year: "2025",
    hardware: "KYB 43mm / Monocross",
    frontTravel: 210,
    rearTravel: 200,
    dampingSensitivity: 0.045,
  },
  ktm890_2024: {
    id: "ktm890_2024",
    manufacturer: "KTM",
    model: "890 Adventure R",
    year: "2024",
    hardware: "WP XPLOR Pro",
    frontTravel: 240,
    rearTravel: 240,
    dampingSensitivity: 0.055,
  },
};

const useStore = create((set) => ({
  activeTab: "dashboard",
  isSyncing: false,
  activeProfileId: "t700_2025",
  sessions: [
    {
      id: "m1",
      name: "Baseline: Technical Loop",
      date: "Oct 24, 14:30",
      data: generateMockSession().data,
    },
  ],
  activeSessionId: "m1",
  settings: {
    frontCompClicks: 12,
    frontReboundClicks: 12,
    rearCompClicks: 12,
    rearReboundClicks: 12,
  },

  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveProfileId: (activeProfileId) => set({ activeProfileId }),
  setActiveSessionId: (activeSessionId) => set({ activeSessionId }),
  setSettings: (settings) => set({ settings }),

  startSync: () => set({ isSyncing: true }),
  finishSync: (newSession) =>
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSessionId: newSession.id,
      isSyncing: false,
      activeTab: "dashboard",
    })),
}));

export default useStore;
