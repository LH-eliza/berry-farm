/**
 * Original hand-drawn style line illustrations for the course.
 * Black outlines, flat pastel fills, a few spot colours. The wobble comes
 * from the shared #lr-wobble filter defined once in LearnApp.
 */
const INK = "#1c1c1c";
const SAGE = "#bfe0c8";
const YELLOW = "#f6e05e";
const CORAL = "#f08a80";
const SKY = "#9fd8f2";
const SAND = "#efe3cf";

function Svg({ children, label, className }: { children: React.ReactNode; label?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`lr-ill ${className ?? ""}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <g fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" filter="url(#lr-wobble)">
        {children}
      </g>
    </svg>
  );
}

const Berry = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -10 C12 -10 14 2 0 16 C-14 2 -12 -10 0 -10Z" fill={CORAL} />
    <path d="M-6 -10 L0 -5 L6 -10" fill={SAGE} />
    <path d="M-4 -1 v0 M3 -2 v0 M0 5 v0 M-5 5 v0 M5 4 v0" strokeWidth={2.4} />
  </g>
);

export function BerryPlant({ className }: { className?: string }) {
  return (
    <Svg label="Strawberry plant in a pot" className={className}>
      <path d="M38 84 H82 L76 112 H44 Z" fill="#fff" />
      <path d="M34 84 H86" />
      <path d="M60 84 C60 70 58 60 50 50 M60 84 C60 70 66 60 74 50 M60 84 C56 76 48 72 38 70 M60 84 C64 76 72 72 82 70" />
      <ellipse cx={47} cy={46} rx={11} ry={7} transform="rotate(-40 47 46)" fill={SAGE} />
      <ellipse cx={75} cy={44} rx={11} ry={7} transform="rotate(40 75 44)" fill={SAGE} />
      <ellipse cx={33} cy={68} rx={11} ry={7} transform="rotate(-10 33 68)" fill={SAGE} />
      <ellipse cx={88} cy={68} rx={11} ry={7} transform="rotate(10 88 68)" fill={SAGE} />
      <Berry x={60} y={64} s={0.9} />
      <path d="M58 30 q2 -8 6 -2 M20 36 l4 4 M98 30 l-5 5" strokeWidth={1.6} />
    </Svg>
  );
}

export function SunThermo({ className }: { className?: string }) {
  return (
    <Svg label="Sun and thermometer" className={className}>
      <circle cx={42} cy={48} r={15} fill={YELLOW} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <path key={i} d={`M${42 + Math.cos(a) * 22} ${48 + Math.sin(a) * 22} L${42 + Math.cos(a) * 29} ${48 + Math.sin(a) * 29}`} />;
      })}
      <rect x={80} y={22} width={14} height={62} rx={7} fill="#fff" />
      <circle cx={87} cy={92} r={11} fill={CORAL} />
      <path d="M87 80 V42" stroke={CORAL} strokeWidth={5} />
      <path d="M98 34 h6 M98 46 h6 M98 58 h6" strokeWidth={1.6} />
      <path d="M26 96 q8 -8 16 0 t16 0" strokeWidth={1.6} />
    </Svg>
  );
}

export function WateringCan({ className }: { className?: string }) {
  return (
    <Svg label="Watering can" className={className}>
      <path d="M28 56 H72 L68 98 H32 Z" fill={SKY} />
      <path d="M72 66 L98 46 L104 52 L74 80" fill="#fff" />
      <path d="M28 62 C10 58 12 92 32 90" />
      <path d="M40 56 C40 46 60 46 60 56" />
      <path d="M106 64 q5 8 0 11 q-5 -3 0 -11 M98 78 q4 7 0 9 q-4 -2 0 -9 M112 82 q3 6 0 8 q-3 -2 0 -8" fill={SKY} strokeWidth={1.6} />
      <path d="M38 76 q6 -5 12 0 t12 0" strokeWidth={1.6} />
    </Svg>
  );
}

export function SensorBoard({ className }: { className?: string }) {
  return (
    <Svg label="Sensor board with a soil probe" className={className}>
      <rect x={14} y={24} width={58} height={42} rx={6} fill="#fff" />
      <rect x={20} y={30} width={46} height={26} rx={2} fill={SAGE} />
      <path d="M24 50 L33 42 L42 47 L52 36 L62 41" strokeWidth={1.8} />
      <circle cx={26} cy={61} r={1.6} fill={INK} />
      <circle cx={34} cy={61} r={1.6} fill={INK} />
      <path d="M72 46 C94 46 96 70 82 78" />
      <path d="M40 112 Q72 84 108 112" fill={SAND} />
      <rect x={76} y={66} width={9} height={36} rx={3} fill="#fff" />
      <path d="M78 90 h5 M78 96 h5" strokeWidth={1.6} />
      <path d="M96 40 q4 -6 8 0 M92 30 q8 -10 16 0" strokeWidth={1.6} />
    </Svg>
  );
}

export function Fan({ className }: { className?: string }) {
  return (
    <Svg label="Ventilation fan" className={className}>
      <circle cx={64} cy={60} r={34} fill="#fff" />
      {[0, 120, 240].map((a) => (
        <ellipse key={a} cx={64} cy={42} rx={9} ry={16} transform={`rotate(${a} 64 60)`} fill={SKY} />
      ))}
      <circle cx={64} cy={60} r={5} fill={YELLOW} />
      <path d="M12 46 h16 M8 60 h14 M14 74 h16" strokeWidth={1.8} />
      <path d="M46 98 L40 112 M82 98 L88 112 M36 112 H92" />
    </Svg>
  );
}

export function BeeFlower({ className }: { className?: string }) {
  return (
    <Svg label="Bee on a strawberry flower" className={className}>
      <path d="M48 112 C48 92 52 82 54 70" />
      <path d="M50 96 q-14 -4 -18 -16 q14 0 18 16" fill={SAGE} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={54} cy={50} rx={8} ry={12} transform={`rotate(${a} 54 62)`} fill="#fff" />
      ))}
      <circle cx={54} cy={62} r={7} fill={YELLOW} />
      <ellipse cx={92} cy={38} rx={11} ry={8} fill={YELLOW} />
      <path d="M88 31 v14 M95 31 v14" />
      <ellipse cx={86} cy={27} rx={7} ry={5} transform="rotate(-25 86 27)" fill={SKY} />
      <ellipse cx={97} cy={27} rx={7} ry={5} transform="rotate(25 97 27)" fill={SKY} />
      <path d="M70 20 q-4 8 6 10 q10 2 6 14" strokeDasharray="3 5" strokeWidth={1.6} />
    </Svg>
  );
}

export function Basket({ className }: { className?: string }) {
  return (
    <Svg label="Basket of strawberries" className={className}>
      <Berry x={40} y={50} s={0.95} />
      <Berry x={64} y={42} s={1} />
      <Berry x={86} y={52} s={0.9} />
      <path d="M22 62 H98 L90 106 H30 Z" fill={SAND} />
      <path d="M26 74 H94 M28 88 H92 M44 62 L48 106 M60 62 V106 M76 62 L72 106" strokeWidth={1.5} />
      <path d="M104 30 l4 -6 M12 36 l-6 -4" strokeWidth={1.6} />
    </Svg>
  );
}

/* small feature icons */
export function IconThermo({ className }: { className?: string }) {
  return (
    <Svg label="Temperature" className={className}>
      <rect x={50} y={16} width={20} height={64} rx={10} fill="#fff" />
      <circle cx={60} cy={90} r={16} fill={CORAL} />
      <path d="M60 78 V36" stroke={CORAL} strokeWidth={6} />
      <path d="M78 28 h8 M78 44 h8 M78 60 h8" strokeWidth={1.8} />
      <path d="M24 30 l6 6 M20 52 h8 M24 74 l6 -6" strokeWidth={1.6} />
    </Svg>
  );
}

export function IconCloud({ className }: { className?: string }) {
  return (
    <Svg label="Humidity" className={className}>
      <path d="M34 66 C20 66 20 44 38 44 C40 28 70 24 76 42 C96 38 100 66 84 66 Z" fill="#fff" />
      <path d="M40 80 q4 8 0 11 q-4 -3 0 -11 M58 84 q4 8 0 11 q-4 -3 0 -11 M76 80 q4 8 0 11 q-4 -3 0 -11" fill={SKY} />
    </Svg>
  );
}

export function IconProbe({ className }: { className?: string }) {
  return (
    <Svg label="Soil moisture probe" className={className}>
      <path d="M16 100 Q60 70 104 100 Z" fill={SAND} />
      <rect x={52} y={20} width={16} height={70} rx={4} fill="#fff" />
      <rect x={55} y={62} width={10} height={22} fill={SAGE} />
      <path d="M56 28 h8 M56 36 h8" strokeWidth={1.6} />
      <path d="M32 104 q4 -4 8 0 M78 106 q4 -4 8 0" strokeWidth={1.6} />
    </Svg>
  );
}

export function IconDrip({ className }: { className?: string }) {
  return (
    <Svg label="Drip irrigation" className={className}>
      <path d="M8 38 H70" strokeWidth={5} />
      <rect x={66} y={30} width={22} height={16} rx={5} fill={SKY} />
      <path d="M77 54 q7 12 0 16 q-7 -4 0 -16 M77 80 q4 7 0 9 q-4 -2 0 -9" fill={SKY} />
      <path d="M14 104 Q60 88 106 104 Z" fill={SAND} />
      <path d="M96 62 C96 54 104 54 104 62 M100 62 v22" strokeWidth={1.8} />
    </Svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <g fill="none" stroke="#5f9b76" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 36 C8 28 8 14 20 12 C32 14 32 28 20 36Z" />
        <path d="M13 10 L20 14 L27 10 L24 6 L20 9 L16 6Z" />
        <path d="M16 20 v0 M24 20 v0 M20 26 v0" strokeWidth={2.8} />
      </g>
    </svg>
  );
}
