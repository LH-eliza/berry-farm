"use client";

import { useState, type KeyboardEvent } from "react";
import { PART_INFO, type PartId } from "./parts";
import { HEADER, KIND_COLOR, KIND_LABEL, WIRING, type Bus, type HeaderPin, type PartPlan, type PinKind } from "./pinout";

const INK = "#1c1c1c";
const BUS_COLOR: Record<Bus, string> = {
  "I²C": "#f6e05e",
  Analog: "#9fd8f2",
  UART: "#8fc3a1",
  Digital: "#ef8a80",
};

/* geometry */
const BX = 250;
const BW = 440;
const BY = 30;
const BH = 572;
const DX_O = 480;
const DX_E = 512;
const rowY = (n: number) => 90 + ((n - 1) >> 1) * 24;
const pinX = (n: number) => (n % 2 === 1 ? DX_O : DX_E);

const LEFT_X = 10;
const LEFT_W = 130;
const RIGHT_X = 780;
const RIGHT_W = 170;
const BOX_H = 52;

interface Box {
  id: PartId;
  x: number;
  y: number;
  w: number;
}
const BOXES: Box[] = [
  { id: "sht40", x: LEFT_X, y: 92, w: LEFT_W },
  { id: "sgp30", x: LEFT_X, y: 162, w: LEFT_W },
  { id: "vision", x: LEFT_X, y: 232, w: LEFT_W },
  { id: "soil", x: LEFT_X, y: 300, w: LEFT_W },
  { id: "light", x: LEFT_X, y: 370, w: LEFT_W },
  { id: "wioe5", x: RIGHT_X, y: 120, w: RIGHT_W },
  { id: "fan", x: RIGHT_X, y: 222, w: RIGHT_W },
  { id: "pump", x: RIGHT_X, y: 292, w: RIGHT_W },
];

const GI2C = { y: 160 }; // socket top
const GDA = { y: 330 };
const SOCK_H = 56;
const HUB_X = 170;

const nameOf = (id: PartId) => PART_INFO.find((p) => p.id === id)?.name ?? id;

function onKey(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

function Cable({ d, color, on, dim }: { d: string; color: string; on: boolean; dim: boolean }) {
  return (
    <g fill="none" strokeLinecap="round" opacity={dim ? 0.4 : 1}>
      <path d={d} stroke={INK} strokeWidth={on ? 5.6 : 4.4} />
      <path d={d} stroke={color} strokeWidth={on ? 3.4 : 2.4} />
      {on && <path d={d} stroke="#fff" strokeWidth={1.8} className="lr-flow" />}
    </g>
  );
}

const hz = (x1: number, y1: number, x2: number, y2: number) => {
  const dx = (x2 - x1) * 0.5;
  return `M${x1} ${y1} C${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
};

/** Pill labels for the header pins that the plan uses (even column). */
const USED_EVEN: Record<number, PartId> = { 8: "wioe5", 10: "wioe5", 16: "fan", 18: "pump" };

function Socket({ y, title, labels, sel }: { y: number; title: string; labels: string[]; sel: boolean }) {
  return (
    <g>
      <g filter="url(#lr-wobble)">
        <rect x={BX} y={y} width={112} height={SOCK_H} rx={4} fill="#fff" stroke={INK} strokeWidth={sel ? 2.6 : 1.7} />
        {labels.map((_, i) => (
          <circle key={i} cx={BX + 20 + i * 26} cy={y + 38} r={5} fill={["#f6e05e", "#fff", "#ef8a80", INK][i]} stroke={INK} strokeWidth={1.2} />
        ))}
      </g>
      {labels.map((l, i) => (
        <text key={l} x={BX + 20 + i * 26} y={y + 24} textAnchor="middle" fontSize={9.5} fill="#55524a">
          {l}
        </text>
      ))}
      <text x={BX + 8} y={y - 8} fontSize={11.5} fontWeight={600} fill={INK}>
        {title}
      </text>
    </g>
  );
}

function PartBox({ b, selected, onSelect, plan }: { b: Box; selected: boolean; onSelect: () => void; plan: PartPlan }) {
  const color = BUS_COLOR[plan.bus];
  return (
    <g role="button" tabIndex={0} aria-pressed={selected} aria-label={`${nameOf(b.id)}, ${plan.bus}`} onClick={onSelect} onKeyDown={onKey(onSelect)} style={{ cursor: "pointer" }}>
      <g filter="url(#lr-wobble)">
        <rect x={b.x} y={b.y} width={b.w} height={BOX_H} rx={6} fill={selected ? color : "#fff"} stroke={INK} strokeWidth={selected ? 2.4 : 1.7} />
      </g>
      <text x={b.x + 12} y={b.y + 23} fontSize={12.5} fontWeight={600} fill={INK}>
        {nameOf(b.id)}
      </text>
      <text x={b.x + 12} y={b.y + 40} fontSize={10.5} fill="#55524a">
        {plan.bus}
      </text>
    </g>
  );
}

function Pin({ p, used, ring, selected, onPick }: { p: HeaderPin; used: boolean; ring: boolean; selected: boolean; onPick: () => void }) {
  const x = pinX(p.n);
  const y = rowY(p.n);
  const odd = p.n % 2 === 1;
  const pilled = !odd && USED_EVEN[p.n];
  return (
    <g onClick={onPick} onKeyDown={onKey(onPick)} tabIndex={used ? 0 : -1} role="button" aria-label={`Header pin ${p.n}, ${p.label}`} style={{ cursor: "pointer" }}>
      <rect x={odd ? x - 100 : x - 18} y={y - 12} width={118} height={24} fill="transparent" />
      {(ring || selected) && <circle cx={x} cy={y} r={10} fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray={selected ? undefined : "3 3"} />}
      <circle cx={x} cy={y} r={used ? 7 : 6} fill={KIND_COLOR[p.kind]} stroke={INK} strokeWidth={used ? 2 : 1.2} />
      <text x={odd ? x - 20 : x + 21} y={y + 3.5} textAnchor="middle" fontSize={9.5} fill="#9a968a">
        {p.n}
      </text>
      {odd ? (
        <text x={x - 36} y={y + 4} textAnchor="end" fontSize={10.5} fill={INK}>
          {p.label}
        </text>
      ) : pilled ? null : (
        <text x={x + 38} y={y + 4} fontSize={10.5} fill={INK}>
          {p.label}
        </text>
      )}
    </g>
  );
}

export function PinoutScene({
  selected,
  pin,
  onSelect,
  onPin,
}: {
  selected: PartId;
  pin: number | null;
  onSelect: (id: PartId) => void;
  onPin: (n: number) => void;
}) {
  const plan = (id: PartId) => WIRING.find((w) => w.id === id)!;
  const selPlan = plan(selected);
  const sharedI2c = selPlan.socket === "gi2c";
  const usedNums = new Set<number>();
  WIRING.forEach((w) => Array.isArray(w.socket) && w.socket.forEach((n) => usedNums.add(n)));

  const left = BOXES.filter((b) => b.x === LEFT_X);

  return (
    <svg className="lr-pinout" viewBox="0 0 960 620" role="group" aria-label="Wio Terminal pinout with the berry kit wired to it">
      {/* board */}
      <g filter="url(#lr-wobble)">
        <rect x={BX} y={BY} width={BW} height={BH} rx={14} fill="#fbfaf4" stroke={INK} strokeWidth={1.8} />
        <rect x={DX_O - 32} y={BY + 40} width={DX_E - DX_O + 68} height={BH - 66} rx={7} fill="#f1eee2" stroke={INK} strokeWidth={1.4} />
      </g>
      <text x={BX + 14} y={BY + 26} fontSize={15} fontFamily="var(--lr-serif, Georgia, serif)" fontWeight={700} fill={INK}>
        Wio Terminal
      </text>
      <text x={BX + 14} y={BY + 44} fontSize={10.5} fill="#7a766a">
        back of the board
      </text>
      <text x={(DX_O + DX_E) / 2} y={BY + 30} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={INK}>
        40-pin header
      </text>
      <text x={BX + 14} y={BY + BH - 16} fontSize={10.5} fill="#7a766a">
        Grove ports on the left edge, header on the right
      </text>

      {/* cables: left parts -> hubs -> sockets */}
      {left.map((b) => {
        const p = plan(b.id);
        const hubY = p.socket === "gi2c" ? GI2C.y + SOCK_H / 2 : GDA.y + SOCK_H / 2;
        return <Cable key={b.id} d={hz(b.x + b.w, b.y + BOX_H / 2, HUB_X, hubY)} color={BUS_COLOR[p.bus]} on={selected === b.id} dim={selected !== b.id} />;
      })}
      <Cable d={hz(HUB_X + 36, GI2C.y + SOCK_H / 2, BX, GI2C.y + SOCK_H / 2)} color={BUS_COLOR["I²C"]} on={sharedI2c} dim={!sharedI2c} />
      <Cable d={hz(HUB_X + 36, GDA.y + SOCK_H / 2, BX, GDA.y + SOCK_H / 2)} color={BUS_COLOR.Analog} on={selPlan.socket === "gda"} dim={selPlan.socket !== "gda"} />

      {/* hubs */}
      {[
        { y: GI2C.y + SOCK_H / 2, t: "I²C hub" },
        { y: GDA.y + SOCK_H / 2, t: "splitter" },
      ].map((h) => (
        <g key={h.t}>
          <g filter="url(#lr-wobble)">
            <rect x={HUB_X} y={h.y - 20} width={36} height={40} rx={5} fill="#fff" stroke={INK} strokeWidth={1.6} />
          </g>
          <text x={HUB_X + 18} y={h.y + 34} textAnchor="middle" fontSize={9.5} fill="#55524a">
            {h.t}
          </text>
        </g>
      ))}

      {/* sockets */}
      <Socket y={GI2C.y} title="Left Grove · I²C" labels={["SCL", "SDA", "VCC", "GND"]} sel={sharedI2c} />
      <Socket y={GDA.y} title="Right Grove · D/A" labels={["A0", "A1", "VCC", "GND"]} sel={selPlan.socket === "gda"} />

      {/* header pins */}
      {HEADER.map((p) => {
        const used = usedNums.has(p.n);
        const ring = (sharedI2c && (p.n === 3 || p.n === 5)) || (Array.isArray(selPlan.socket) && selPlan.socket.includes(p.n));
        return <Pin key={p.n} p={p} used={used} ring={ring} selected={pin === p.n} onPick={() => onPin(p.n)} />;
      })}

      {/* pills + cables on the right */}
      {Object.entries(USED_EVEN).map(([n, id]) => {
        const num = Number(n);
        const y = rowY(num);
        const b = BOXES.find((x) => x.id === id)!;
        const p = plan(id);
        const on = selected === id;
        const targetY = id === "wioe5" ? (num === 8 ? b.y + 14 : b.y + 38) : b.y + BOX_H / 2;
        return (
          <g key={n}>
            <Cable d={hz(DX_E + 160, y, b.x, targetY)} color={BUS_COLOR[p.bus]} on={on} dim={!on} />
            <g onClick={() => onPin(num)} onKeyDown={onKey(() => onPin(num))} role="button" tabIndex={0} aria-label={`Header pin ${num}`} style={{ cursor: "pointer" }}>
              <g filter="url(#lr-wobble)">
                <rect x={DX_E + 38} y={y - 10} width={122} height={20} rx={10} fill={BUS_COLOR[p.bus]} stroke={INK} strokeWidth={on ? 2.2 : 1.4} />
              </g>
              <text x={DX_E + 50} y={y + 4} fontSize={10.5} fontWeight={600} fill={INK}>
                {HEADER[num - 1].label}
                {id === "wioe5" && (
                  <tspan fill="#55524a" fontWeight={400} dx={4}>
                    {num === 8 ? "RX" : "TX"}
                  </tspan>
                )}
              </text>
            </g>
          </g>
        );
      })}

      {/* parts */}
      {BOXES.map((b) => (
        <PartBox key={b.id} b={b} selected={selected === b.id} onSelect={() => onSelect(b.id)} plan={plan(b.id)} />
      ))}

      {/* footnote for the right column */}
      <text x={RIGHT_X} y={BY + BH - 80} fontSize={10.5} fill="#7a766a">
        <tspan x={RIGHT_X} dy={0}>The relays and the radio also</tspan>
        <tspan x={RIGHT_X} dy={14}>need power and ground from</tspan>
        <tspan x={RIGHT_X} dy={14}>the header: 5V (2, 4), 3V3 (1),</tspan>
        <tspan x={RIGHT_X} dy={14}>and GND (6).</tspan>
      </text>
    </svg>
  );
}

const KINDS: PinKind[] = ["power", "gnd", "i2c", "uart", "gpio", "spi", "other"];

export function PinLegend() {
  return (
    <div className="lr-pin-legend" aria-label="Pin colours">
      {KINDS.map((k) => (
        <span key={k}>
          <i style={{ background: KIND_COLOR[k] }} />
          {KIND_LABEL[k]}
        </span>
      ))}
    </div>
  );
}

function PartCard({ id }: { id: PartId }) {
  const p = WIRING.find((w) => w.id === id)!;
  return (
    <>
      <div className="lr-card">
        <h4>{p.title}</h4>
        <p className="lr-fine">{p.bus} connection</p>
        <table className="lr-pintable">
          <thead>
            <tr>
              <th>Part pin</th>
              <th>Lands on</th>
              <th>Basis</th>
            </tr>
          </thead>
          <tbody>
            {p.links.map((l) => (
              <tr key={l.from + l.to}>
                <td>{l.from}</td>
                <td>
                  {l.to}
                  {l.arduino && (
                    <>
                      {" "}
                      <code>{l.arduino}</code>
                    </>
                  )}
                </td>
                <td>
                  <span className={`lr-basis ${l.basis}`}>{l.basis === "docs" ? "Seeed docs" : "my plan"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>{p.note}</p>
      </div>
      <div className="lr-terminal" aria-label="Example Arduino code">
        <div className="lr-terminal-bar">Arduino sketch</div>
        <pre>{p.snippet}</pre>
      </div>
    </>
  );
}

function PinCard({ n }: { n: number }) {
  const p = HEADER[n - 1];
  return (
    <>
      <div className="lr-card">
        <h4>
          Header pin {p.n} · {p.label}
        </h4>
        <p className="lr-fine">{KIND_LABEL[p.kind]}</p>
        <table className="lr-pintable">
          <tbody>
            {p.bcm !== undefined && (
              <tr>
                <td>Raspberry Pi name</td>
                <td>BCM{p.bcm}</td>
              </tr>
            )}
            {p.mcu && (
              <tr>
                <td>Chip pin</td>
                <td>{p.mcu}</td>
              </tr>
            )}
            {p.arduino && (
              <tr>
                <td>In your sketch</td>
                <td>
                  <code>{p.arduino}</code>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {p.note && <p>{p.note}</p>}
      </div>
      <div className="lr-card">
        <p className="lr-fine">
          Tap a part on the sides to see how it is wired, or tap another pin. The header uses the same layout as a Raspberry Pi, so pin numbers count down the two columns in pairs.
        </p>
      </div>
    </>
  );
}

/** The scene plus its info panel, with its own selection state. */
export default function PinoutView({ initial = "sht40" }: { initial?: PartId }) {
  const [sel, setSel] = useState<PartId>(initial);
  const [pin, setPin] = useState<number | null>(null);
  return (
    <div className="lr-stack">
      <div className="lr-pinout-wrap">
      <PinoutScene
        selected={sel}
        pin={pin}
        onSelect={(id) => {
          setSel(id);
          setPin(null);
        }}
        onPin={setPin}
      />
      </div>
      <PinLegend />
      <div className="lr-split">{pin !== null ? <PinCard n={pin} /> : <PartCard id={sel} />}</div>
    </div>
  );
}
