"use client";

import { useEffect, useRef } from "react";

/** Calls `cb` every `ms` while `running`; always uses the latest callback. */
export function useTicker(running: boolean, ms: number, cb: () => void) {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  });
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => ref.current(), ms);
    return () => clearInterval(id);
  }, [running, ms]);
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  hint,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  hint?: string;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  return (
    <label className="lr-slider">
      <span className="lr-slider-top">
        <span>{label}</span>
        <b>
          {Number.isInteger(step) ? value : value.toFixed(1)}
          {unit}
        </b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {hint && <span className="lr-hint">{hint}</span>}
    </label>
  );
}

/** Horizontal meter with a green "sweet spot" band. */
export function Meter({
  label,
  value,
  min = 0,
  max = 100,
  zone,
  unit = "",
  danger,
  digits = 0,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  zone?: [number, number];
  unit?: string;
  danger?: boolean;
  digits?: number;
}) {
  const pct = (v: number) => `${Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))}%`;
  const inZone = zone ? value >= zone[0] && value <= zone[1] : false;
  return (
    <div className="lr-meter">
      <div className="lr-meter-top">
        <span>{label}</span>
        <b className={danger ? "bad" : inZone ? "ok" : ""}>
          {value.toFixed(digits)}
          {unit}
        </b>
      </div>
      <div className="lr-meter-track">
        {zone && (
          <div
            className="lr-meter-zone"
            style={{ left: pct(zone[0]), width: `calc(${pct(zone[1])} - ${pct(zone[0])})` }}
          />
        )}
        <div
          className={`lr-meter-fill ${danger ? "bad" : inZone ? "ok" : ""}`}
          style={{ width: pct(value) }}
        />
      </div>
    </div>
  );
}

export function Goals({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <ul className="lr-goals">
      {items.map((g) => (
        <li key={g.label} className={g.done ? "done" : ""}>
          <span className="lr-tick" aria-hidden>
            {g.done ? "✓" : ""}
          </span>
          {g.label}
        </li>
      ))}
    </ul>
  );
}

export function CodePanel({
  code,
  onChange,
  running,
  onRun,
  onStop,
  onReset,
  runLabel = "Run",
}: {
  code: string;
  onChange: (c: string) => void;
  running: boolean;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  runLabel?: string;
}) {
  const lines = code.split("\n").length;
  return (
    <div className="lr-code">
      <div className="lr-code-bar">
        <span>sketch.ino</span>
        <div>
          <button className="lr-btn small ghost" onClick={onReset}>
            Reset
          </button>
          {running ? (
            <button className="lr-btn small danger" onClick={onStop}>
              Stop
            </button>
          ) : (
            <button className="lr-btn small" onClick={onRun}>
              ▶ {runLabel}
            </button>
          )}
        </div>
      </div>
      <div className="lr-code-body">
        <pre className="lr-gutter" aria-hidden>
          {Array.from({ length: lines }, (_, i) => i + 1).join("\n")}
        </pre>
        <textarea
          value={code}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          rows={lines}
          style={{ width: `${Math.max(...code.split("\n").map((l) => l.length)) + 2}ch` }}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Arduino sketch (editable constants drive the simulation)"
        />
      </div>
      <p className="lr-code-note">
        Numbers in <code>#define</code> / <code>const</code> lines are live. Change one and run again. The
        logic is simulated rather than compiled.
      </p>
    </div>
  );
}

export function SerialMonitor({ lines, running }: { lines: string[]; running: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);
  return (
    <div className="lr-serial">
      <div className="lr-serial-bar">
        <span>Serial monitor · 115200 baud</span>
        <span className={running ? "run" : ""}>{running ? "● Running" : "Stopped"}</span>
      </div>
      <div className="lr-serial-body" ref={ref}>
        {lines.length === 0 ? (
          <span className="dim">Press Run to see Serial.println output…</span>
        ) : (
          lines.map((l, i) => (
            <div key={i} className={l.startsWith("!") ? "warn" : ""}>
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function Callout({ tone = "info", children }: { tone?: "info" | "warn" | "good"; children: React.ReactNode }) {
  return <div className={`lr-callout ${tone}`}>{children}</div>;
}

export interface Series {
  label: string;
  values: number[];
  color: string;
}

/** Compact multi-line chart. `hlines` draws labelled reference lines. */
export function History({
  series,
  min,
  max,
  hlines = [],
  xTicks = [],
  height = 150,
  total: totalProp,
}: {
  series: Series[];
  min: number;
  max: number;
  hlines?: { y: number; label: string }[];
  /** x positions (as point index) of day separators */
  xTicks?: { i: number; label: string }[];
  height?: number;
  /** number of x steps the full chart spans (so it fills in as a run progresses) */
  total?: number;
}) {
  const w = 640;
  const pad = { l: 30, r: 8, t: 8, b: 18 };
  const n = Math.max(1, ...series.map((s) => s.values.length));
  const total = totalProp ?? Math.max(n - 1, 24);
  const x = (i: number) => pad.l + (i / total) * (w - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / (max - min)) * (height - pad.t - pad.b);
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="lr-history" role="img" aria-label="History chart">
      {[0, 0.5, 1].map((f) => {
        const v = min + (max - min) * f;
        return (
          <g key={f}>
            <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} stroke="#1c1c1c" strokeOpacity={0.12} />
            <text x={pad.l - 4} y={y(v) + 3} textAnchor="end" fontSize={9} fill="#6b6b66">
              {Math.round(v)}
            </text>
          </g>
        );
      })}
      {hlines.map((h) => (
        <g key={h.label}>
          <line x1={pad.l} x2={w - pad.r} y1={y(h.y)} y2={y(h.y)} stroke="#d6334a" strokeDasharray="4 4" strokeOpacity={0.7} />
          <text x={w - pad.r - 2} y={y(h.y) - 3} textAnchor="end" fontSize={9} fill="#b02a3d">
            {h.label}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <g key={t.i}>
          <line x1={x(t.i)} x2={x(t.i)} y1={pad.t} y2={height - pad.b} stroke="#1c1c1c" strokeOpacity={0.12} />
          <text x={x(t.i) + 3} y={height - 5} fontSize={9} fill="#6b6b66">
            {t.label}
          </text>
        </g>
      ))}
      {series.map((s) => (
        <polyline
          key={s.label}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
          strokeLinejoin="round"
          points={s.values.map((v, i) => `${x(i).toFixed(1)},${y(clamp01(v, min, max)).toFixed(1)}`).join(" ")}
        />
      ))}
    </svg>
  );
}

const clamp01 = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="lr-legend">
      {items.map((i) => (
        <span key={i.label}>
          <i style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

import { useState } from "react";

/** Holds a simulation state that a ticker can advance synchronously. */
export function useSim<S>(init: () => S) {
  const [state, setState] = useState<S>(init);
  const ref = useRef<S>(state);
  const set = (s: S) => {
    ref.current = s;
    setState(s);
  };
  const reset = () => set(init());
  return { state, ref, set, reset };
}

export function ViewToggle({ value, onChange }: { value: "plant" | "circuit"; onChange: (v: "plant" | "circuit") => void }) {
  return (
    <div className="lr-viewtoggle" role="group" aria-label="Scene view">
      <button className={value === "plant" ? "on" : ""} onClick={() => onChange("plant")}>
        Plant view
      </button>
      <button className={value === "circuit" ? "on" : ""} onClick={() => onChange("circuit")}>
        Circuit view
      </button>
    </div>
  );
}

export function SceneTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="lr-viewtoggle" role="tablist" aria-label="Diagram">
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} className={value === o.id ? "on" : ""} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
