# Berry farm — web app

Next.js app for the [berry-farm](../README.md) repo. Starts minimal: **sensor ingest** from your **SenseCAP K1100** (Wio Terminal).

## Setup

```bash
cd strawberry-monitor
npm install
npm run dev
```

- Home: [http://localhost:3000](http://localhost:3000)
- Ingest: `POST http://localhost:3000/api/ingest/k1100`

Copy `.env.example` to `.env.local` and set `K1100_INGEST_SECRET` if you want Bearer auth on ingest.

## Ingest JSON

**Required:** `temperatureC`, `humidityPct`, `soilMoisturePct`  
**Optional:** `lightLux`, `ph`, `ec`, `tvocPpb`, `eco2Ppm`, `deviceId`, `recordedAt` (ISO 8601).  
Snake_case aliases: `temperature_c`, `humidity_pct`, `soil_moisture_pct`, `light_lux`, `recorded_at`.

Parser: `src/lib/hardware/sensecap-k1100.ts`.

## Deploy

Any Node host (e.g. Vercel). Set the same env vars in production.
