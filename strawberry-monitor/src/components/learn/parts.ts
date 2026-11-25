export type PartId = "wio" | "sht40" | "soil" | "light" | "sgp30" | "vision" | "wioe5" | "fan" | "pump";

export interface PartInfo {
  id: PartId;
  name: string;
  tag: string;
  /** JSON field(s) in the ingest payload */
  field: string | null;
  what: string;
  why: string;
}

export const PART_INFO: PartInfo[] = [
  {
    id: "wio",
    name: "Wio Terminal",
    tag: "Brain + screen",
    field: null,
    what: "An Arduino-compatible board with a built-in screen, buttons and Grove ports. It runs your sketch, reads the sensors, decides what to do, and can show the numbers right at the plant.",
    why: "Every lesson here is really a Wio Terminal sketch: read sensors, compare to a threshold, act.",
  },
  {
    id: "sht40",
    name: "SHT40 · air",
    tag: "Temperature + humidity",
    field: "temperatureC, humidityPct",
    what: "A Sensirion digital sensor for air temperature and relative humidity. It talks to the board over I²C.",
    why: "Temperature sets growth rate and whether the crown makes flowers. Humidity decides how fast gray mould can take hold.",
  },
  {
    id: "soil",
    name: "Soil probe",
    tag: "Soil moisture",
    field: "soilMoisturePct",
    what: "A probe that reads how wet the soil around it is. It gives a raw analog number you calibrate into 0–100 %.",
    why: "Strawberry roots are shallow and sensitive to both drought and soggy soil. This is your watering signal.",
  },
  {
    id: "light",
    name: "Light sensor",
    tag: "Creator Kit γ",
    field: "lightLux",
    what: "An analog light sensor from the Grove Creator Kit. Calibrate its reading into lux against a known meter.",
    why: "Light drives photosynthesis and berry sugars, and tells you how fast the plant is using water.",
  },
  {
    id: "sgp30",
    name: "SGP30 · air quality",
    tag: "TVOC + eCO₂",
    field: "tvocPpb, eco2Ppm",
    what: "A gas sensor that reports volatile organic compounds and an estimated CO₂ level over I²C.",
    why: "In a closed tunnel, a stuffy air reading is a hint to ventilate, which also helps with humidity.",
  },
  {
    id: "vision",
    name: "Vision AI",
    tag: "Camera",
    field: null,
    what: "A Grove camera module that can run small vision models on-device.",
    why: "Later idea: spot ripe berries, or early gray mould on fruit, without a human walking the rows.",
  },
  {
    id: "wioe5",
    name: "Wio-E5 · LoRa",
    tag: "Radio",
    field: null,
    what: "A LoRaWAN radio module for long-range, low-power messages when Wi-Fi does not reach the berry patch.",
    why: "It carries the JSON from the field to your farm app's /api/ingest/k1100 endpoint.",
  },
  {
    id: "fan",
    name: "Fan + relay",
    tag: "Ventilation",
    field: null,
    what: "A relay on a digital pin switches the tunnel fan. Your sketch turns it on when humidity or temperature crosses a threshold.",
    why: "Moving air dries leaves and cools the crown, so gray mould and heat stress both ease.",
  },
  {
    id: "pump",
    name: "Pump + relay",
    tag: "Drip watering",
    field: null,
    what: "A relay switches a small pump that feeds a drip line. The emitter sits a few centimetres from the crown.",
    why: "Short, well-placed pulses wet the shallow roots without ever soaking the crown.",
  },
];

/** The seven parts introduced in the kit tour (the actuators come later). */
export const KIT_PARTS = PART_INFO.slice(0, 7);
