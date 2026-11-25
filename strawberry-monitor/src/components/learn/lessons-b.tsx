"use client";

import { useEffect, useRef, useState } from "react";
import PlantScene from "./PlantScene";
import CircuitScene from "./CircuitScene";
import type { LessonProps } from "./lessons-a";
import { Callout, CodePanel, Goals, History, Legend, Meter, SerialMonitor, Slider, useSim, useTicker, ViewToggle } from "./ui";
import { readParams } from "@/lib/learn/sketch";
import {
  CELLS,
  CROWN,
  PROBE,
  PumpState,
  SoilState,
  AirState,
  TRUE_RAW_DRY,
  TRUE_RAW_WET,
  WEEK,
  clamp,
  dayWeather,
  fanDecision,
  fmtClock,
  initialAir,
  initialSoil,
  pctToRaw,
  pumpDecision,
  rawToPct,
  rootZone,
  stepAir,
  stepSoil,
  thrive,
  vpd,
  weatherAt,
} from "@/lib/learn/sim";

/* ------------------------------------------------------------------ */
/* 5 · Read the soil (calibration)                                     */
/* ------------------------------------------------------------------ */

const SOIL_CODE = `const int SOIL_PIN = A0;   // wherever your probe is plugged in

// Measure these two with YOUR probe, then paste them in:
#define RAW_DRY     2600   // probe held in dry air
#define RAW_WET     1500   // probe standing in a glass of water
#define DRY_BELOW     35   // % : too dry, water soon
#define WET_ABOVE     75   // % : too wet, hold off

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
}

void loop() {
  int raw = analogRead(SOIL_PIN);
  float pct = 100.0 * (RAW_DRY - raw) / (RAW_DRY - RAW_WET);
  pct = constrain(pct, 0, 100);

  Serial.print(raw); Serial.print(" -> "); Serial.print(pct); Serial.print(" % ");
  if (pct < DRY_BELOW)      Serial.println("Too dry");
  else if (pct > WET_ABOVE) Serial.println("Too wet");
  else                      Serial.println("Happy roots");
  delay(2000);
}`;

export function SoilLesson({ onComplete, done }: LessonProps) {
  const [view, setView] = useState<"plant" | "circuit">("plant");
  const [truth, setTruth] = useState(55);
  const [measured, setMeasured] = useState<{ dry?: number; wet?: number }>({});
  const [code, setCode] = useState(SOIL_CODE);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [closeRun, setCloseRun] = useState(false);
  const n = useRef(0);

  const jitter = () => Math.round(Math.sin((n.current += 1) * 78.233) * 6);
  const { values } = readParams(code, { RAW_DRY: 2600, RAW_WET: 1500, DRY_BELOW: 35, WET_ABOVE: 75 });
  const raw = pctToRaw(truth);
  const pct = rawToPct(raw, values.RAW_DRY, values.RAW_WET);

  const bothMeasured = measured.dry !== undefined && measured.wet !== undefined;
  const calibrated = Math.abs(values.RAW_DRY - TRUE_RAW_DRY) <= 80 && Math.abs(values.RAW_WET - TRUE_RAW_WET) <= 80;

  useTicker(running, 800, () => {
    const r = raw + jitter();
    const p = rawToPct(r, values.RAW_DRY, values.RAW_WET);
    const verdict = p < values.DRY_BELOW ? "Too dry" : p > values.WET_ABOVE ? "Too wet" : "Happy roots";
    setLines((l) => [...l, `${r} -> ${p.toFixed(1)} % ${verdict}`].slice(-60));
    if (Math.abs(p - truth) <= 5 && calibrated) setCloseRun(true);
  });

  const all = bothMeasured && calibrated && closeRun;
  useEffect(() => {
    if (all && !done) onComplete();
  }, [all, done, onComplete]);

  return (
    <div className="lr-stack">
      <div className="lr-split wide">
        <div className="lr-stack">
          <ViewToggle value={view} onChange={setView} />
          {view === "plant" ? (
            <PlantScene stage={1} hour={12} cells={Array.from({ length: CELLS }, () => truth)} probeValue={pct} className="lr-scene" />
          ) : (
            <CircuitScene className="lr-circuit" labelScale={1.4} parts={["wio", "soil"]} soil={pct} temp={20} rh={60} lux={4000} active={running} />
          )}
          <Slider label="How wet the soil really is" value={truth} min={0} max={100} unit=" %" onChange={setTruth} hint="You normally can't see this. It's what the probe has to figure out." />
        </div>
        <div className="lr-stack">
          <div className="lr-card">
            <h4>Step 1 · Measure your probe</h4>
            <p>Every probe reads slightly differently, so find its two ends.</p>
            <div className="lr-row">
              <button className="lr-btn small" onClick={() => setMeasured((m) => ({ ...m, dry: pctToRaw(0) + jitter() }))}>
                Hold in dry air
              </button>
              <button className="lr-btn small" onClick={() => setMeasured((m) => ({ ...m, wet: pctToRaw(100) + jitter() }))}>
                Stand in water
              </button>
            </div>
            <div className="lr-chips">
              <span>
                Dry air raw <b>{measured.dry ?? "·"}</b>
              </span>
              <span>
                Water raw <b>{measured.wet ?? "·"}</b>
              </span>
            </div>
          </div>
          <Meter label="Sketch says soil moisture is" value={pct} zone={[40, 70]} unit=" %" />
          <div className="lr-chips">
            <span>
              Raw reading <b>{raw}</b>
            </span>
            <span>
              Error <b className={Math.abs(pct - truth) <= 5 ? "ok" : "bad"}>{(pct - truth).toFixed(0)} %</b>
            </span>
          </div>
          <Callout>
            Capacitive probes usually read <b>lower</b> when wetter. If yours goes the other way, the same formula still works: just swap what you paste in. Your numbers will differ from these, so measure them.
          </Callout>
        </div>
      </div>
      <div className="lr-split">
        <CodePanel
          code={code}
          onChange={setCode}
          running={running}
          onRun={() => {
            setRunning(true);
            setLines([]);
          }}
          onStop={() => setRunning(false)}
          onReset={() => setCode(SOIL_CODE)}
        />
        <div className="lr-stack">
          <SerialMonitor lines={lines} running={running} />
          <Goals
            items={[
              { label: "Measure both dry air and water", done: bothMeasured },
              { label: "Paste your two raw numbers into RAW_DRY and RAW_WET", done: calibrated },
              { label: "Run the sketch and see the reading land within 5 % of the truth", done: closeRun },
            ]}
          />
          <p className="lr-hint">
            Soil zones are starting points, not laws. Roots like it moist but never soggy: aim for roughly 40–70 % on your own scale, then tune against how your plants actually look.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 6 · Water the soil, not the crown                                   */
/* ------------------------------------------------------------------ */

const WATER_CODE = `// The pump is a relay on a free pin; the probe sits in the root zone.
#define WATER_BELOW    45   // %   : start the pump below this
#define WATER_UNTIL    65   // %   : stop once the soil reaches this
#define MAX_PUMP_MIN   30   // min : safety: never run longer in one go
#define WATER_FROM      5   // hour: not before this...
#define WATER_TO       17   // hour: ...nor after this, so the crown dries by dusk

void loop() {
  float soil = readSoilPercent();   // from the last lesson

  if (!pumpOn && soil < WATER_BELOW && inWindow() && !soaking()) pumpOn = true;
  if (pumpOn && (soil > WATER_UNTIL || !inWindow())) pumpOn = false;
  if (pumpOn && runMinutes() >= MAX_PUMP_MIN) { pumpOn = false; startSoak(30); }

  digitalWrite(PUMP_PIN, pumpOn);
  delay(10 * 60 * 1000);
}`;

interface WaterState {
  t: number;
  soil: SoilState;
  pump: PumpState;
  minRoot: number;
  maxRoot: number;
  maxRot: number;
  log: string[];
  finished: boolean;
}

const WATER_DAY = WEEK[1];
const WATER_START = 6 * 60; // the lesson day starts at 06:00
const waterInit = (): WaterState => ({
  t: 0,
  soil: initialSoil(45),
  pump: { pump: false, run: 0, rest: 0 },
  minRoot: 100,
  maxRoot: 0,
  maxRot: 0,
  log: [],
  finished: false,
});

export function WaterLesson({ onComplete, done }: LessonProps) {
  const [view, setView] = useState<"plant" | "circuit">("plant");
  const [code, setCode] = useState(WATER_CODE);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [emitter, setEmitter] = useState(CROWN);
  const [overhead, setOverhead] = useState(false);
  const [mulch, setMulch] = useState(false);
  const sim = useSim(waterInit);
  const s = sim.state;
  const hour = ((WATER_START + s.t) / 60) % 24;
  const cm = Math.abs(emitter - CROWN) * 4;

  useTicker(running, 70, () => {
    for (let k = 0; k < speed; k++) {
      const cur = sim.ref.current;
      if (cur.finished) break;
      const { values, missing } = readParams(code, { WATER_BELOW: 45, WATER_UNTIL: 65, MAX_PUMP_MIN: 30, WATER_FROM: 5, WATER_TO: 17 });
      const h = ((WATER_START + cur.t) / 60) % 24;
      const w = dayWeather(WATER_DAY, h);
      const probe = cur.soil.cells[PROBE];
      const ps = pumpDecision(cur.pump, probe, h, values, 10);
      const soil = stepSoil(cur.soil, { pump: ps.pump, emitter, overhead, mulch, vpd: vpd(w.temp + 2, w.rh - 6), daylight: w.daylight }, 10);
      const t = cur.t + 10;
      const root = rootZone(soil.cells);
      const log = cur.log.slice();
      if (cur.t === 0) missing.forEach((m) => log.push(`! ${m} not found in sketch, using default`));
      if (ps.pump !== cur.pump.pump) log.push(`${fmtClock(h)}  pump ${ps.pump ? "ON " : "OFF"}  probe ${probe.toFixed(0)}%`);
      else if (t % 180 === 0) log.push(`${fmtClock(((WATER_START + t) / 60) % 24)}  probe ${soil.cells[PROBE].toFixed(0)}%  crown ${soil.crownWet > 15 ? "WET" : "dry"}`);
      sim.set({
        t,
        soil,
        pump: ps,
        minRoot: Math.min(cur.minRoot, root),
        maxRoot: Math.max(cur.maxRoot, root),
        maxRot: Math.max(cur.maxRot, soil.rot),
        log: log.slice(-80),
        finished: t >= 1440,
      });
    }
    if (sim.ref.current.finished) setRunning(false);
  });

  const root = rootZone(s.soil.cells);
  const gRun = s.finished;
  const gRoot = s.finished && s.minRoot >= 25 && s.maxRoot <= 80;
  const gCrown = s.finished && s.maxRot < 20;
  useEffect(() => {
    if (gRoot && gCrown && !done) onComplete();
  }, [gRoot, gCrown, done, onComplete]);

  return (
    <div className="lr-stack">
      <div className="lr-split wide">
        <div className="lr-stack">
          <ViewToggle value={view} onChange={setView} />
          {view === "plant" ? (
            <PlantScene
            stage={4}
            hour={hour}
            temp={dayWeather(WATER_DAY, hour).temp}
            rh={dayWeather(WATER_DAY, hour).rh}
            cells={s.soil.cells}
            emitter={emitter}
            pumping={s.pump.pump}
            overhead={overhead}
            mulch={mulch}
            crownWet={s.soil.crownWet}
            probeValue={s.soil.cells[PROBE]}
            onEmitterChange={overhead ? undefined : setEmitter}
            className="lr-scene"
          />
          ) : (
            <CircuitScene className="lr-circuit" labelScale={1.4} parts={["wio", "soil", "pump"]} soil={s.soil.cells[PROBE]} pump={s.pump.pump} temp={dayWeather(WATER_DAY, hour).temp} rh={dayWeather(WATER_DAY, hour).rh} lux={4000} active={running} />
          )}
          <div className="lr-row between">
            <span className="lr-clock">
              {fmtClock(hour)} · {Math.floor(s.t / 60)} of 24 h
            </span>
            <span className="lr-hint">{overhead ? "Sprinkler over the whole plant" : "Drag in the scene to move the drip emitter"}</span>
          </div>
        </div>
        <div className="lr-stack">
          <Slider label="Drip emitter distance from crown" value={cm} min={0} max={28} step={4} unit=" cm" disabled={overhead} onChange={(v) => setEmitter(CROWN + Math.round(v / 4))} />
          <div className="lr-row">
            <label className="lr-check">
              <input type="checkbox" checked={overhead} onChange={(e) => setOverhead(e.target.checked)} /> Overhead sprinkler
            </label>
            <label className="lr-check">
              <input type="checkbox" checked={mulch} onChange={(e) => setMulch(e.target.checked)} /> Straw mulch
            </label>
          </div>
          <Meter label="Root-zone moisture" value={root} zone={[40, 70]} unit=" %" />
          <Meter label="Crown wetness" value={s.soil.crownWet} unit=" %" danger={s.soil.crownWet > 15} />
          <Meter label="Crown rot risk" value={s.soil.rot} unit=" %" danger={s.soil.rot > 20} />
          <div className="lr-chips">
            <span>
              Pump ran <b>{s.soil.pumpMin} min</b>
            </span>
            <span>
              Range <b>{s.finished || s.t > 0 ? `${s.minRoot.toFixed(0)}–${s.maxRoot.toFixed(0)}%` : "·"}</b>
            </span>
          </div>
          <div className="lr-row">
            {[1, 4, 12].map((v) => (
              <button key={v} className={`lr-btn small ${speed === v ? "" : "ghost"}`} onClick={() => setSpeed(v)}>
                {v}×
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="lr-split">
        <CodePanel
          code={code}
          onChange={setCode}
          running={running}
          runLabel={s.finished ? "Run again" : "Run"}
          onRun={() => {
            if (sim.ref.current.finished) sim.reset();
            setRunning(true);
          }}
          onStop={() => setRunning(false)}
          onReset={() => {
            setCode(WATER_CODE);
            setRunning(false);
            sim.reset();
          }}
        />
        <div className="lr-stack">
          <SerialMonitor lines={s.log} running={running} />
          <Goals
            items={[
              { label: "Run a full simulated day", done: gRun },
              { label: "Keep the root zone between 25 % and 80 % all day", done: gRoot },
              { label: "Keep crown rot risk under 20 %", done: gCrown },
            ]}
          />
          <p className="lr-hint">
            Strawberries want about an inch of water a week, delivered to the soil. A few cm to the side of the crown wets the shallow roots without soaking the crown. Even a day or two of standing water is harmful.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 7 · Capstone: a week in the bed                                     */
/* ------------------------------------------------------------------ */

const CAP_CODE = `// First draft: it works, but it isn't kind to the plant. Improve it!

// ---- watering ----
#define WATER_BELOW    40   // %    start the pump below this
#define WATER_UNTIL    62   // %    stop above this
#define MAX_PUMP_MIN   20   // min  safety limit per cycle
#define WATER_FROM      5   // hour window start
#define WATER_TO       14   // hour window end
#define EMITTER_CM      0   // cm   drip emitter distance from the crown
#define MULCH           0   // 1 = straw mulch on the bed
#define OVERHEAD        0   // 1 = overhead sprinkler (not drip)

// ---- ventilation ----
#define FAN_ON_RH      90   // % RH start fan
#define FAN_OFF_RH     80   // % RH stop fan
#define FAN_ON_TEMP    27   // C   also vent when hot`;

const CAP_DEFAULTS = {
  WATER_BELOW: 40,
  WATER_UNTIL: 62,
  MAX_PUMP_MIN: 20,
  WATER_FROM: 5,
  WATER_TO: 14,
  EMITTER_CM: 0,
  MULCH: 0,
  OVERHEAD: 0,
  FAN_ON_RH: 90,
  FAN_OFF_RH: 80,
  FAN_ON_TEMP: 27,
};

const WEEK_MIN = 7 * 1440;

interface CapState {
  t: number;
  air: AirState;
  soil: SoilState;
  pump: PumpState;
  fan: boolean;
  fanMin: number;
  progress: number;
  maxRot: number;
  maxBot: number;
  minRoot: number;
  maxRoot: number;
  temps: number[];
  rhs: number[];
  roots: number[];
  log: string[];
  finished: boolean;
}

const capInit = (): CapState => {
  const w = weatherAt(0);
  return {
    t: 0,
    air: initialAir(w.temp, w.rh),
    soil: initialSoil(45),
    pump: { pump: false, run: 0, rest: 0 },
    fan: false,
    fanMin: 0,
    progress: 0,
    maxRot: 0,
    maxBot: 0,
    minRoot: 100,
    maxRoot: 0,
    temps: [],
    rhs: [],
    roots: [],
    log: [],
    finished: false,
  };
};

function advise(s: CapState) {
  const tips: string[] = [];
  if (s.maxRot > 25) tips.push("The crown stayed wet. Move the emitter away from it (try 8 cm), use drip instead of overhead, and water earlier in the day.");
  if (s.maxBot > 25) tips.push("Humid nights built up gray mould risk. Lower FAN_ON_RH so the fan starts before leaves stay wet.");
  if (s.minRoot < 30) tips.push("The root zone got too dry. Raise WATER_BELOW or widen the WATER_FROM–WATER_TO window.");
  if (s.maxRoot > 80) tips.push("The soil went soggy. Lower WATER_UNTIL and keep the pump cycles short.");
  if (tips.length === 0 && s.progress < 90) tips.push("Healthy, but growth lagged. Check the heat spike on day 5: venting earlier keeps fruit set up.");
  return tips;
}

export function CapstoneLesson({ onComplete, done }: LessonProps) {
  const [view, setView] = useState<"plant" | "circuit">("plant");
  const [code, setCode] = useState(CAP_CODE);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(4);
  const [post, setPost] = useState(false);
  const [api, setApi] = useState<string | null>(null);
  const sim = useSim(capInit);
  const s = sim.state;
  const w = weatherAt(Math.min(s.t, WEEK_MIN - 1));

  const sendReading = (st: CapState, wx: ReturnType<typeof weatherAt>) => {
    const lux = wx.daylight ? Math.round(30000 * Math.sin(((wx.hour - 6) / 14) * Math.PI)) : 0;
    fetch("/api/ingest/k1100", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        temperatureC: +st.air.temp.toFixed(1),
        humidityPct: +st.air.rh.toFixed(0),
        soilMoisturePct: +st.soil.cells[PROBE].toFixed(0),
        lightLux: lux,
        deviceId: "learn-sim",
        recordedAt: new Date().toISOString(),
      }),
    })
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        setApi(`${r.status} ${r.ok ? "ok" : "error"}  ${JSON.stringify(j.sensorData ?? j)}`);
      })
      .catch(() => setApi("network error: is the dev server running?"));
  };

  useTicker(running, 40, () => {
    for (let k = 0; k < speed; k++) {
      const cur = sim.ref.current;
      if (cur.finished) break;
      const { values: p, missing } = readParams(code, CAP_DEFAULTS);
      const wx = weatherAt(cur.t);
      const probe = cur.soil.cells[PROBE];
      const ps = pumpDecision(cur.pump, probe, wx.hour, p, 10);
      const fan = fanDecision(cur.fan, cur.air.rh, cur.air.temp, p);
      const air = stepAir(cur.air, { outTemp: wx.temp, outRH: wx.rh, fan }, 10);
      const soil = stepSoil(
        cur.soil,
        { pump: ps.pump, emitter: clamp(CROWN + Math.round(p.EMITTER_CM / 4), 0, CELLS - 1), overhead: p.OVERHEAD >= 1, mulch: p.MULCH >= 1, vpd: vpd(air.temp, air.rh), daylight: wx.daylight },
        10
      );
      const root = rootZone(soil.cells);
      const t = cur.t + 10;
      const log = cur.log.slice();
      if (cur.t === 0) missing.forEach((m) => log.push(`! ${m} not found in sketch, using default`));
      if (ps.pump !== cur.pump.pump) log.push(`D${wx.day + 1} ${fmtClock(wx.hour)}  pump ${ps.pump ? "ON " : "OFF"}  probe ${probe.toFixed(0)}%`);
      const hourly = t % 60 === 0;
      const next: CapState = {
        t,
        air,
        soil,
        pump: ps,
        fan,
        fanMin: cur.fanMin + (fan ? 10 : 0),
        progress: Math.min(100, cur.progress + thrive(air.temp, root) * (10 / WEEK_MIN) * 100),
        maxRot: Math.max(cur.maxRot, soil.rot),
        maxBot: Math.max(cur.maxBot, air.risk),
        minRoot: Math.min(cur.minRoot, root),
        maxRoot: Math.max(cur.maxRoot, root),
        temps: hourly ? [...cur.temps, air.temp] : cur.temps,
        rhs: hourly ? [...cur.rhs, air.rh] : cur.rhs,
        roots: hourly ? [...cur.roots, root] : cur.roots,
        log: log.slice(-80),
        finished: t >= WEEK_MIN,
      };
      sim.set(next);
      if (hourly && post && next.t % 360 === 0) sendReading(next, weatherAt(next.t));
    }
    if (sim.ref.current.finished) setRunning(false);
  });

  const yieldPct = Math.max(0, s.progress * (1 - 0.5 * (s.maxRot / 100) - 0.5 * (s.maxBot / 100)));
  const stage = s.progress < 20 ? 1 : s.progress < 40 ? 2 : s.progress < 65 ? 3 : 4;
  const good = s.finished && yieldPct >= 85;
  useEffect(() => {
    if (good && !done) onComplete();
  }, [good, done, onComplete]);

  const hour = w.hour;
  const days = Array.from({ length: 7 }, (_, d) => ({ i: d * 24, label: `D${d + 1}` }));

  return (
    <div className="lr-stack">
      <div className="lr-split wide">
        <div className="lr-stack">
          <ViewToggle value={view} onChange={setView} />
          {view === "plant" ? (
            <PlantScene
            stage={stage}
            hour={hour}
            temp={s.air.temp}
            rh={s.air.rh}
            cells={s.soil.cells}
            emitter={clamp(CROWN + Math.round(readParams(code, CAP_DEFAULTS).values.EMITTER_CM / 4), 0, CELLS - 1)}
            overhead={readParams(code, CAP_DEFAULTS).values.OVERHEAD >= 1}
            mulch={readParams(code, CAP_DEFAULTS).values.MULCH >= 1}
            pumping={s.pump.pump}
            crownWet={s.soil.crownWet}
            botrytis={s.air.risk}
            fan={s.fan}
            probeValue={s.soil.cells[PROBE]}
            className="lr-scene"
          />
          ) : (
            <CircuitScene className="lr-circuit" labelScale={1.4} parts={["wio", "sht40", "soil", "light", "fan", "pump"]} temp={s.air.temp} rh={s.air.rh} soil={s.soil.cells[PROBE]} lux={w.daylight ? Math.round(30000 * Math.sin(((hour - 6) / 14) * Math.PI)) : 0} fan={s.fan} pump={s.pump.pump} active={running} />
          )}
          <div className="lr-row between">
            <span className="lr-clock">
              Day {w.day + 1} · {fmtClock(hour)}
            </span>
            <span className="lr-hint">{w.name}</span>
          </div>
        </div>
        <div className="lr-stack">
          <Meter label="Berry growth" value={s.progress} unit=" %" />
          <Meter label="Root-zone moisture" value={rootZone(s.soil.cells)} zone={[40, 70]} unit=" %" />
          <Meter label="Humidity" value={s.air.rh} zone={[60, 75]} unit=" %" />
          <Meter label="Gray mould risk" value={s.air.risk} unit=" %" danger={s.air.risk > 25} />
          <Meter label="Crown rot risk" value={s.soil.rot} unit=" %" danger={s.soil.rot > 20} />
          <div className="lr-row">
            {[1, 4, 16].map((v) => (
              <button key={v} className={`lr-btn small ${speed === v ? "" : "ghost"}`} onClick={() => setSpeed(v)}>
                {v}×
              </button>
            ))}
          </div>
        </div>
      </div>
      <History
        series={[
          { label: "Air °C", values: s.temps, color: "#d6334a" },
          { label: "Humidity %", values: s.rhs, color: "#3f7ab0" },
          { label: "Root-zone moisture %", values: s.roots, color: "#8a5a3c" },
        ]}
        min={0}
        max={100}
        total={167}
        xTicks={days}
        hlines={[{ y: 85, label: "85 % RH · leaves stay wet" }]}
      />
      <Legend
        items={[
          { label: "Air temperature (°C)", color: "#d6334a" },
          { label: "Humidity (%RH)", color: "#3f7ab0" },
          { label: "Root-zone moisture (%)", color: "#8a5a3c" },
        ]}
      />
      <div className="lr-split">
        <CodePanel
          code={code}
          onChange={setCode}
          running={running}
          runLabel={s.finished ? "Run again" : s.t > 0 ? "Resume" : "Run week"}
          onRun={() => {
            if (sim.ref.current.finished) sim.reset();
            setRunning(true);
          }}
          onStop={() => setRunning(false)}
          onReset={() => {
            setCode(CAP_CODE);
            setRunning(false);
            sim.reset();
            setApi(null);
          }}
        />
        <div className="lr-stack">
          <SerialMonitor lines={s.log} running={running} />
          <label className="lr-check">
            <input type="checkbox" checked={post} onChange={(e) => setPost(e.target.checked)} /> Also POST a reading to <code>/api/ingest/k1100</code> every 6 simulated hours
          </label>
          {post && <div className="lr-api">{api ?? "waiting for the first reading…"}</div>}
          {s.finished ? (
            <div className={`lr-report ${good ? "good" : ""}`}>
              <h4>{good ? "Great harvest!" : "Week's over"}</h4>
              <div className="lr-chips">
                <span>
                  Yield <b>{yieldPct.toFixed(0)}%</b>
                </span>
                <span>
                  Peak mould <b>{s.maxBot.toFixed(0)}%</b>
                </span>
                <span>
                  Peak crown rot <b>{s.maxRot.toFixed(0)}%</b>
                </span>
                <span>
                  Pump <b>{s.soil.pumpMin} min</b>
                </span>
              </div>
              <ul>
                {advise(s).map((t) => (
                  <li key={t}>{t}</li>
                ))}
                {advise(s).length === 0 && <li>Nothing to fix. For a bonus, see how little water you can use (mulch helps).</li>}
              </ul>
            </div>
          ) : (
            <Goals items={[{ label: "Finish the week with a yield of 85 % or more", done: good }]} />
          )}
          <p className="lr-hint">
            Everything from the earlier lessons is in play: a heat spike on day 5, a damp cloudy day 3, a pump you can overdo, and a crown that hates being wet.
          </p>
        </div>
      </div>
    </div>
  );
}
