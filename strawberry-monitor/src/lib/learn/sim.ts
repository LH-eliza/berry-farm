/**
 * Teaching model for the /learn course.
 *
 * Ranges come from extension / horticulture guidance (fruit set drops above
 * ~25 °C, crown temps >28–30 °C suppress flowering, 60–75 % RH is the target
 * for protected strawberries, Botrytis needs ~4 h of wetness at 15–22 °C,
 * roots are shallow, water the soil rather than the crown). It is a simplified
 * model meant to build intuition, not a calibrated crop model: tune the
 * numbers against your own K1100 readings.
 */

export const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** 0 below a, ramps to 1 at b, stays 1 until c, ramps back to 0 at d. */
export function trap(x: number, a: number, b: number, c: number, d: number) {
  if (x <= a || x >= d) return 0;
  if (x < b) return (x - a) / (b - a);
  if (x <= c) return 1;
  return (d - x) / (d - c);
}

/** Saturation vapour pressure in kPa (Tetens). */
export const svp = (t: number) => 0.6108 * Math.exp((17.27 * t) / (t + 237.3));
/** Vapour pressure deficit in kPa: how hard the air pulls water from leaves & soil. */
export const vpd = (t: number, rh: number) => svp(t) * (1 - rh / 100);

/* ------------------------------------------------------------------ */
/* Temperature                                                         */
/* ------------------------------------------------------------------ */

export interface TempResponse {
  growth: number;
  fruitSet: number;
  flowers: number;
  runners: number;
  frost: boolean;
  score: number;
}

export function tempResponse(day: number, night: number): TempResponse {
  const growth = trap(day, 4, 16, 24, 35);
  const fruitSet = trap(day, 8, 16, 25, 32);
  const flowers = trap(night, -1, 6, 14, 22) * trap(day, 0, 10, 26, 31);
  const runners = clamp((day - 21) / 9, 0, 1);
  const frost = night <= 0;
  const raw = 0.35 * growth + 0.35 * fruitSet + 0.3 * flowers;
  return {
    growth,
    fruitSet,
    flowers,
    runners,
    frost,
    score: Math.round(100 * raw * (frost ? 0.4 : 1)),
  };
}

/* ------------------------------------------------------------------ */
/* Air: humidity, leaf wetness, gray mould                             */
/* ------------------------------------------------------------------ */

export interface AirState {
  temp: number;
  rh: number;
  /** Minutes of accumulated leaf wetness (decays when dry). */
  wetMin: number;
  /** Gray mould (Botrytis) infection risk, 0–100. */
  risk: number;
}

export interface AirInputs {
  outTemp: number;
  outRH: number;
  fan: boolean;
}

export const initialAir = (outTemp = 15, outRH = 60): AirState => ({
  temp: outTemp + 4,
  rh: clamp(outRH + 14, 0, 98),
  wetMin: 0,
  risk: 0,
});

export function stepAir(s: AirState, i: AirInputs, dt: number): AirState {
  const tempEq = i.fan ? i.outTemp + 0.5 : i.outTemp + 5;
  const rhEq = i.fan ? clamp(i.outRH + 2, 0, 98) : clamp(i.outRH + 14, 0, 98);
  const k = clamp(dt / (i.fan ? 12 : 30), 0, 1);
  const temp = lerp(s.temp, tempEq, k);
  const rh = lerp(s.rh, rhEq, k);

  const wet = rh >= 85;
  const wetMin = clamp(s.wetMin + (wet ? dt : -1.5 * dt), 0, 1440);
  const tempFit = trap(temp, 5, 15, 22, 30);
  const risk = 100 * clamp((wetMin - 120) / 360, 0, 1) * (0.3 + 0.7 * tempFit);
  return { temp, rh, wetMin, risk };
}

/* ------------------------------------------------------------------ */
/* Soil + crown                                                        */
/* ------------------------------------------------------------------ */

/** The bed is 60 cm wide, sliced into 15 cells of 4 cm. */
export const CELLS = 15;
export const CELL_CM = 4;
export const CROWN = 7;
/** The K1100 probe sits one cell beside the crown, in the root zone. */
export const PROBE = 8;
export const ROOT_FROM = 5;
export const ROOT_TO = 9;

export interface SoilState {
  cells: number[];
  /** How wet the crown surface is, 0–100. */
  crownWet: number;
  crownWetMin: number;
  /** Crown rot risk, 0–100. */
  rot: number;
  pumpMin: number;
}

export interface WaterInputs {
  pump: boolean;
  /** Which cell the drip emitter sits over. */
  emitter: number;
  /** Overhead sprinkler instead of drip. */
  overhead: boolean;
  mulch: boolean;
  vpd: number;
  daylight: boolean;
}

const FLOW = 4; // moisture units injected per minute at the emitter

export function initialSoil(moisture = 40): SoilState {
  return {
    cells: Array.from({ length: CELLS }, () => moisture),
    crownWet: 0,
    crownWetMin: 0,
    rot: 0,
    pumpMin: 0,
  };
}

export const rootZone = (cells: number[]) => {
  let sum = 0;
  for (let c = ROOT_FROM; c <= ROOT_TO; c++) sum += cells[c];
  return sum / (ROOT_TO - ROOT_FROM + 1);
};

export function stepSoil(s: SoilState, i: WaterInputs, dt: number): SoilState {
  let cells = s.cells.slice();
  let crownWet = s.crownWet;
  let crownWetMin = s.crownWetMin;
  let pumpMin = s.pumpMin;
  const dist = Math.abs(i.emitter - CROWN);

  for (let m = 0; m < dt; m++) {
    if (i.pump) {
      pumpMin += 1;
      if (i.overhead) {
        for (let c = 0; c < CELLS; c++) cells[c] += FLOW / 4;
      } else {
        // a drip makes a small wetting bulb, not a single wet cell
        cells[i.emitter] += FLOW * 0.5;
        cells[Math.max(0, i.emitter - 1)] += FLOW * 0.25;
        cells[Math.min(CELLS - 1, i.emitter + 1)] += FLOW * 0.25;
      }
    }
    // lateral spreading
    const next = cells.slice();
    for (let c = 0; c < CELLS; c++) {
      const l = cells[Math.max(0, c - 1)];
      const r = cells[Math.min(CELLS - 1, c + 1)];
      next[c] = cells[c] + 0.18 * (l + r - 2 * cells[c]);
    }
    cells = next;
    // evaporation, root uptake, drainage
    const evap = (0.006 + 0.012 * i.vpd) * (i.mulch ? 0.5 : 1);
    for (let c = 0; c < CELLS; c++) {
      let loss = evap;
      if (i.daylight && c >= ROOT_FROM && c <= ROOT_TO) loss += 0.008;
      if (cells[c] > 80) loss += (cells[c] - 80) * 0.02;
      cells[c] = clamp(cells[c] - loss, 0, 100);
    }
    // crown wetness
    let gain = 0;
    if (i.pump) gain = i.overhead ? 5 : dist === 0 ? 4 : dist === 1 ? 1.2 : 0;
    if (cells[CROWN] > 85) gain += 0.6;
    crownWet = clamp(crownWet + gain - 0.5 * (0.4 + i.vpd), 0, 100);
    crownWetMin = clamp(crownWetMin + (crownWet > 15 ? 1 : -0.4), 0, 1440);
  }
  const rot = 100 * clamp((crownWetMin - 30) / 150, 0, 1);
  return { cells, crownWet, crownWetMin, rot, pumpMin };
}

/* ------------------------------------------------------------------ */
/* Soil sensor calibration                                             */
/* ------------------------------------------------------------------ */

/** Capacitive probes read LOWER when wetter. Map raw ADC → 0–100 % wet. */
export function rawToPct(raw: number, rawDry: number, rawWet: number) {
  if (rawDry === rawWet) return 0;
  return clamp(((rawDry - raw) / (rawDry - rawWet)) * 100, 0, 100);
}

/** The "true" probe in the lesson (hidden from the learner until measured). */
export const TRUE_RAW_DRY = 3050;
export const TRUE_RAW_WET = 1320;
export const pctToRaw = (pct: number) =>
  Math.round(TRUE_RAW_DRY - (pct / 100) * (TRUE_RAW_DRY - TRUE_RAW_WET));

/* ------------------------------------------------------------------ */
/* One-week scenario for the capstone                                  */
/* ------------------------------------------------------------------ */

export interface DayWeather {
  name: string;
  mean: number;
  amp: number;
  rh: number;
  rhAmp: number;
}

export const WEEK: DayWeather[] = [
  { name: "Mild and dry", mean: 15, amp: 6, rh: 58, rhAmp: 14 },
  { name: "Warm and sunny", mean: 18, amp: 7, rh: 55, rhAmp: 14 },
  { name: "Cloudy and humid", mean: 14, amp: 3, rh: 74, rhAmp: 8 },
  { name: "Warm and sunny", mean: 19, amp: 7, rh: 54, rhAmp: 14 },
  { name: "Heat spike", mean: 23, amp: 7, rh: 42, rhAmp: 12 },
  { name: "Cooling down", mean: 17, amp: 5, rh: 60, rhAmp: 12 },
  { name: "Mild and damp", mean: 15, amp: 4, rh: 68, rhAmp: 10 },
];

export function dayWeather(d: DayWeather, hour: number) {
  const wave = Math.sin(((hour - 9) / 24) * 2 * Math.PI);
  return {
    hour,
    name: d.name,
    temp: d.mean + d.amp * wave,
    rh: clamp(d.rh - d.rhAmp * wave, 25, 97),
    daylight: hour >= 6 && hour < 20,
  };
}

export function weatherAt(minute: number) {
  const day = Math.min(WEEK.length - 1, Math.floor(minute / 1440));
  return { day, ...dayWeather(WEEK[day], (minute % 1440) / 60) };
}

/* ------------------------------------------------------------------ */
/* Controllers (what the sketch decides each tick)                     */
/* ------------------------------------------------------------------ */

export interface PumpState {
  pump: boolean;
  /** minutes the current watering cycle has run */
  run: number;
  /** cool-down minutes left after a safety time-out */
  rest: number;
}

export interface WaterParams {
  WATER_BELOW: number;
  WATER_UNTIL: number;
  MAX_PUMP_MIN: number;
  WATER_FROM: number;
  WATER_TO: number;
}

export function pumpDecision(
  cur: PumpState,
  probe: number,
  hour: number,
  p: WaterParams,
  dt: number
): PumpState {
  const inWindow = hour >= p.WATER_FROM && hour < p.WATER_TO;
  let { pump, run, rest } = cur;
  rest = Math.max(0, rest - dt);
  if (!pump && probe < p.WATER_BELOW && inWindow && rest === 0) {
    pump = true;
    run = 0;
  }
  if (pump) {
    run += dt;
    if (probe > p.WATER_UNTIL || !inWindow) {
      pump = false;
    } else if (run >= p.MAX_PUMP_MIN) {
      pump = false;
      rest = 30; // soak time: let water spread before trying again
    }
  }
  return { pump, run: pump ? run : 0, rest };
}

export interface FanParams {
  FAN_ON_RH: number;
  FAN_OFF_RH: number;
  FAN_ON_TEMP: number;
}

/** Hysteresis: two thresholds stop the fan from chattering on and off. */
export function fanDecision(fan: boolean, rh: number, temp: number, p: FanParams) {
  if (!fan && (rh > p.FAN_ON_RH || temp > p.FAN_ON_TEMP)) return true;
  if (fan && rh < p.FAN_OFF_RH && temp < p.FAN_ON_TEMP - 2) return false;
  return fan;
}

/** Daily growth factor for the capstone: temperature x root-zone moisture. */
export function thrive(temp: number, root: number) {
  const t = trap(temp, 2, 12, 26, 34);
  const w = trap(root, 20, 45, 70, 92);
  return t * w;
}

export const fmtClock = (hour: number) => {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
