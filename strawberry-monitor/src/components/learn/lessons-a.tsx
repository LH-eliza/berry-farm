"use client";

import { useEffect, useRef, useState } from "react";
import PlantScene, { STAGES } from "./PlantScene";
import CircuitScene from "./CircuitScene";
import { KIT_PARTS, type PartId } from "./parts";
import {
  Callout,
  CodePanel,
  Goals,
  Legend,
  History,
  Meter,
  SerialMonitor,
  Slider,
  useSim,
  useTicker,
  SceneTabs,
  ViewToggle,
} from "./ui";
import PinoutView from "./PinoutScene";
import { readParams } from "@/lib/learn/sketch";
import {
  AirState,
  DayWeather,
  dayWeather,
  fanDecision,
  fmtClock,
  initialAir,
  stepAir,
  tempResponse,
  vpd,
} from "@/lib/learn/sim";

export interface LessonProps {
  onComplete: () => void;
  done: boolean;
}

/* ------------------------------------------------------------------ */
/* 1 · Meet the kit                                                    */
/* ------------------------------------------------------------------ */

const PARTS = KIT_PARTS;

export function KitLesson({ onComplete, done }: LessonProps) {
  const [sel, setSel] = useState<string>("wio");
  const [seen, setSeen] = useState<Set<string>>(new Set(["wio"]));
  const [tab, setTab] = useState<"wiring" | "pinout">("wiring");
  const part = PARTS.find((p) => p.id === sel)!;

  useEffect(() => {
    if (seen.size === PARTS.length && !done) onComplete();
  }, [seen, done, onComplete]);

  const pick = (id: string) => {
    setSel(id);
    setSeen((s) => new Set(s).add(id));
  };

  const json = [
    ["temperatureC", "21.4"],
    ["humidityPct", "62"],
    ["soilMoisturePct", "48"],
    ["lightLux", "3200"],
    ["tvocPpb", "35"],
    ["eco2Ppm", "430"],
  ];

  return (
    <div className="lr-stack">
      <SceneTabs
        value={tab}
        onChange={setTab}
        options={[
          { id: "wiring", label: "Wiring picture" },
          { id: "pinout", label: "Pinout" },
        ]}
      />
      {tab === "pinout" ? (
        <PinoutView />
      ) : (
        <>
        <CircuitScene
          className="lr-circuit"
          parts={PARTS.map((p) => p.id) as PartId[]}
          selected={sel as PartId}
          onSelect={pick}
          temp={21.4}
          rh={62}
          soil={48}
          lux={3200}
          eco2={430}
        />
        </>
      )}
      {tab === "wiring" && (
      <div className="lr-split">
      <div className="lr-stack">
        <div className="lr-kit">
          {PARTS.map((p) => (
            <button key={p.id} className={`lr-part ${sel === p.id ? "on" : ""} ${seen.has(p.id) ? "seen" : ""}`} onClick={() => pick(p.id)}>
              <b>{p.name}</b>
              <span>{p.tag}</span>
            </button>
          ))}
        </div>
        <Goals items={[{ label: `Open every part (${seen.size} of ${PARTS.length})`, done: seen.size === PARTS.length }]} />
      </div>
      <div className="lr-stack">
        <div className="lr-card">
          <h4>{part.name}</h4>
          <p>{part.what}</p>
          <p>
            <b>Why a strawberry cares:</b> {part.why}
          </p>
        </div>
        <div className="lr-terminal" aria-label="Example JSON your Wio Terminal sends">
          <div className="lr-terminal-bar">POST /api/ingest/k1100</div>
          <pre>
            {"{\n"}
            {json.map(([k, v]) => {
              const hot = part.field?.split(", ").includes(k);
              return (
                <span key={k} className={hot ? "hot" : ""}>
                  {`  "${k}": ${v},`}
                  {hot ? "" : "\n"}
                </span>
              );
            })}
            {`  "deviceId": "bench-a"\n}`}
          </pre>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · Anatomy & lifecycle                                             */
/* ------------------------------------------------------------------ */

const STAGE_INFO = [
  {
    text: "Short days and cold push the plant into a semi-dormant rest. The leaves die back, but the crown, the short stem at the soil surface, stays alive. Most cultivars need a spell of chilling before they will flower well.",
    watch: "Air temperature. Frost hurts open flowers and the crown later in the year.",
  },
  {
    text: "As it warms, the crown pushes out new trifoliate leaves. Roots grow mostly in cool spring and autumn weather, and stay shallow: most of them are in the top 15–30 cm.",
    watch: "Soil moisture, since shallow roots dry out quickly.",
  },
  {
    text: "Flower trusses rise from the crown. Strawberries are self-fertile, but a gentle daily shake or a brush every 2–3 days in mid-morning helps move pollen. Cool nights encourage more flower buds to form.",
    watch: "Night temperature, frost, and humidity (flowers can get gray mould too).",
  },
  {
    text: "Pollinated flowers swell into green fruit. Fruit set drops once days get hotter than about 25 °C, and steady moisture matters most from here to harvest.",
    watch: "Day temperature and a steady soil moisture reading.",
  },
  {
    text: "Flower to ripe fruit takes roughly 4–6 weeks. Warmer weather ripens berries faster, but smaller and softer. Wet fruit is where gray mould starts.",
    watch: "Humidity, leaf wetness, and keeping water off the fruit.",
  },
  {
    text: "Heat and long days make the plant send out runners (stolons) that root into daughter plants instead of making flowers. The crown is perennial, but its roots are renewed every year.",
    watch: "Temperature again: hot spells shift the plant from fruiting toward runners.",
  },
];

export function AnatomyLesson({ onComplete, done }: LessonProps) {
  const [stage, setStage] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  const info = STAGE_INFO[stage];
  useEffect(() => {
    if (seen.size === STAGES.length && !done) onComplete();
  }, [seen, done, onComplete]);
  const go = (n: number) => {
    const s = Math.max(0, Math.min(STAGES.length - 1, n));
    setStage(s);
    setSeen((x) => new Set(x).add(s));
  };
  return (
    <div className="lr-split wide">
      <div className="lr-stack">
        <PlantScene stage={stage} labels hour={13} temp={stage === 0 ? 3 : stage === 5 ? 27 : 19} className="lr-scene" />
        <Slider label={`Stage: ${STAGES[stage]}`} value={stage} min={0} max={STAGES.length - 1} onChange={go} />
        <div className="lr-row">
          <button className="lr-btn ghost" onClick={() => go(stage - 1)} disabled={stage === 0}>
            ← Earlier
          </button>
          <button className="lr-btn" onClick={() => go(stage + 1)} disabled={stage === STAGES.length - 1}>
            Later →
          </button>
        </div>
      </div>
      <div className="lr-stack">
        <div className="lr-card">
          <h4>{STAGES[stage]}</h4>
          <p>{info.text}</p>
          <p>
            <b>What to watch:</b> {info.watch}
          </p>
        </div>
        <Callout tone="warn">
          Keep the <b>crown</b> slightly above the soil surface and dry. Planted too low it rots, too high it dries out. Most of the rest of this course is about not wetting it.
        </Callout>
        <Goals items={[{ label: `Step through all six stages (${seen.size} of 6)`, done: seen.size === STAGES.length }]} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Temperature                                                     */
/* ------------------------------------------------------------------ */

const TEMP_CODE = `#include <SensirionI2CSht4x.h>
#include <Wire.h>

SensirionI2CSht4x sht4x;

#define TOO_HOT   25   // fruit set drops above ~25 C
#define TOO_COLD   8   // growth nearly stops

void setup() {
  Serial.begin(115200);
  Wire.begin();
  sht4x.begin(Wire);
}

void loop() {
  float t, h;
  sht4x.measureHighPrecision(t, h);

  Serial.print(t); Serial.print(" C, ");
  Serial.print(h); Serial.print(" %RH -> ");

  if (t <= 0)            Serial.println("FROST! protect the flowers");
  else if (t > TOO_HOT)  Serial.println("Too warm: fruit set drops");
  else if (t < TOO_COLD) Serial.println("Too cold: growth slows");
  else                   Serial.println("Comfortable");
  delay(2000);
}`;

export function TemperatureLesson({ onComplete, done }: LessonProps) {
  const [view, setView] = useState<"plant" | "circuit">("plant");
  const [day, setDay] = useState(22);
  const [night, setNight] = useState(18);
  const [phase, setPhase] = useState<"day" | "night">("day");
  const [hit, setHit] = useState(false);
  const [sawHot, setSawHot] = useState(false);
  const [ran, setRan] = useState(false);
  const [code, setCode] = useState(TEMP_CODE);
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const n = useRef(0);

  const r = tempResponse(day, night);
  const temp = phase === "day" ? day : night;

  const update = (d: number, ni: number) => {
    setDay(d);
    setNight(ni);
    if (tempResponse(d, ni).score >= 90) setHit(true);
    if (d >= 28) setSawHot(true);
  };

  useTicker(running, 700, () => {
    const { values, missing } = readParams(code, { TOO_HOT: 25, TOO_COLD: 8 });
    n.current += 1;
    const t = temp + Math.sin(n.current * 12.9898) * 0.4;
    const out: string[] = [];
    if (n.current === 1) missing.forEach((m) => out.push(`! ${m} not found in sketch, using default`));
    const verdict =
      t <= 0 ? "FROST! protect the flowers" : t > values.TOO_HOT ? "Too warm: fruit set drops" : t < values.TOO_COLD ? "Too cold: growth slows" : "Comfortable";
    out.push(`${t.toFixed(1)} C, 58.0 %RH -> ${verdict}`);
    setLines((l) => [...l, ...out].slice(-60));
  });

  const allDone = hit && sawHot && ran;
  useEffect(() => {
    if (allDone && !done) onComplete();
  }, [allDone, done, onComplete]);

  return (
    <div className="lr-stack">
      <div className="lr-split wide">
        <div className="lr-stack">
          <ViewToggle value={view} onChange={setView} />
          {view === "plant" ? (
            <PlantScene stage={phase === "day" ? 3 : 2} temp={temp} hour={phase === "day" ? 14 : 2} rh={58} className="lr-scene" />
          ) : (
            <CircuitScene className="lr-circuit" labelScale={1.4} parts={["wio", "sht40"]} temp={temp} rh={58} soil={50} lux={phase === "day" ? 6000 : 0} active={running} />
          )}
          <div className="lr-toggle">
            <button className={phase === "day" ? "on" : ""} onClick={() => setPhase("day")}>
              Afternoon
            </button>
            <button className={phase === "night" ? "on" : ""} onClick={() => setPhase("night")}>
              Night
            </button>
          </div>
        </div>
        <div className="lr-stack">
          <Slider label="Daytime temperature" value={day} min={0} max={40} unit=" °C" onChange={(v) => update(v, night)} />
          <Slider label="Night temperature" value={night} min={-5} max={25} unit=" °C" onChange={(v) => update(day, v)} />
          <div className="lr-score">
            <span>Berry score</span>
            <b className={r.score >= 90 ? "ok" : r.score < 50 ? "bad" : ""}>{r.score}</b>
          </div>
          <Meter label="Growth rate" value={r.growth * 100} unit="%" />
          <Meter label="Fruit set" value={r.fruitSet * 100} unit="%" />
          <Meter label="Flower buds" value={r.flowers * 100} unit="%" />
          <Meter label="Runner pull (less is better for fruit)" value={r.runners * 100} unit="%" danger={r.runners > 0.5} />
          {r.frost && <Callout tone="warn">Frost! Open flowers and the crown can be damaged below 0 °C.</Callout>}
        </div>
      </div>
      <div className="lr-split">
        <CodePanel
          code={code}
          onChange={setCode}
          running={running}
          onRun={() => {
            setRunning(true);
            setRan(true);
            setLines([]);
            n.current = 0;
          }}
          onStop={() => setRunning(false)}
          onReset={() => setCode(TEMP_CODE)}
        />
        <div className="lr-stack">
          <SerialMonitor lines={lines} running={running} />
          <Goals
            items={[
              { label: "Find a day and night combination with a berry score of 90+ (cool nights, mild days)", done: hit },
              { label: "Push the day above 28 °C and watch fruit set fall", done: sawHot },
              { label: "Run the sketch, then flip between afternoon and night", done: ran },
            ]}
          />
          <p className="lr-hint">
            Fruit set falls above about 25 °C, and crown temperatures over roughly 28–30 °C suppress flowering. Cool nights encourage more flower buds, so the best berries come from warm days and cool nights.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · Humidity & gray mould                                           */
/* ------------------------------------------------------------------ */

const HUM_CODE = `// Hysteresis: turn ON at a high number, OFF at a lower one,
// so the fan doesn't flicker on and off around one threshold.
#define FAN_ON_RH    95   // % RH: start the fan above this
#define FAN_OFF_RH   80   // % RH: stop the fan below this
#define FAN_ON_TEMP  27   // C: also vent when it gets this hot

const int FAN_PIN = 3;    // relay for the tunnel fan

void loop() {
  float t, h;
  sht4x.measureHighPrecision(t, h);

  if (!fanOn && (h > FAN_ON_RH || t > FAN_ON_TEMP)) fanOn = true;
  if (fanOn && h < FAN_OFF_RH && t < FAN_ON_TEMP - 2) fanOn = false;

  digitalWrite(FAN_PIN, fanOn);
  delay(10 * 60 * 1000);   // look again in 10 minutes
}`;

const HUM_DAY: DayWeather = { name: "Cool, still day", mean: 15, amp: 5, rh: 64, rhAmp: 12 };
const HUM_START = 15 * 60;

interface HumState {
  t: number;
  air: AirState;
  fan: boolean;
  fanMin: number;
  peak: number;
  rh: number[];
  log: string[];
  finished: boolean;
}

const humInit = (): HumState => {
  const w = dayWeather(HUM_DAY, 15);
  return { t: 0, air: initialAir(w.temp, w.rh), fan: false, fanMin: 0, peak: 0, rh: [], log: [], finished: false };
};

export function HumidityLesson({ onComplete, done }: LessonProps) {
  const [view, setView] = useState<"plant" | "circuit">("plant");
  const [code, setCode] = useState(HUM_CODE);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const sim = useSim(humInit);
  const s = sim.state;
  const hour = ((HUM_START + s.t) / 60) % 24;

  useTicker(running, 70, () => {
    for (let k = 0; k < speed; k++) {
      const cur = sim.ref.current;
      if (cur.finished) break;
      const { values, missing } = readParams(code, { FAN_ON_RH: 95, FAN_OFF_RH: 80, FAN_ON_TEMP: 27 });
      const w = dayWeather(HUM_DAY, ((HUM_START + cur.t) / 60) % 24);
      const fan = fanDecision(cur.fan, cur.air.rh, cur.air.temp, values);
      const air = stepAir(cur.air, { outTemp: w.temp, outRH: w.rh, fan }, 10);
      const t = cur.t + 10;
      const log = cur.log.slice();
      if (cur.t === 0) missing.forEach((m) => log.push(`! ${m} not found in sketch, using default`));
      if (t % 60 === 0) {
        log.push(
          `${fmtClock(((HUM_START + t) / 60) % 24)}  ${air.temp.toFixed(1)}C  ${air.rh.toFixed(0)}%RH  fan ${fan ? "ON " : "off"}  wet ${(air.wetMin / 60).toFixed(1)}h  mould ${air.risk.toFixed(0)}%`
        );
      }
      sim.set({
        t,
        air,
        fan,
        fanMin: cur.fanMin + (fan ? 10 : 0),
        peak: Math.max(cur.peak, air.risk),
        rh: [...cur.rh, air.rh],
        log: log.slice(-80),
        finished: t >= 1440,
      });
    }
    if (sim.ref.current.finished) setRunning(false);
  });

  const fanShare = s.t > 0 ? s.fanMin / s.t : 0;
  const goalMould = s.finished && s.peak < 25;
  const goalFan = s.finished && fanShare < 0.7;
  const goalRun = s.finished;
  useEffect(() => {
    if (goalMould && goalFan && !done) onComplete();
  }, [goalMould, goalFan, done, onComplete]);

  const w = dayWeather(HUM_DAY, hour);
  return (
    <div className="lr-stack">
      <div className="lr-split wide">
        <div className="lr-stack">
          <ViewToggle value={view} onChange={setView} />
          {view === "plant" ? (
            <PlantScene stage={4} temp={s.air.temp} rh={s.air.rh} hour={hour} fan={s.fan} botrytis={s.peak > 55 ? s.air.risk : 0} className="lr-scene" />
          ) : (
            <CircuitScene className="lr-circuit" labelScale={1.4} parts={["wio", "sht40", "fan"]} temp={s.air.temp} rh={s.air.rh} soil={50} lux={0} fan={s.fan} active={running} />
          )}
          <div className="lr-row between">
            <span className="lr-clock">
              {fmtClock(hour)} · {Math.floor(s.t / 60)} of 24 h
            </span>
            <span className="lr-hint">outside {w.temp.toFixed(0)} °C · {w.rh.toFixed(0)} % RH</span>
          </div>
        </div>
        <div className="lr-stack">
          <Meter label="Humidity in the tunnel" value={s.air.rh} zone={[60, 75]} unit=" %" />
          <Meter label="Air temperature" value={s.air.temp} min={0} max={40} zone={[16, 25]} unit=" °C" />
          <Meter label="Leaf wetness" value={s.air.wetMin / 60} min={0} max={12} unit=" h" danger={s.air.wetMin >= 240} digits={1} />
          <Meter label="Gray mould risk" value={s.air.risk} unit=" %" danger={s.air.risk > 25} />
          <div className="lr-chips">
            <span>
              VPD <b>{vpd(s.air.temp, s.air.rh).toFixed(2)} kPa</b>
            </span>
            <span>
              Fan on <b>{(fanShare * 100).toFixed(0)}%</b> of the time
            </span>
            <span>
              Peak mould <b>{s.peak.toFixed(0)}%</b>
            </span>
          </div>
          <div className="lr-row">
            <button className={`lr-btn small ${speed === 1 ? "" : "ghost"}`} onClick={() => setSpeed(1)}>
              1×
            </button>
            <button className={`lr-btn small ${speed === 4 ? "" : "ghost"}`} onClick={() => setSpeed(4)}>
              4×
            </button>
            <button className={`lr-btn small ${speed === 12 ? "" : "ghost"}`} onClick={() => setSpeed(12)}>
              12×
            </button>
          </div>
        </div>
      </div>
      <History series={[{ label: "Humidity %", values: s.rh, color: "#3f7ab0" }]} min={30} max={100} hlines={[{ y: 85, label: "85 % · leaves stay wet" }]} xTicks={[{ i: 54, label: "midnight" }]} total={144} />
      <Legend items={[{ label: "Tunnel humidity (%RH)", color: "#3f7ab0" }]} />
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
            setCode(HUM_CODE);
            setRunning(false);
            sim.reset();
          }}
        />
        <div className="lr-stack">
          <SerialMonitor lines={s.log} running={running} />
          <Goals
            items={[
              { label: "Run one full simulated day (24 h)", done: goalRun },
              { label: "Keep peak gray mould risk under 25 %", done: goalMould },
              { label: "Do it with the fan on less than 70 % of the time", done: goalFan },
            ]}
          />
          <p className="lr-hint">
            Gray mould needs free moisture: about 4 hours of wetness at 15–22 °C is enough to start flower infection. Humid air at 85 %+ keeps leaves and fruit wet. Ventilating before RH climbs is cheaper than treating the disease.
          </p>
        </div>
      </div>
    </div>
  );
}
