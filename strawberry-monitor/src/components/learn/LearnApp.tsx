"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./learn.css";
import PlantScene, { STAGES } from "./PlantScene";
import { AnatomyLesson, HumidityLesson, KitLesson, TemperatureLesson, type LessonProps } from "./lessons-a";
import { CapstoneLesson, SoilLesson, WaterLesson } from "./lessons-b";
import { SceneTabs, useTicker } from "./ui";
import CircuitScene from "./CircuitScene";
import PinoutView from "./PinoutScene";
import { PART_INFO, type PartId } from "./parts";
import {
  Basket,
  BeeFlower,
  BerryPlant,
  Fan,
  IconCloud,
  IconDrip,
  IconProbe,
  IconThermo,
  Logo,
  SensorBoard,
  SunThermo,
  WateringCan,
} from "./Illustrations";

interface LessonDef {
  id: number;
  title: string;
  blurb: string;
  goal: string;
  Component: (p: LessonProps) => React.ReactElement;
}

const LESSONS: LessonDef[] = [
  {
    id: 1,
    title: "Meet the kit",
    blurb: "Tour the SenseCAP K1100 and what each sensor tells a strawberry plant.",
    goal: "Know which sensor answers which growing question.",
    Component: KitLesson,
  },
  {
    id: 2,
    title: "Anatomy of a strawberry",
    blurb: "Crown, roots, runners and the six stages from dormancy to renewal.",
    goal: "See why the crown matters more than any other part.",
    Component: AnatomyLesson,
  },
  {
    id: 3,
    title: "Sense the air: temperature",
    blurb: "Read the SHT40 and tune warm days against cool nights.",
    goal: "Learn what temperature does to growth, flowers and fruit set.",
    Component: TemperatureLesson,
  },
  {
    id: 4,
    title: "Humidity and gray mould",
    blurb: "Run a tunnel fan with hysteresis and keep the leaves dry.",
    goal: "Control humidity before disease gets a foothold.",
    Component: HumidityLesson,
  },
  {
    id: 5,
    title: "Read the soil",
    blurb: "Calibrate a raw probe reading into a number you can trust.",
    goal: "Turn a raw ADC value into a soil moisture percentage.",
    Component: SoilLesson,
  },
  {
    id: 6,
    title: "Water the soil, not the crown",
    blurb: "Move the drip emitter, compare sprinklers, and watch the crown.",
    goal: "Water the shallow roots without ever wetting the crown.",
    Component: WaterLesson,
  },
  {
    id: 7,
    title: "Grow a bed for a week",
    blurb: "Tune watering and ventilation through a damp spell and a heat spike.",
    goal: "Put it all together and bring in a good harvest.",
    Component: CapstoneLesson,
  },
];

const KEY = "berry-learn-progress";

const BAND_TEXT = [
  "The leaves die back, but the crown, the short stem at the soil surface, stays alive and waits for spring.",
  "The crown pushes out new leaves while shallow roots spread through the top 15–30 cm of soil.",
  "Cool nights encourage flower buds. Strawberries are self-fertile, but a gentle shake helps pollen move.",
  "Fruit set drops above about 25 °C, so keep the days mild and the soil steadily moist.",
  "About 4–6 weeks from flower to berry. Wet fruit invites gray mould, so keep the leaves dry.",
  "Heat and long days send out runners: daughter plants for next year's bed.",
];

const FEATURES = [
  { lesson: 3, Icon: IconThermo, title: "Temperature", text: "Warm days and cool nights decide how many flowers and berries a plant makes." },
  { lesson: 4, Icon: IconCloud, title: "Humidity", text: "Keep the air moving and the leaves dry before gray mould gets a foothold." },
  { lesson: 5, Icon: IconProbe, title: "Soil moisture", text: "Turn a raw probe reading into a number you can trust for watering." },
  { lesson: 6, Icon: IconDrip, title: "Smart watering", text: "Roots are shallow and the crown hates being wet. Water the soil, not the plant." },
];

const STRIP = [BerryPlant, SunThermo, WateringCan, SensorBoard, Fan, BeeFlower];

export default function LearnApp() {
  const [done, setDone] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState<number | null>(null);
  const [heroStage, setHeroStage] = useState(2);
  const [auto, setAuto] = useState(true);
  const [tick, setTick] = useState(0);
  const [part, setPart] = useState<PartId>("sht40");
  const [wireTab, setWireTab] = useState<"picture" | "pinout">("picture");
  const lessonsRef = useRef<HTMLElement>(null);
  const lessonRef = useRef<HTMLElement>(null);

  // load progress + deep link after mount (avoids hydration mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setDone(new Set(JSON.parse(raw) as number[]));
    } catch {
      /* storage can be unavailable */
    }
    const m = window.location.hash.match(/^#lesson-(\d+)$/);
    if (m) {
      const id = parseInt(m[1], 10);
      if (LESSONS.some((l) => l.id === id)) setOpen(id);
    }
  }, []);

  useTicker(open === null, 700, () => setTick((t) => t + 1));
  useTicker(auto && open === null, 2800, () => setHeroStage((s) => (s + 1) % STAGES.length));

  const complete = useCallback((id: number) => {
    setDone((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const openLesson = (id: number) => {
    setOpen(id);
    window.history.replaceState(null, "", `#lesson-${id}`);
    requestAnimationFrame(() => lessonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const closeLesson = () => {
    setOpen(null);
    window.history.replaceState(null, "", window.location.pathname);
    requestAnimationFrame(() => lessonsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const goHome = () => {
    setOpen(null);
    window.history.replaceState(null, "", window.location.pathname);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const reset = () => {
    setDone(new Set());
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  const current = LESSONS.find((l) => l.id === open) ?? null;
  const idx = current ? LESSONS.indexOf(current) : -1;
  const heroTemp = [3, 14, 17, 20, 23, 27][heroStage];
  const next = LESSONS.find((l) => !done.has(l.id)) ?? LESSONS[0];
  const started = done.size > 0;
  // gently animated demo readings for the wiring diagram
  const demo = {
    temp: 21 + Math.sin(tick / 9) * 4,
    rh: 68 + Math.sin(tick / 7 + 1) * 14,
    soil: 52 + Math.sin(tick / 25) * 14,
    lux: Math.max(0, 9000 + Math.sin(tick / 13) * 8000),
    eco2: 430 + Math.round(Math.sin(tick / 6) * 40),
  };
  const demoFan = demo.rh > 72;
  const demoPump = demo.soil < 45;
  const partInfo = PART_INFO.find((p) => p.id === part)!;

  return (
    <div className="lr" id="top">
      {/* shared hand-drawn wobble for illustrations and frames */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <filter id="lr-wobble" filterUnits="userSpaceOnUse" x="-40" y="-40" width="6000" height="6000">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" />
          </filter>
        </defs>
      </svg>

      <header className="lr-top">
        <button className="lr-logo" onClick={goHome} aria-label="BerryLab home">
          <Logo className="lr-logo-svg" />
        </button>
        <nav aria-label="Main">
          <button onClick={goHome}>Home</button>
          <button onClick={closeLesson}>Lessons</button>
          <button onClick={() => openLesson(1)}>The kit</button>
          <button onClick={() => openLesson(7)}>Grow bed</button>
          <Link href="/">Farm API</Link>
        </nav>
      </header>

      {!current && (
        <>
          <section className="lr-hero">
            <h1>
              A hands-on guide to growing <em>sweeter</em> strawberries with sensors
            </h1>
            <p className="lr-sub">
              Learn how the plant grows, then use your SenseCAP K1100 to simulate the climate, the soil and the watering, one short lesson at a time.
            </p>
            <div className="lr-cta-row">
              <button className="lr-btn" onClick={() => openLesson(next.id)}>
                {started ? `Continue: ${next.title}` : "Start lesson 1"}
              </button>
              <span className="lr-fine">
                {LESSONS.length} interactive lessons · progress saves in your browser
              </span>
            </div>
          </section>

          <section className="lr-strip" aria-hidden>
            {STRIP.map((Ill, i) => (
              <div key={i} className={`lr-fr lr-fr-${i}`}>
                <div className="lr-frame">
                  <Ill />
                </div>
                <i />
                <i className="short" />
              </div>
            ))}
          </section>

          <section className="lr-features">
            <h2>
              What you will <em>learn</em> before the next harvest
            </h2>
            <div className="lr-feat-grid">
              {FEATURES.map(({ lesson, Icon, title, text }) => (
                <button key={title} className="lr-feat" onClick={() => openLesson(lesson)}>
                  <Icon className="lr-feat-ill" />
                  <b>{title}</b>
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="lr-wiring">
            <h2>
              How the kit <em>talks</em> to the plant
            </h2>
            <p className="lr-wiring-sub">
              Sensors send readings down Grove cables to the Wio Terminal. Your sketch decides, and relays switch the fan and the pump. Tap a part to see what it does.
            </p>
            <div className="lr-wiring-tabs">
              <SceneTabs
                value={wireTab}
                onChange={setWireTab}
                options={[
                  { id: "picture", label: "Wiring picture" },
                  { id: "pinout", label: "Pinout" },
                ]}
              />
            </div>
            {wireTab === "pinout" ? (
              <div className="lr-wiring-pinout">
                <PinoutView />
              </div>
            ) : (
            <div className="lr-wiring-grid">
              <CircuitScene
                className="lr-circuit"
                parts={["wio", "wioe5", "sht40", "sgp30", "soil", "light", "vision", "fan", "pump"]}
                selected={part}
                onSelect={setPart}
                {...demo}
                fan={demoFan}
                pump={demoPump}
              />
              <div className="lr-card">
                <h4>{partInfo.name}</h4>
                <p className="lr-fine">{partInfo.tag}</p>
                <p>{partInfo.what}</p>
                <p>
                  <b>Why a strawberry cares:</b> {partInfo.why}
                </p>
                {partInfo.field && (
                  <p className="lr-fine">
                    Sent as <code>{partInfo.field}</code>
                  </p>
                )}
              </div>
            </div>
            )}
          </section>

          <section className="lr-band">
            <div className="lr-band-text">
              <p className="lr-kicker">Stage {heroStage + 1} of 6</p>
              <h2>
                {STAGES[heroStage].split(" ")[0]} <em>{STAGES[heroStage].split(" ").slice(1).join(" ") || "stage"}</em>
              </h2>
              <p>{BAND_TEXT[heroStage]}</p>
              <div className="lr-pills">
                {STAGES.map((st, i) => (
                  <button
                    key={st}
                    className={i === heroStage ? "on" : ""}
                    onClick={() => {
                      setAuto(false);
                      setHeroStage(i);
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <div className="lr-band-scene">
              <PlantScene stage={heroStage} hour={13} temp={heroTemp} rh={heroStage === 4 ? 66 : 60} zoom className="lr-scene" />
            </div>
          </section>

          <section className="lr-lessons" ref={lessonsRef} id="lessons">
            <h2>
              All {LESSONS.length} <em>lessons</em>
            </h2>
            <div className="lr-progress" aria-label="Progress">
              <span>
                {done.size} of {LESSONS.length} complete
              </span>
              <div className="lr-bar">
                <div style={{ width: `${(done.size / LESSONS.length) * 100}%` }} />
              </div>
            </div>
            <ol>
              {LESSONS.map((l) => (
                <li key={l.id}>
                  <button className={`lr-lesson ${done.has(l.id) ? "done" : ""}`} onClick={() => openLesson(l.id)}>
                    <span className="lr-num">{done.has(l.id) ? "✓" : l.id}</span>
                    <span className="lr-lesson-text">
                      <b>{l.title}</b>
                      <span>{l.blurb}</span>
                    </span>
                    <span className="lr-go" aria-hidden>
                      →
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="lr-final">
            <Basket className="lr-final-ill" />
            <h2>
              Ready to grow the <em>next</em> big berry?
            </h2>
            <p>Each lesson ends with something you can try, tweak and break. Nothing here needs hardware to get started.</p>
            <button className="lr-btn" onClick={() => openLesson(next.id)}>
              {started ? `Continue: ${next.title}` : "Start lesson 1"}
            </button>
          </section>
        </>
      )}

      {current && (
        <section className="lr-view" ref={lessonRef} id="lesson">
          <div className="lr-view-head">
            <button className="lr-btn small ghost" onClick={closeLesson}>
              ← All lessons
            </button>
            <span className="lr-count">
              Lesson {current.id} of {LESSONS.length}
              {done.has(current.id) && <em> · complete</em>}
            </span>
          </div>
          <h2>{current.title}</h2>
          <p className="lr-goal">{current.goal}</p>
          <current.Component key={current.id} done={done.has(current.id)} onComplete={() => complete(current.id)} />
          <div className="lr-view-foot">
            <button className="lr-btn ghost" disabled={idx === 0} onClick={() => openLesson(LESSONS[idx - 1].id)}>
              ← {idx > 0 ? LESSONS[idx - 1].title : "Previous"}
            </button>
            <button className="lr-btn" disabled={idx === LESSONS.length - 1} onClick={() => openLesson(LESSONS[idx + 1].id)}>
              {idx < LESSONS.length - 1 ? LESSONS[idx + 1].title : "Next"} →
            </button>
          </div>
        </section>
      )}

      <footer className="lr-foot">
        <div className="lr-foot-row">
          <span>
            <Logo className="lr-foot-logo" /> BerryLab ©2026
          </span>
          <span>
            <Link href="/">Farm API</Link> ·{" "}
            <a href="https://learn-arduino-red.vercel.app/" target="_blank" rel="noreferrer">
              Inspired by Learn Arduino
            </a>
          </span>
          <button className="lr-link" onClick={reset}>
            Reset progress
          </button>
        </div>
        <p className="lr-fine">
          SenseCAP K1100 + Grove Creator Kit γ. The simulations are a teaching model based on general strawberry-growing guidance. Tune every threshold against your own sensors and plants.
        </p>
      </footer>
    </div>
  );
}
