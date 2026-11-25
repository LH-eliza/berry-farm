"use client";

import { clamp } from "@/lib/learn/sim";
import { PART_INFO, type PartId } from "./parts";

/**
 * Isometric drawing of the kit wired to a potted strawberry plant.
 * Positions are given as screen anchors and converted to the iso world grid.
 */
const S = 30;
const KX = 0.866 * S;
const KY = 0.5 * S;
const OX = 330;
const OY = 70;
const INK = "#1c1c1c";
type P = [number, number];

const iso = (x: number, y: number, z = 0): P => [OX + (x - y) * KX, OY + (x + y) * KY - z * S];
const at = (X: number, Y: number): P => {
  const a = (X - OX) / KX;
  const b = (Y - OY) / KY;
  return [(a + b) / 2, (b - a) / 2];
};
const pts = (a: P[]) => a.map((p) => p.join(",")).join(" ");

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t, 0, 1)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

function Box({
  x,
  y,
  z = 0,
  w,
  d,
  h,
  top,
  left,
  right,
}: {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  top: string;
  left: string;
  right: string;
}) {
  const t = [iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const l = [iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h)];
  const r = [iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h)];
  return (
    <g stroke={INK} strokeWidth={1.6} strokeLinejoin="round">
      <polygon points={pts(l)} fill={left} />
      <polygon points={pts(r)} fill={right} />
      <polygon points={pts(t)} fill={top} />
    </g>
  );
}

/** Content drawn in the top-face plane (u along +x, v along +y, in world units). */
function TopFace({ x, y, z, children }: { x: number; y: number; z: number; children: React.ReactNode }) {
  const p = iso(x, y, z);
  return <g transform={`matrix(${KX} ${KY} ${-KX} ${KY} ${p[0]} ${p[1]})`}>{children}</g>;
}

/** Content drawn on the +y ("left") face. u along x, v up. */
function LeftFace({ x, y, z, children }: { x: number; y: number; z: number; children: React.ReactNode }) {
  const p = iso(x, y, z);
  return <g transform={`matrix(${KX} ${KY} 0 ${-S} ${p[0]} ${p[1]})`}>{children}</g>;
}

function Post({ x, y, h }: { x: number; y: number; h: number }) {
  return <Box x={x - 0.12} y={y - 0.12} w={0.24} d={0.24} h={h} top="#fff" left="#e6e1d4" right="#d4cebd" />;
}

type Wire = { id: string; from: P; to: P; color: string; active: boolean; flowIn?: boolean };

function Cable({ from, to, color, active }: Wire) {
  const sag = 55;
  const d = `M${from[0]} ${from[1]} C${from[0] + (to[0] - from[0]) * 0.15} ${from[1] + sag} ${to[0] - (to[0] - from[0]) * 0.15} ${to[1] + sag} ${to[0]} ${to[1]}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} stroke={INK} strokeWidth={5.2} />
      <path d={d} stroke={color} strokeWidth={3} />
      {active && <path d={d} stroke="#fff" strokeWidth={1.8} className="lr-flow" />}
    </g>
  );
}

function Callout({
  x,
  y,
  ax,
  ay,
  title,
  value,
  selected,
  dim,
  k = 1,
  onClick,
}: {
  x: number;
  y: number;
  ax: number;
  ay: number;
  title: string;
  value?: string;
  selected: boolean;
  dim: boolean;
  k?: number;
  onClick?: () => void;
}) {
  const w = Math.max(title.length * 6.3, (value?.length ?? 0) * 6) + 26;
  const h = value ? 34 : 22;
  return (
    <g opacity={dim ? 0.4 : 1} style={{ cursor: onClick ? "pointer" : undefined }} onClick={onClick}>
      <line x1={x} y1={y + h / 2} x2={ax} y2={ay} stroke={INK} strokeWidth={1.2} />
      <circle cx={ax} cy={ay} r={3.4} fill="#8fc3a1" stroke={INK} strokeWidth={1.2} />
      <g transform={`translate(${x} ${y + h / 2}) scale(${k}) translate(${-x} ${-(y + h / 2)})`}>
      <rect x={x - w / 2} y={y} width={w} height={h} rx={h / 2} fill={selected ? "#f6e05e" : "#fff"} stroke={INK} strokeWidth={1.5} />
      <text x={x - w / 2 + 16} y={y + (value ? 14 : 15)} fontSize={10.5} fontWeight={700} fill={INK} fontFamily="var(--sans)">
        {title}
      </text>
      {value && (
        <text x={x - w / 2 + 16} y={y + 27} fontSize={10} fill="#4a4a46" fontFamily="ui-monospace, Menlo, monospace">
          {value}
        </text>
      )}
      <circle cx={x - w / 2 + 9} cy={y + h / 2} r={3} fill={selected ? INK : "#8fc3a1"} />
      </g>
    </g>
  );
}

export interface CircuitSceneProps {
  parts: PartId[];
  /** parts drawn at full strength; others are dimmed (defaults to all) */
  focus?: PartId[];
  selected?: PartId | null;
  onSelect?: (id: PartId) => void;
  temp?: number;
  rh?: number;
  soil?: number;
  lux?: number;
  eco2?: number;
  fan?: boolean;
  pump?: boolean;
  /** data is flowing along the cables */
  active?: boolean;
  /** enlarge callout pills (use in narrow layouts) */
  labelScale?: number;
  className?: string;
}

export default function CircuitScene({
  parts,
  focus,
  selected = null,
  onSelect,
  temp = 21,
  rh = 60,
  soil = 48,
  lux = 3200,
  eco2 = 430,
  fan = false,
  pump = false,
  active = true,
  labelScale = 1,
  className,
}: CircuitSceneProps) {
  const has = (id: PartId) => parts.includes(id);
  const dim = (id: PartId) => (focus ? !focus.includes(id) : false);
  const op = (id: PartId) => (dim(id) ? 0.38 : 1);
  const pick = (id: PartId) => (onSelect ? () => onSelect(id) : undefined);
  const name = (id: PartId) => PART_INFO.find((p) => p.id === id)!.name;

  /* ---------- geometry ---------- */
  // Wio Terminal
  const [wcx, wcy] = at(185, 338);
  const W = { x: wcx - 2.5, y: wcy - 1.8, w: 5, d: 3.6, h: 0.7 };
  const port = (i: number): P => iso(W.x + W.w, W.y + 0.9 + i * 0.9, 0.38);

  // pot + plant
  const [pcx, pcy] = at(395, 335);
  const potTop = iso(pcx, pcy, 2.4);
  const soilFill = mix("#f3e9d6", "#8c6c4a", soil / 100);

  // sensors
  const [shx, shy] = at(585, 325);
  const shBoardZ = 2.7;
  const [lgx, lgy] = at(605, 215);
  const lgZ = 3.3;
  const [sgx, sgy] = at(262, 178);
  const [fnx, fny] = at(405, 150);
  const [pmx, pmy] = at(105, 215);
  const [vsx, vsy] = at(600, 400);
  const probe = { x: pcx + 0.5, y: pcy + 0.3 };

  const wires: Wire[] = [];
  if (has("sht40")) wires.push({ id: "sht40", from: iso(shx - 0.4, shy + 0.5, shBoardZ + 0.05), to: port(0), color: "#f6e05e", active });
  if (has("sgp30")) wires.push({ id: "sgp30", from: iso(sgx + 0.6, sgy + 0.9, 0.15), to: port(0), color: "#f6e05e", active });
  if (has("soil")) wires.push({ id: "soil", from: iso(probe.x, probe.y + 0.45, 3.5), to: port(1), color: "#9fd8f2", active });
  if (has("light")) wires.push({ id: "light", from: iso(lgx - 0.3, lgy + 0.5, lgZ + 0.1), to: port(1), color: "#9fd8f2", active });
  if (has("vision")) wires.push({ id: "vision", from: iso(vsx - 0.5, vsy + 0.5, 0.3), to: port(2), color: "#bfe0c8", active });
  const actuators: Wire[] = [];
  if (has("fan")) actuators.push({ id: "fan", from: port(2), to: iso(fnx - 0.4, fny + 0.5, 0.2), color: "#f08a80", active: active && fan });
  if (has("pump")) actuators.push({ id: "pump", from: port(2), to: iso(pmx + 0.3, pmy + 0.6, 0.3), color: "#f08a80", active: active && pump });

  const screenLines = [`T ${temp.toFixed(1)} C`, `RH ${rh.toFixed(0)} %`, `SOIL ${soil.toFixed(0)} %`];

  /* ---------- parts ---------- */
  const leafAngles = [-70, -42, -18, 6, 30, 56, 78];

  const wioTop = iso(W.x + W.w / 2, W.y + W.d / 2, W.h);

  return (
    <svg viewBox="0 0 760 470" className={className} role="img" aria-label="Isometric wiring diagram of the K1100 kit and a strawberry plant">
      <g filter="url(#lr-wobble)">
        {/* floor */}
        <polygon points={pts([iso(-1, -1), iso(13, -1), iso(13, 11), iso(-1, 11)])} fill="#faf8f2" stroke={INK} strokeOpacity={0.35} strokeWidth={1.2} />
        {Array.from({ length: 13 }, (_, i) => i).map((i) => (
          <g key={i} stroke={INK} strokeOpacity={0.09}>
            <line x1={iso(i, -1)[0]} y1={iso(i, -1)[1]} x2={iso(i, 11)[0]} y2={iso(i, 11)[1]} />
          </g>
        ))}
        {Array.from({ length: 11 }, (_, i) => i).map((i) => (
          <g key={i} stroke={INK} strokeOpacity={0.09}>
            <line x1={iso(-1, i)[0]} y1={iso(-1, i)[1]} x2={iso(13, i)[0]} y2={iso(13, i)[1]} />
          </g>
        ))}

        {/* cables (under the parts) */}
        {wires.map((w) => (
          <g key={w.id} opacity={op(w.id as PartId)}>
            <Cable {...w} />
          </g>
        ))}
        {actuators.map((w) => (
          <g key={w.id} opacity={op(w.id as PartId)}>
            <Cable {...w} />
          </g>
        ))}

        {/* fan on stand */}
        {has("fan") && (
          <g opacity={op("fan")}>
            <Box x={fnx - 0.55} y={fny - 0.55} w={1.1} d={1.1} h={0.45} top="#fff" left="#e6e1d4" right="#d4cebd" />
            <TopFace x={fnx - 0.55} y={fny - 0.55} z={0.45}>
              <circle cx={0.8} cy={0.3} r={0.1} fill={fan ? "#f08a80" : "#d9d5c9"} stroke={INK} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </TopFace>
            <Post x={fnx} y={fny} h={1.9} />
            {(() => {
              const c = iso(fnx, fny, 2.5);
              return (
                <g transform={`translate(${c[0]} ${c[1]})`}>
                  <circle r={27} fill="#fff" stroke={INK} strokeWidth={1.8} />
                  <g className={fan ? "lr-fan" : ""}>
                    {[0, 120, 240].map((a) => (
                      <ellipse key={a} cx={0} cy={-11} rx={6.5} ry={13} transform={`rotate(${a})`} fill="#9fd8f2" stroke={INK} strokeWidth={1.4} />
                    ))}
                  </g>
                  <circle r={4} fill="#f6e05e" stroke={INK} strokeWidth={1.2} />
                  {fan && <path d="M30 -8 q14 4 26 0 M32 4 q14 4 28 0 M30 16 q14 4 24 0" fill="none" stroke={INK} strokeWidth={1.3} className="lr-air" />}
                </g>
              );
            })()}
          </g>
        )}

        {/* SGP30 */}
        {has("sgp30") && (
          <g opacity={op("sgp30")}>
            <Box x={sgx - 0.9} y={sgy - 0.6} w={1.8} d={1.2} h={0.3} top="#bfe0c8" left="#a8cdb4" right="#95bda3" />
            <TopFace x={sgx - 0.9} y={sgy - 0.6} z={0.3}>
              <rect x={0.4} y={0.25} width={0.55} height={0.5} fill="#fff" stroke={INK} strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <rect x={1.1} y={0.35} width={0.4} height={0.3} fill="#2b2f36" stroke={INK} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </TopFace>
          </g>
        )}

        {/* pump + relay */}
        {has("pump") && (
          <g opacity={op("pump")}>
            <Box x={pmx - 0.9} y={pmy - 0.6} w={1.8} d={1.2} h={1} top="#9fd8f2" left="#86c4de" right="#72b0ca" />
            <TopFace x={pmx - 0.9} y={pmy - 0.6} z={1}>
              <circle cx={0.9} cy={0.6} r={0.32} fill="#fff" stroke={INK} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
              <circle cx={1.55} cy={0.3} r={0.1} fill={pump ? "#f08a80" : "#d9d5c9"} stroke={INK} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </TopFace>
          </g>
        )}

        {/* light sensor */}
        {has("light") && (
          <g opacity={op("light")}>
            <Post x={lgx} y={lgy} h={lgZ} />
            <Box x={lgx - 0.55} y={lgy - 0.55} z={lgZ} w={1.1} d={1.1} h={0.28} top="#fff7d1" left="#e7ddb0" right="#d6cc9f" />
            <TopFace x={lgx - 0.55} y={lgy - 0.55} z={lgZ + 0.28}>
              <circle cx={0.55} cy={0.55} r={0.32} fill="#f6e05e" stroke={INK} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
            </TopFace>
            {(() => {
              const c = iso(lgx, lgy, lgZ + 0.5);
              const glow = clamp(lux / 20000, 0, 1);
              return (
                <g transform={`translate(${c[0]} ${c[1]})`} stroke={INK} strokeWidth={1.3} opacity={0.35 + glow * 0.65}>
                  <path d="M0 -22 v-8 M-16 -16 l-6 -6 M16 -16 l6 -6" />
                </g>
              );
            })()}
          </g>
        )}

        {/* pot + plant (always drawn) */}
        {(() => {
          const base = iso(pcx, pcy, 0);
          const rb = 1.55;
          const rt = 2.1;
          const rbx = 1.2247 * S * rb;
          const rby = 0.7071 * S * rb;
          const rtx = 1.2247 * S * rt;
          const rty = 0.7071 * S * rt;
          const top = potTop;
          return (
            <g>
              <path
                d={`M${top[0] - rtx} ${top[1]} L${base[0] - rbx} ${base[1]} A${rbx} ${rby} 0 0 0 ${base[0] + rbx} ${base[1]} L${top[0] + rtx} ${top[1]} Z`}
                fill="#e8b48a"
                stroke={INK}
                strokeWidth={1.7}
                strokeLinejoin="round"
              />
              <path d={`M${top[0] - rtx + 4} ${top[1] + 10} q${rtx - 4} 30 ${2 * rtx - 8} 0`} fill="none" stroke={INK} strokeOpacity={0.25} strokeWidth={1.4} />
              <ellipse cx={top[0]} cy={top[1]} rx={rtx} ry={rty} fill={soilFill} stroke={INK} strokeWidth={1.7} />
              {/* drip emitter above soil */}
              {has("pump") && (
                <g opacity={op("pump")}>
                  <rect x={top[0] + 18} y={top[1] - 62} width={20} height={10} rx={4} fill="#9fd8f2" stroke={INK} strokeWidth={1.4} />
                  {pump &&
                    [0, 1, 2].map((i) => (
                      <circle key={i} cx={top[0] + 28} cy={top[1] - 48} r={2.6} fill="#9fd8f2" stroke={INK} strokeWidth={0.8} className="lr-drop" style={{ animationDelay: `${i * 0.28}s` }} />
                    ))}
                </g>
              )}
              {/* plant */}
              <g transform={`translate(${top[0]} ${top[1] - 4})`}>
                <g className="lr-sway0">
                  {leafAngles.map((a, i) => {
                    const r = (a * Math.PI) / 180;
                    const len = 52 + (i % 3) * 9;
                    const ex = Math.sin(r) * len;
                    const ey = -Math.cos(r) * len * 0.85 - 6;
                    return (
                      <g key={a}>
                        <path d={`M0 0 L${ex} ${ey}`} stroke={INK} strokeWidth={1.6} />
                        <g transform={`translate(${ex} ${ey}) rotate(${a})`}>
                          <ellipse cx={0} cy={-11} rx={9} ry={12} fill="#b4d8a6" stroke={INK} strokeWidth={1.4} />
                          <ellipse cx={-10} cy={-4} rx={7} ry={10} transform="rotate(-38 -10 -4)" fill="#c6e4b8" stroke={INK} strokeWidth={1.4} />
                          <ellipse cx={10} cy={-4} rx={7} ry={10} transform="rotate(38 10 -4)" fill="#c6e4b8" stroke={INK} strokeWidth={1.4} />
                        </g>
                      </g>
                    );
                  })}
                  <g transform="translate(-26 4) scale(0.8)">
                    <path d="M0 -10 C12 -10 14 2 0 16 C-14 2 -12 -10 0 -10Z" fill="#f08a80" stroke={INK} strokeWidth={1.6} />
                    <path d="M-6 -10 L0 -5 L6 -10" fill="#b4d8a6" stroke={INK} strokeWidth={1.4} />
                  </g>
                </g>
                <ellipse cx={0} cy={0} rx={11} ry={6} fill="#e1b48a" stroke={INK} strokeWidth={1.6} />
              </g>
            </g>
          );
        })()}

        {/* SHT40 on a post */}
        {has("sht40") && (
          <g opacity={op("sht40")}>
            <Post x={shx} y={shy} h={shBoardZ} />
            <Box x={shx - 0.75} y={shy - 0.5} z={shBoardZ} w={1.5} d={1} h={0.2} top="#bfe0c8" left="#a8cdb4" right="#95bda3" />
            <TopFace x={shx - 0.75} y={shy - 0.5} z={shBoardZ + 0.2}>
              <rect x={0.45} y={0.3} width={0.55} height={0.4} fill="#fff" stroke={INK} strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <circle cx={0.72} cy={0.5} r={0.08} fill="#8a8a82" />
            </TopFace>
          </g>
        )}

        {/* Wio Terminal */}
        {has("wio") && (
          <g opacity={op("wio")}>
            <Box {...W} top="#3a3a3e" left="#2a2a2d" right="#202023" />
            <TopFace x={W.x} y={W.y} z={W.h}>
              <rect x={0.45} y={0.45} width={3.3} height={2.7} rx={0.1} fill="#dfeee3" stroke={INK} strokeWidth={1.3} vectorEffect="non-scaling-stroke" />
              <circle cx={4.35} cy={1.8} r={0.28} fill="#555" stroke="#bbb" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              {[0.9, 1.5, 2.1].map((v) => (
                <rect key={v} x={4.2} y={v - 0.85} width={0.5} height={0.22} rx={0.08} fill="#f08a80" stroke="#bbb" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
              ))}
            </TopFace>
            {[0, 1, 2].map((i) => {
              const p = port(i);
              return <rect key={i} x={p[0] - 3} y={p[1] - 5} width={6} height={9} fill="#fff" stroke={INK} strokeWidth={1.2} />;
            })}
            {active && <circle cx={iso(W.x + 0.3, W.y + W.d - 0.2, W.h)[0]} cy={iso(W.x + 0.3, W.y + W.d - 0.2, W.h)[1]} r={3} fill="#8fc3a1" stroke="#fff" className="lr-blink" />}
          </g>
        )}

        {/* Wio-E5 radio module on the board */}
        {has("wioe5") && (
          <g opacity={op("wioe5")}>
            <Box x={W.x + 3.9} y={W.y + 0.15} z={W.h} w={0.9} d={0.9} h={0.3} top="#f6e05e" left="#d9c44b" right="#c4b042" />
            {(() => {
              const b = iso(W.x + 4.35, W.y + 0.6, W.h + 0.3);
              return (
                <g>
                  <line x1={b[0]} y1={b[1]} x2={b[0]} y2={b[1] - 56} stroke={INK} strokeWidth={2.2} />
                  <circle cx={b[0]} cy={b[1] - 58} r={3.4} fill="#fff" stroke={INK} strokeWidth={1.4} />
                  {active && (
                    <g fill="none" stroke={INK} strokeWidth={1.3}>
                      <path d={`M${b[0] + 9} ${b[1] - 66} q8 8 0 16`} className="lr-wave" />
                      <path d={`M${b[0] + 17} ${b[1] - 72} q13 14 0 28`} className="lr-wave" style={{ animationDelay: "0.3s" }} />
                      <path d={`M${b[0] - 9} ${b[1] - 66} q-8 8 0 16`} className="lr-wave" />
                      <path d={`M${b[0] - 17} ${b[1] - 72} q-13 14 0 28`} className="lr-wave" style={{ animationDelay: "0.3s" }} />
                    </g>
                  )}
                </g>
              );
            })()}
          </g>
        )}

        {/* soil probe in the pot */}
        {has("soil") && (
          <g opacity={op("soil")}>
            <Box x={probe.x} y={probe.y} z={2.35} w={0.3} d={0.9} h={1.2} top="#fff" left="#f1eee4" right="#dcd7c8" />
            <LeftFace x={probe.x} y={probe.y + 0.9} z={2.35}>
              <rect x={0.05} y={0.08} width={0.2} height={0.5} fill="#bfe0c8" stroke={INK} strokeWidth={0.9} vectorEffect="non-scaling-stroke" />
            </LeftFace>
          </g>
        )}

        {/* Vision AI camera */}
        {has("vision") && (
          <g opacity={op("vision")}>
            <Box x={vsx - 0.65} y={vsy - 0.5} w={1.3} d={1} h={0.9} top="#f4b6ae" left="#e39e95" right="#d08a81" />
            <LeftFace x={vsx - 0.65} y={vsy + 0.5} z={0}>
              <circle cx={0.65} cy={0.5} r={0.3} fill="#2b2f36" stroke={INK} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
              <circle cx={0.58} cy={0.58} r={0.08} fill="#fff" />
            </LeftFace>
          </g>
        )}
      </g>

      {/* screen readout (kept crisp, outside the wobble) */}
      {has("wio") && (
        <g opacity={op("wio")}>
          <TopFace x={W.x} y={W.y} z={W.h}>
            {screenLines.map((l, i) => (
              <text key={l} x={0.7} y={1.1 + i * 0.52} fontSize={0.4} fontFamily="ui-monospace, Menlo, monospace" fontWeight={700} fill={INK}>
                {l}
              </text>
            ))}
            <rect x={0.7} y={2.8} width={2.6 * clamp(soil / 100, 0, 1)} height={0.14} fill="#4f8a5f" />
          </TopFace>
        </g>
      )}

      {/* callouts */}
      {has("wio") && <Callout k={labelScale} x={105} y={392} ax={wioTop[0] - 40} ay={wioTop[1] + 8} title={name("wio")} value={`${active ? "reading…" : "idle"}`} selected={selected === "wio"} dim={dim("wio")} onClick={pick("wio")} />}
      {has("wioe5") && <Callout k={labelScale} x={215} y={206} ax={iso(W.x + 4.35, W.y + 0.6, W.h + 0.3)[0]} ay={iso(W.x + 4.35, W.y + 0.6, W.h + 0.3)[1] - 58} title={name("wioe5")} selected={selected === "wioe5"} dim={dim("wioe5")} onClick={pick("wioe5")} />}
      {has("sgp30") && <Callout k={labelScale} x={262} y={92} ax={iso(sgx, sgy, 0.3)[0]} ay={iso(sgx, sgy, 0.3)[1]} title={name("sgp30")} value={`${eco2.toFixed(0)} ppm CO₂`} selected={selected === "sgp30"} dim={dim("sgp30")} onClick={pick("sgp30")} />}
      {has("fan") && <Callout k={labelScale} x={535} y={20} ax={iso(fnx, fny, 2.5)[0] + 18} ay={iso(fnx, fny, 2.5)[1] - 10} title={name("fan")} value={fan ? "ON" : "off"} selected={selected === "fan"} dim={dim("fan")} onClick={pick("fan")} />}
      {has("pump") && <Callout k={labelScale} x={105} y={115} ax={iso(pmx, pmy, 1)[0]} ay={iso(pmx, pmy, 1)[1]} title={name("pump")} value={pump ? "ON" : "off"} selected={selected === "pump"} dim={dim("pump")} onClick={pick("pump")} />}
      {has("light") && <Callout k={labelScale} x={672} y={72} ax={iso(lgx, lgy, lgZ + 0.3)[0]} ay={iso(lgx, lgy, lgZ + 0.3)[1]} title={name("light")} value={`${lux.toFixed(0)} lux`} selected={selected === "light"} dim={dim("light")} onClick={pick("light")} />}
      {has("sht40") && <Callout k={labelScale} x={672} y={236} ax={iso(shx, shy, shBoardZ + 0.2)[0]} ay={iso(shx, shy, shBoardZ + 0.2)[1]} title={name("sht40")} value={`${temp.toFixed(1)} °C · ${rh.toFixed(0)} %`} selected={selected === "sht40"} dim={dim("sht40")} onClick={pick("sht40")} />}
      {has("soil") && <Callout k={labelScale} x={475} y={402} ax={iso(probe.x, probe.y + 0.45, 3.4)[0]} ay={iso(probe.x, probe.y + 0.45, 3.4)[1]} title={name("soil")} value={`${soil.toFixed(0)} % wet`} selected={selected === "soil"} dim={dim("soil")} onClick={pick("soil")} />}
      {has("vision") && <Callout k={labelScale} x={665} y={418} ax={iso(vsx, vsy, 0.9)[0]} ay={iso(vsx, vsy, 0.9)[1]} title={name("vision")} selected={selected === "vision"} dim={dim("vision")} onClick={pick("vision")} />}
    </svg>
  );
}
