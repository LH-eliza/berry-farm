export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto flex max-w-lg flex-col gap-6 px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Berry farm</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Fresh start: SenseCAP K1100 (Wio Terminal) and Grove Creator Kit γ send
          readings to this app. Run <code className="text-zinc-300">npm run dev</code>{" "}
          and POST sensor JSON to{" "}
          <code className="break-all text-emerald-400/90">
            /api/ingest/k1100
          </code>
          .
        </p>
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          <p className="mb-2 font-medium text-zinc-300">Example body</p>
          <pre className="overflow-x-auto text-xs text-zinc-500">
{`{
  "temperatureC": 22.4,
  "humidityPct": 61,
  "soilMoisturePct": 48,
  "lightLux": 3200,
  "deviceId": "bench-a"
}`}
          </pre>
        </section>
        <p className="text-xs text-zinc-600">
          See repo <code className="text-zinc-500">README.md</code> for hardware
          notes and optional <code className="text-zinc-500">K1100_INGEST_SECRET</code>.
        </p>
      </main>
    </div>
  );
}
