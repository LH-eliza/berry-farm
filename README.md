# Berry farm

Growing-focused project: **SenseCAP K1100** (Wio Terminal, SHT40, soil moisture, SGP30, Vision AI, Wio‑E5) plus **Grove Creator Kit γ** (40 modules). No separate ESP32 required — the Wio runs Wi‑Fi and talks to this repo’s web app.

## Web app

[`strawberry-monitor/`](./strawberry-monitor/README.md) — Next.js with **`POST /api/ingest/k1100`** for sensor JSON from your firmware.

```bash
cd strawberry-monitor
npm install
npm run dev
```

## Hardware quick map

| Source | Role |
|--------|------|
| K1100 SHT40 | `temperatureC`, `humidityPct` |
| K1100 soil probe | `soilMoisturePct` (calibrate 0–100 in firmware) |
| Creator Kit γ light sensor | `lightLux` (calibrate ADC → lux) |
| SGP30 | optional `tvocPpb`, `eco2Ppm` in JSON (store yourself if you extend the API) |
| Wio RTC (γ kit) | better local timestamps before POST |

See [Seeed K1100](https://wiki.seeedstudio.com/K1100-Getting-Started/) and [Grove Creator Kit](https://wiki.seeedstudio.com/Grove-Creator-Kit-1/).

## Crop notes (strawberries)

- **Self-pollination:** strawberries are self-fertile; during flowering, gentle daily disturbance can help.
- **Hand pollination:** small brush or swab on open flowers, mid-morning, every 2–3 days in flowering.
