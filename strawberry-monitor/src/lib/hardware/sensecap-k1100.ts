import type { SensorData } from "@/lib/ml/ml-pipeline";

/** JSON body your Wio Terminal (or LoRaWAN → relay) should POST to `/api/ingest/k1100`. */
export interface K1100Payload {
  /** °C from Grove SHT40 */
  temperatureC: number;
  /** % relative humidity */
  humidityPct: number;
  /** Soil moisture 0–100 after calibration on the device */
  soilMoisturePct: number;
  /** Optional: Wio light sensor or external lux meter */
  lightLux?: number;
  /** Optional: if you add pH / EC probes later */
  ph?: number;
  ec?: number;
  /** SGP30 — stored for your analytics; not used by the current TS “ML” heuristics */
  tvocPpb?: number;
  eco2Ppm?: number;
  deviceId?: string;
  /** ISO 8601; if omitted, server uses current time */
  recordedAt?: string;
}

export interface K1100ParseResult {
  sensorData: SensorData;
  warnings: string[];
}

const DEFAULT_LIGHT_LUX = 4500;
const DEFAULT_PH = 6.5;
const DEFAULT_EC = 1.2;

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Validates a K1100 POST body and produces {@link SensorData} for {@link MLPipeline}.
 * Fills light / pH / EC with documented defaults when absent (K1100 bundle has no pH, EC, or lux).
 */
export function parseK1100Payload(body: unknown): K1100ParseResult {
  if (body === null || typeof body !== "object") {
    throw new Error("Body must be a JSON object");
  }
  const o = body as Record<string, unknown>;

  const temperatureC = o.temperatureC ?? o.temperature_c;
  const humidityPct = o.humidityPct ?? o.humidity_pct;
  const soilMoisturePct = o.soilMoisturePct ?? o.soil_moisture_pct;

  if (!isFiniteNumber(temperatureC)) {
    throw new Error("temperatureC (number) is required");
  }
  if (!isFiniteNumber(humidityPct)) {
    throw new Error("humidityPct (number) is required");
  }
  if (!isFiniteNumber(soilMoisturePct)) {
    throw new Error("soilMoisturePct (number) is required");
  }

  const warnings: string[] = [];

  const lightLux = isFiniteNumber(o.lightLux)
    ? o.lightLux
    : isFiniteNumber(o.light_lux)
      ? o.light_lux
      : undefined;
  if (lightLux === undefined) {
    warnings.push(
      `lightIntensity defaulted to ${DEFAULT_LIGHT_LUX} lux (add lightLux when you have a sensor)`
    );
  }

  const ph = isFiniteNumber(o.ph) ? o.ph : undefined;
  if (ph === undefined) {
    warnings.push(`ph defaulted to ${DEFAULT_PH} (K1100 has no pH probe)`);
  }

  const ec = isFiniteNumber(o.ec) ? o.ec : undefined;
  if (ec === undefined) {
    warnings.push(`ec defaulted to ${DEFAULT_EC} (K1100 has no EC probe)`);
  }

  let timestamp: Date;
  const recordedAt = o.recordedAt ?? o.recorded_at;
  if (typeof recordedAt === "string" && recordedAt.length > 0) {
    timestamp = new Date(recordedAt);
    if (Number.isNaN(timestamp.getTime())) {
      throw new Error("recordedAt must be a valid ISO 8601 date string");
    }
  } else {
    timestamp = new Date();
  }

  const sensorData: SensorData = {
    temperature: temperatureC,
    humidity: humidityPct,
    soilMoisture: soilMoisturePct,
    lightIntensity: lightLux ?? DEFAULT_LIGHT_LUX,
    ph: ph ?? DEFAULT_PH,
    ec: ec ?? DEFAULT_EC,
    timestamp,
  };

  return { sensorData, warnings };
}
