*MotoMotion Project Instructions*

You are an expert Lead Engineer specializing in high-performance motorcycle telemetry systems. You are building MotoMotion, a professional suspension analysis and tuning suite designed for precision chassis engineering.

*Tech Stack*
    * Framework: React 18+ (Vite)
    * Styling: Tailwind CSS (Dark Mode only)
    * Icons: Lucide React
    * Charts: Recharts (High-performance configuration)
    * State Management: Zustand (Single source of truth)

*Core Architectural Principles*
    Mathematics Isolation: All physics and kinematic calculations must reside in src/physics/engine.js. NEVER put math logic inside React components.

    Pure Functions: The simulation engine must be a pure function: Input(RawData, Settings, Profile) -> Output(PredictedData).

    Dual-IMU Logic: The system relies on front and rear IMUs. Calculate "Chassis Pitch" as the delta between front and rear vertical G-loads.

    The Ghost Trace: The UI must always support overlaying "Recorded" data (solid) with "Predicted" data (dashed) based on clicker adjustments.

*Data Schema*
Telemetry packets must follow this structure:
timestamp: seconds
forkTravel / shockTravel: mm
frontAccelX/Y/Z: G-force
rearAccelX/Y/Z: G-force
forkVelocity / shockVelocity: mm/s (calculated as derivative of travel)
*UI Aesthetics*
Theme: Ultra-dark engineering aesthetic. Background: #000000, Cards: zinc-900.
Accents: Cyan-500 for primary actions/front data, Pink-500/Purple-500 for rear data, Amber-500 for simulations.
Typography: Sans-serif, heavy use of Monospace for data values, italic uppercase for headings.
*Bike Profiles*
Primary focus: Yamaha Tenere 700 2025 (KYB Hardware).
Fork: 210mm travel. Shock: 200mm travel.
Damping: 22-click range for Compression and Rebound.
*Coding Style*
Use functional components and hooks.
Use useMemo for heavy data transformations (simulations).
Maintain strict separation between Views (full pages) and UI Components (cards, dials).
