# MotoMotion
a motorcycle tuning utility

## Run the modular app (`adv-trace`)

### Prerequisites
- Node.js 18+
- npm 9+

### Start locally
```bash
cd adv-trace
npm install
npm run dev
```

From the repository root, you can also run:
```bash
npm run dev:adv
```
This script starts Vite on `http://localhost:5173` using a fixed host/port.

Open the local URL printed by Vite (typically `http://localhost:5173`).

### Localhost troubleshooting
- `http://localhost` (without a port) uses port `80`, which is not this app.
- Open the Vite URL with a port, such as `http://localhost:5173`.
- If port `5173` is busy, Vite may switch to `5174` (or another port).
- To force a stable port:
```bash
cd adv-trace
npm run dev -- --port 5173
```
- If you use `npm run dev:adv`, it is configured with `--strictPort`, so stop the process using `5173` and run again.

### Common gotcha
- Do not open `adv-trace/index.html` directly in the browser.
- Always run `npm run dev` inside `adv-trace` and use the Vite URL so React and Tailwind load correctly.

### Production build
```bash
cd adv-trace
npm run build
npm run preview
```

From the repository root, shortcuts are also available:
```bash
npm run build:adv
npm run preview:adv
```
