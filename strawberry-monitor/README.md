# Berry Farm Monitor

Next.js dashboard and TypeScript “ML pipeline” layer for the [berry-farm](../README.md) project: plant health, growth stage, yield, climate, and nutrient heuristics (simulated / placeholder models today), plus a **hardware ingest API** for the **Seeed SenseCAP K1100** kit.

## Stack

- **Next.js 15** (App Router), React 19, Tailwind CSS, shadcn-style UI
- **ML pipeline code**: `src/lib/ml/` — orchestrated by `MLPipeline` and `DataPipeline`
- **Hardware**: `src/lib/hardware/sensecap-k1100.ts`, `POST /api/ingest/k1100`

## Getting started

```bash
cd strawberry-monitor
npm install
npm run dev
```

- **App**: [http://localhost:3000](http://localhost:3000)
- **ML demo**: [http://localhost:3000/ml-demo](http://localhost:3000/ml-demo)

Other scripts: `npm run build`, `npm run start`, `npm run lint`.

## Environment variables

Copy `.env.example` to `.env.local` if you use ingest auth:

| Variable | Purpose |
|----------|---------|
| `K1100_INGEST_SECRET` | If set, `POST /api/ingest/k1100` requires `Authorization: Bearer <same value>` |

## SenseCAP K1100 ingest

`POST /api/ingest/k1100` accepts JSON from a Wio Terminal (Wi‑Fi), or from a LoRaWAN → HTTP relay.

**Required fields:** `temperatureC`, `humidityPct`, `soilMoisturePct`  
**Optional:** `lightLux`, `ph`, `ec`, `tvocPpb`, `eco2Ppm`, `deviceId`, `recordedAt` (ISO 8601). Snake_case field names are also accepted.

The kit does not include pH, EC, or lux; omitted values use documented defaults until you add sensors. Full notes and architecture links: **[ML_PIPELINE_README.md](./ML_PIPELINE_README.md)** (section *SenseCAP K1100 hardware ingest*).

## Project layout

```
strawberry-monitor/
├── src/app/                 # Pages & API routes
│   ├── api/ingest/k1100/    # Hardware POST endpoint
│   ├── ml-demo/
│   └── page.tsx
├── src/components/ml/       # MLDashboard, etc.
├── src/lib/ml/              # Pipeline and model stubs
└── src/lib/hardware/        # K1100 payload parsing
```

## Documentation

- **[ML_PIPELINE_README.md](./ML_PIPELINE_README.md)** — pipeline APIs, data shapes, batch processing, K1100 integration

## Deploy

Compatible with [Vercel](https://vercel.com) and similar Node hosts. Set `K1100_INGEST_SECRET` in the host’s env if you enable ingest authentication.
