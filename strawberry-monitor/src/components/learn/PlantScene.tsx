"use client";

import { useRef } from "react";
import { CELLS, CROWN, PROBE, clamp } from "@/lib/learn/sim";

export const STAGES = [
  "Dormant",
  "Leaf growth",
  "Flowering",
  "Fruit set",
  "Ripening",
  "Runners & renewal",
] as const;

const W = 640;
const H = 380;
const SOIL_Y = 226;
const CELL_W = W / CELLS;
const CROWN_X = (CROWN + 0.5) * CELL_W;
const PROBE_X = (PROBE + 0.5) * CELL_W;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a: string, b: string, t: number) {
  const A = hex(a);
  const B = hex(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * clamp(t, 0, 1)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function skyColor(hour: number, temp: number) {
  const day = clamp(Math.sin(((hour - 5.5) / 15) * Math.PI), 0, 1);
  let c = mix("#aab6c9", "#eaf4f2", Math.min(1, day * 1.4));
  const hexOf = (rgb: string) => {
    const n = rgb.match(/\d+/g)!.map(Number);
    return "#" + n.map((v) => v.toString(16).padStart(2, "0")).join("");
  };
  if (temp > 27) c = mix(hexOf(c), "#f9e2c0", clamp((temp - 27) / 12, 0, 0.6));
  if (temp < 6) c = mix(hexOf(c), "#f2f6fa", clamp((6 - temp) / 12, 0, 0.5));
  return c;
}

function Leaf({ x, y, rot, s, fill, wet }: { x: number; y: number; rot: number; s: number; fill: string; wet?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={0} cy={-15} rx={11} ry={16} fill={fill} stroke="#1c1c1c" strokeWidth={1.2} />
      <ellipse cx={-13} cy={-6} rx={9} ry={14} fill={fill} stroke="#1c1c1c" strokeWidth={1.2} transform="rotate(-38 -13 -6)" />
      <ellipse cx={13} cy={-6} rx={9} ry={14} fill={fill} stroke="#1c1c1c" strokeWidth={1.2} transform="rotate(38 13 -6)" />
      <path d="M0 0 L0 -26" stroke="#1c1c1c" strokeWidth={1} opacity={0.5} />
      {wet && (
        <>
          <circle cx={-3} cy={-12} r={2.2} fill="#7cc4ee" />
          <circle cx={6} cy={-20} r={1.8} fill="#7cc4ee" />
          <circle cx={-14} cy={-9} r={1.8} fill="#7cc4ee" />
        </>
      )}
    </g>
  );
}

function Berry({ x, y, ripe, green, moldy, s = 1 }: { x: number; y: number; ripe: boolean; green: boolean; moldy: boolean; s?: number }) {
  const fill = ripe ? "#f08a80" : green ? "#d3e8b6" : "#f4b6ae";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 -9 C11 -9 13 2 0 15 C-13 2 -11 -9 0 -9Z" fill={fill} stroke="#1c1c1c" strokeWidth={1} strokeOpacity={ripe ? 0.8 : 0.25} />
      {[
        [-4, -3],
        [3, -4],
        [0, 2],
        [-5, 4],
        [5, 3],
      ].map(([sx, sy], i) => (
        <ellipse key={i} cx={sx} cy={sy} rx={0.9} ry={1.3} fill="#f6e05e" />
      ))}
      <path d="M-6 -9 L0 -5 L6 -9 L3 -12 L0 -9 L-3 -12Z" fill="#b4d8a6" stroke="#1c1c1c" strokeWidth={1} />
      {moldy && (
        <g opacity={0.85}>
          <ellipse cx={1} cy={3} rx={7} ry={6} fill="#9b9b92" />
          <circle cx={-3} cy={0} r={2} fill="#b9b9b0" />
          <circle cx={4} cy={6} r={2.4} fill="#b9b9b0" />
        </g>
      )}
    </g>
  );
}

function Flower({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-6} rx={4.2} ry={6} fill="#fffdf5" stroke="#1c1c1c" strokeWidth={0.8} transform={`rotate(${a})`} />
      ))}
      <circle r={3.2} fill="#f6e05e" stroke="#1c1c1c" strokeWidth={0.8} />
    </g>
  );
}

export interface PlantSceneProps {
  stage: number;
  temp?: number;
  rh?: number;
  hour?: number;
  cells?: number[];
  /** cell index of the drip emitter; null/undefined hides the tube */
  emitter?: number | null;
  pumping?: boolean;
  overhead?: boolean;
  mulch?: boolean;
  crownWet?: number;
  /** gray mould risk (air) 0–100 */
  botrytis?: number;
  fan?: boolean;
  labels?: boolean;
  /** tighter crop around the plant */
  zoom?: boolean;
  probeValue?: number | null;
  onEmitterChange?: (cell: number) => void;
  className?: string;
}

export default function PlantScene({
  stage,
  temp = 20,
  rh = 60,
  hour = 12,
  cells,
  emitter = null,
  pumping = false,
  overhead = false,
  mulch = false,
  crownWet = 0,
  botrytis = 0,
  fan = false,
  labels = false,
  zoom = false,
  probeValue = null,
  onEmitterChange,
  className,
}: PlantSceneProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const moisture = cells ?? Array.from({ length: CELLS }, () => 50);

  const place = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || !onEmitterChange) return;
    const r = svg.getBoundingClientRect();
    const x = ((clientX - r.left) / r.width) * W;
    onEmitterChange(clamp(Math.floor(x / CELL_W), 0, CELLS - 1));
  };

  const dormant = stage === 0;
  const leafFill = dormant ? "#dcd39c" : "#b4d8a6";
  const leafCount = [4, 7, 8, 8, 8, 8][stage];
  const reach = [34, 52, 64, 66, 66, 62][stage];
  const humid = rh >= 70;
  const veryHumid = rh >= 85;
  const leavesWet = veryHumid || crownWet > 20;
  const moldy = botrytis > 55;

  const angles = [-72, -48, -26, -8, 8, 26, 48, 72].slice(0, leafCount);
  const sorted = leafCount === 4 ? [-62, -22, 22, 62] : angles;

  const flowers = stage === 2 ? [[-58, 150], [-8, 140], [52, 152], [26, 168]] : [];
  const berries =
    stage >= 3
      ? [
          [-70, 196],
          [-40, 206],
          [38, 204],
          [74, 194],
          [100, 210],
        ]
      : [];

  return (
    <svg
      ref={svgRef}
      viewBox={zoom ? "130 60 380 320" : `0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={`Strawberry bed cross-section, stage: ${STAGES[stage]}`}
      style={{ touchAction: onEmitterChange ? "none" : undefined, cursor: onEmitterChange ? "ew-resize" : undefined }}
      onPointerDown={(e) => {
        if (!onEmitterChange) return;
        dragging.current = true;
        (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
        place(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && place(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <defs>
        <linearGradient id="soilShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.1" />
        </linearGradient>
        <filter id="ps-wobble" filterUnits="userSpaceOnUse" x="-20" y="-20" width="700" height="420">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2" />
        </filter>
        <radialGradient id="crownGlow">
          <stop offset="0" stopColor="#58b6f0" stopOpacity="0.65" />
          <stop offset="1" stopColor="#58b6f0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g filter="url(#ps-wobble)">
      {/* sky */}
      <rect width={W} height={SOIL_Y} fill={skyColor(hour, temp)} />
      {(() => {
        const t = hour / 24;
        const sx = 40 + t * 560;
        const sy = 150 - Math.sin(t * Math.PI) * 110;
        const night = hour < 5.5 || hour > 19.5;
        return night ? (
          <circle cx={sx} cy={clamp(sy, 40, 150)} r={14} fill="#fffbe6" stroke="#1c1c1c" strokeWidth={1.6} />
        ) : (
          <circle cx={sx} cy={sy} r={18} fill="#f6e05e" stroke="#1c1c1c" strokeWidth={1.8} />
        );
      })()}

      {/* humidity mist */}
      {humid && (
        <g opacity={clamp((rh - 65) / 40, 0.15, 0.7)}>
          {[
            [90, 120, 46],
            [210, 80, 38],
            [330, 130, 52],
            [470, 90, 40],
            [560, 150, 44],
            [150, 175, 34],
            [420, 170, 36],
          ].map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#fff" stroke="#1c1c1c" strokeOpacity={0.25} className="lr-mist" style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
        </g>
      )}

      {/* soil cells */}
      {moisture.map((m, i) => (
        <rect key={i} x={i * CELL_W} y={SOIL_Y} width={CELL_W + 0.5} height={H - SOIL_Y} fill={mix("#f3e9d6", "#a58664", m / 100)} />
      ))}
      <rect x={0} y={SOIL_Y} width={W} height={H - SOIL_Y} fill="url(#soilShade)" />
      {Array.from({ length: 46 }, (_, i) => (
        <circle key={i} cx={(i * 97) % W} cy={SOIL_Y + 14 + ((i * 53) % 130)} r={1.4 + (i % 3) * 0.5} fill="#1c1c1c" opacity={0.18} />
      ))}
      <line x1={0} y1={SOIL_Y} x2={W} y2={SOIL_Y} stroke="#1c1c1c" strokeWidth={2.5} />

      {/* mulch */}
      {mulch &&
        Array.from({ length: 52 }, (_, i) => {
          const x = i * 12.6 + ((i * 7) % 5);
          const a = ((i * 37) % 60) - 30;
          return <line key={i} x1={x} y1={SOIL_Y - 1} x2={x + 14} y2={SOIL_Y - 4 - (i % 3)} stroke="#e3bd4f" strokeWidth={2.4} strokeLinecap="round" transform={`rotate(${a / 6} ${x} ${SOIL_Y})`} />;
        })}

      {/* roots (shallow) */}
      <g stroke="#1c1c1c" strokeWidth={1.7} fill="none" strokeLinecap="round" opacity={0.7}>
        {[-34, -18, -6, 6, 18, 34].map((dx, i) => (
          <path key={i} d={`M${CROWN_X + dx / 4} ${SOIL_Y + 4} q ${dx * 0.8} 26 ${dx * 0.5} ${52 + (i % 3) * 14} q ${dx * -0.2} 14 ${dx * 0.3} 22`} />
        ))}
      </g>

      {/* runners */}
      {stage === 5 && (
        <g>
          {[-1, 1].map((d) => (
            <g key={d}>
              <path d={`M${CROWN_X} ${SOIL_Y - 8} Q ${CROWN_X + d * 120} ${SOIL_Y - 56} ${CROWN_X + d * 210} ${SOIL_Y - 6}`} stroke="#1c1c1c" strokeWidth={2.4} fill="none" />
              <Leaf x={CROWN_X + d * 210} y={SOIL_Y - 4} rot={-24} s={0.55} fill="#b4d8a6" />
              <Leaf x={CROWN_X + d * 210} y={SOIL_Y - 4} rot={24} s={0.55} fill="#b4d8a6" />
              <path d={`M${CROWN_X + d * 210} ${SOIL_Y} q 4 14 -2 24 M${CROWN_X + d * 210} ${SOIL_Y} q -6 12 4 20`} stroke="#1c1c1c" strokeWidth={1.6} fill="none" />
            </g>
          ))}
        </g>
      )}

      {/* plant */}
      <g className="lr-sway">
        {sorted.map((a, i) => {
          const ex = CROWN_X + Math.sin((a * Math.PI) / 180) * reach * 1.3;
          const ey = SOIL_Y - 6 - Math.cos((a * Math.PI) / 180) * reach * 1.05;
          return (
            <g key={i}>
              <path d={`M${CROWN_X} ${SOIL_Y - 4} L${ex} ${ey}`} stroke="#1c1c1c" strokeWidth={2.2} />
              <Leaf x={ex} y={ey} rot={a * 0.9} s={dormant ? 0.7 : 1 + (i % 2) * 0.12} fill={i % 2 ? leafFill : mix("#b4d8a6", "#c6e4b8", 0.5)} wet={leavesWet} />
            </g>
          );
        })}
        {flowers.map(([dx, y], i) => (
          <g key={i}>
            <path d={`M${CROWN_X} ${SOIL_Y - 4} Q ${CROWN_X + dx / 2} ${y + 40} ${CROWN_X + dx} ${y}`} stroke="#1c1c1c" strokeWidth={1.6} fill="none" />
            <Flower x={CROWN_X + dx} y={y} />
          </g>
        ))}
        {berries.map(([dx, y], i) => (
          <g key={i}>
            <path d={`M${CROWN_X} ${SOIL_Y - 4} Q ${CROWN_X + dx * 0.55} ${y - 18} ${CROWN_X + dx} ${y - 8}`} stroke="#1c1c1c" strokeWidth={1.6} fill="none" />
            <Berry x={CROWN_X + dx} y={y} ripe={stage >= 4} green={stage === 3} moldy={moldy && stage >= 3} s={stage === 3 ? 0.75 : 1} />
          </g>
        ))}
        {/* crown */}
        <ellipse cx={CROWN_X} cy={SOIL_Y - 3} rx={13} ry={8} fill="#e1b48a" stroke="#1c1c1c" strokeWidth={1.8} />
        <path d={`M${CROWN_X - 8} ${SOIL_Y - 5} q 8 -5 16 0`} stroke="#1c1c1c" strokeWidth={1.6} fill="none" />
      </g>

      {/* wet crown glow */}
      {crownWet > 12 && (
        <g>
          <circle cx={CROWN_X} cy={SOIL_Y - 4} r={34} fill="url(#crownGlow)" opacity={clamp(crownWet / 60, 0.3, 1)} />
          <g transform={`translate(${CROWN_X + 30} ${SOIL_Y - 60})`}>
            <rect width={78} height={20} rx={10} fill="#9fd8f2" stroke="#1c1c1c" strokeWidth={1.5} />
            <text x={39} y={14} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1c1c1c">
              wet crown!
            </text>
          </g>
        </g>
      )}

      {/* drip line / overhead sprinkler */}
      {emitter !== null && !overhead && (
        <g>
          <line x1={0} y1={SOIL_Y - 14} x2={(emitter + 0.5) * CELL_W} y2={SOIL_Y - 14} stroke="#1c1c1c" strokeWidth={5} strokeLinecap="round" />
          <g transform={`translate(${(emitter + 0.5) * CELL_W} ${SOIL_Y - 14})`}>
            <rect x={-8} y={-6} width={16} height={12} rx={4} fill="#9fd8f2" stroke="#1c1c1c" strokeWidth={1.8} />
            {pumping &&
              [0, 1, 2].map((i) => (
                <circle key={i} cx={(i - 1) * 3} cy={10} r={2.6} fill="#9fd8f2" stroke="#1c1c1c" strokeWidth={0.8} className="lr-drop" style={{ animationDelay: `${i * 0.28}s` }} />
              ))}
            <text y={-12} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1c1c1c" opacity={onEmitterChange ? 1 : 0}>
              ◀ drag ▶
            </text>
          </g>
          {Math.abs(emitter - CROWN) > 0 && (
            <g fontSize={11} fontWeight={700} fill="#1c1c1c">
              <line x1={CROWN_X} y1={SOIL_Y - 24} x2={(emitter + 0.5) * CELL_W} y2={SOIL_Y - 24} stroke="#1c1c1c" strokeWidth={1.2} strokeDasharray="3 3" />
              <text x={(CROWN_X + (emitter + 0.5) * CELL_W) / 2} y={SOIL_Y - 29} textAnchor="middle">
                {Math.round(Math.abs(emitter - CROWN) * 4)} cm
              </text>
            </g>
          )}
        </g>
      )}
      {overhead && (
        <g>
          <rect x={304} y={26} width={32} height={14} rx={5} fill="#9fd8f2" stroke="#1c1c1c" strokeWidth={1.8} />
          <line x1={320} y1={40} x2={320} y2={0} stroke="#1c1c1c" strokeWidth={4} />
          {pumping &&
            Array.from({ length: 26 }, (_, i) => (
              <circle key={i} cx={320 + ((i % 13) - 6) * 22} cy={60 + ((i * 29) % 120)} r={2.6} fill="#9fd8f2" stroke="#1c1c1c" strokeWidth={0.8} className="lr-drop long" style={{ animationDelay: `${(i % 7) * 0.13}s` }} />
            ))}
        </g>
      )}

      {/* probe */}
      {probeValue !== null && (
        <g>
          <rect x={PROBE_X - 5} y={SOIL_Y + 4} width={10} height={84} rx={3} fill="#fff" stroke="#1c1c1c" strokeWidth={1.8} />
          <rect x={PROBE_X - 3} y={SOIL_Y + 60} width={6} height={22} fill="#bfe0c8" />
          <line x1={PROBE_X} y1={SOIL_Y + 4} x2={PROBE_X} y2={SOIL_Y - 38} stroke="#1c1c1c" strokeWidth={2} />
          <g transform={`translate(${PROBE_X + 6} ${SOIL_Y - 56})`}>
            <rect width={66} height={20} rx={5} fill="#fff" stroke="#1c1c1c" strokeWidth={1.6} />
            <text x={33} y={14} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1c1c1c">
              soil {Math.round(probeValue)}%
            </text>
          </g>
        </g>
      )}

      {/* fan */}
      {fan !== undefined && (hour !== undefined) && fan && (
        <g transform="translate(590 40)">
          <circle r={24} fill="#fff" stroke="#1c1c1c" strokeWidth={2} />
          <g className="lr-fan">
            {[0, 120, 240].map((a) => (
              <ellipse key={a} cx={0} cy={-10} rx={5} ry={11} fill="#9fd8f2" stroke="#1c1c1c" strokeWidth={1.2} transform={`rotate(${a})`} />
            ))}
          </g>
          <circle r={3} fill="#1c1c1c" />
          <text y={40} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1c1c1c">
            fan on
          </text>
        </g>
      )}

      </g>

      {/* anatomy labels */}
      {labels && (
        <g fontSize={12} fontWeight={700} fill="#1c1c1c">
          {[
            { x: 120, y: SOIL_Y + 62, tx: CROWN_X - 12, ty: SOIL_Y - 2, t: "Crown · the growth point" },
            { x: 468, y: SOIL_Y + 90, tx: CROWN_X + 26, ty: SOIL_Y + 52, t: "Roots · shallow, top 15–30 cm" },
            ...(stage >= 1 ? [{ x: 80, y: 74, tx: CROWN_X - 78, ty: SOIL_Y - 66, t: "Leaves · trifoliate" }] : []),
            ...(stage === 2 ? [{ x: 470, y: 62, tx: CROWN_X + 52, ty: 150, t: "Flower · self-fertile" }] : []),
            ...(stage >= 3 && stage <= 4 ? [{ x: 470, y: 62, tx: CROWN_X + 74, ty: 196, t: stage === 3 ? "Green fruit" : "Ripe berry" }] : []),
            ...(stage === 5 ? [{ x: 470, y: 62, tx: CROWN_X + 210, ty: SOIL_Y - 14, t: "Runner → daughter plant" }] : []),
          ].map((l, i) => (
            <g key={i}>
              <line x1={l.x + 6} y1={l.y} x2={l.tx} y2={l.ty} stroke="#1c1c1c" strokeWidth={1.4} />
              <circle cx={l.tx} cy={l.ty} r={3} fill="#1c1c1c" />
              <rect x={l.x - 6 - l.t.length * 3.2} y={l.y - 14} width={l.t.length * 6.4 + 12} height={22} rx={11} fill="#fff" stroke="#1c1c1c" strokeWidth={1.6} />
              <text x={l.x - l.t.length * 3.2} y={l.y + 1}>{l.t}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}
