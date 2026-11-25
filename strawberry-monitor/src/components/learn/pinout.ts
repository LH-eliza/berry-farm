import type { PartId } from "./parts";

/**
 * Wio Terminal 40-pin header (Raspberry Pi layout) and a suggested wiring plan
 * for the berry kit.
 *
 * Pin names come from Seeed's Wio Terminal IO overview and the board's
 * variant.h (as mirrored in the TinyGo pin table). Which kit part goes on which
 * pin is a PLAN, except where a connection is tagged "docs".
 */

export type PinKind = "power" | "gnd" | "i2c" | "uart" | "gpio" | "spi" | "i2s" | "other";

export interface HeaderPin {
  n: number;
  /** short label drawn next to the pin */
  label: string;
  bcm?: number;
  /** SAMD51 port pin */
  mcu?: string;
  /** names you can use in an Arduino sketch */
  arduino?: string;
  kind: PinKind;
  note?: string;
}

const P = (n: number, label: string, kind: PinKind, extra: Partial<HeaderPin> = {}): HeaderPin => ({ n, label, kind, ...extra });

export const HEADER: HeaderPin[] = [
  P(1, "3V3", "power", { note: "3.3 V supply." }),
  P(2, "5V", "power", { note: "5 V supply. Good for relay modules." }),
  P(3, "SDA", "i2c", { bcm: 2, mcu: "PA17", arduino: "SDA / PIN_WIRE_SDA", note: "I²C data. Shared with the left Grove port." }),
  P(4, "5V", "power", { note: "5 V supply." }),
  P(5, "SCL", "i2c", { bcm: 3, mcu: "PA16", arduino: "SCL / PIN_WIRE_SCL", note: "I²C clock. Shared with the left Grove port." }),
  P(6, "GND", "gnd"),
  P(7, "BCM4", "other", { bcm: 4, mcu: "PB14", arduino: "GCLK0", note: "General clock output." }),
  P(8, "Serial1", "uart", { bcm: 14, mcu: "PB27", arduino: "Serial1 (PIN_SERIAL1_RX)", note: "UART receive (named PIN_SERIAL1_RX in the board definition). Connect it to the other device's TX." }),
  P(9, "GND", "gnd"),
  P(10, "Serial1", "uart", { bcm: 15, mcu: "PB26", arduino: "Serial1 (PIN_SERIAL1_TX)", note: "UART transmit (named PIN_SERIAL1_TX in the board definition). Connect it to the other device's RX." }),
  P(11, "DAC0", "other", { bcm: 17, mcu: "PA02", arduino: "DAC0", note: "Analog output (DAC)." }),
  P(12, "I2S SCK", "i2s", { bcm: 18, mcu: "PB28", arduino: "I2S_SCK_PIN" }),
  P(13, "D0 / A0", "gpio", { bcm: 27, mcu: "PB08", arduino: "D0 / A0", note: "Digital or analog input." }),
  P(14, "GND", "gnd"),
  P(15, "D1 / A1", "gpio", { bcm: 22, mcu: "PB09", arduino: "D1 / A1", note: "Digital or analog input." }),
  P(16, "D2 / A2", "gpio", { bcm: 23, mcu: "PA07", arduino: "D2 / A2", note: "Digital or analog input." }),
  P(17, "3V3", "power"),
  P(18, "D3 / A3", "gpio", { bcm: 24, mcu: "PB04", arduino: "D3 / A3", note: "Digital or analog input." }),
  P(19, "SPI SDO", "spi", { bcm: 10, mcu: "PB02", arduino: "SDO / PIN_SPI_SDO" }),
  P(20, "GND", "gnd"),
  P(21, "SPI SDI", "spi", { bcm: 9, mcu: "PB00", arduino: "SDI / PIN_SPI_SDI" }),
  P(22, "D4 / A4", "gpio", { bcm: 25, mcu: "PB05", arduino: "D4 / A4", note: "Digital or analog input." }),
  P(23, "SPI SCK", "spi", { bcm: 11, mcu: "PB03", arduino: "SCK / PIN_SPI_SCK" }),
  P(24, "SPI SS", "spi", { bcm: 8, mcu: "PB01", arduino: "SS / PIN_SPI_SS" }),
  P(25, "GND", "gnd"),
  P(26, "DAC1", "other", { bcm: 7, mcu: "PA05", arduino: "DAC1", note: "Analog output (DAC)." }),
  P(27, "I²C0 SDA", "i2c", { bcm: 0, mcu: "PA13", arduino: "SDA1 / PIN_WIRE1_SDA", note: "Second I²C bus (Wire1). It is also wired to the on-board accelerometer." }),
  P(28, "I²C0 SCL", "i2c", { bcm: 1, mcu: "PA12", arduino: "SCL1 / PIN_WIRE1_SCL", note: "Second I²C bus (Wire1). It is also wired to the on-board accelerometer." }),
  P(29, "BCM5", "other", { bcm: 5, mcu: "PB12", arduino: "GCLK1", note: "General clock output." }),
  P(30, "GND", "gnd"),
  P(31, "BCM6", "other", { bcm: 6, mcu: "PB13", arduino: "GCLK2", note: "General clock output." }),
  P(32, "D5 / A5", "gpio", { bcm: 12, mcu: "PB06", arduino: "D5 / A5", note: "Digital or analog input." }),
  P(33, "D6 / A6", "gpio", { bcm: 13, mcu: "PA04", arduino: "D6 / A6", note: "Digital or analog input." }),
  P(34, "GND", "gnd"),
  P(35, "I2S FS", "i2s", { bcm: 19, mcu: "PA20", arduino: "I2S_LRCLK" }),
  P(36, "D7 / A7", "gpio", { bcm: 16, mcu: "PB07", arduino: "D7 / A7", note: "Digital or analog input." }),
  P(37, "D8 / A8", "gpio", { bcm: 26, mcu: "PA06", arduino: "D8 / A8", note: "Digital or analog input." }),
  P(38, "I2S SDI", "i2s", { bcm: 20, mcu: "PA21", arduino: "I2S_SDIN" }),
  P(39, "GND", "gnd"),
  P(40, "I2S SDO", "i2s", { bcm: 21, mcu: "PA22", arduino: "I2S_SDOUT" }),
];

export const KIND_COLOR: Record<PinKind, string> = {
  power: "#ef8a80",
  gnd: "#1c1c1c",
  i2c: "#f6e05e",
  uart: "#8fc3a1",
  gpio: "#9fd8f2",
  spi: "#d8d2c2",
  i2s: "#d8d2c2",
  other: "#ece8dc",
};

export const KIND_LABEL: Record<PinKind, string> = {
  power: "Power",
  gnd: "Ground",
  i2c: "I²C",
  uart: "UART",
  gpio: "Digital / analog",
  spi: "SPI / I²S",
  i2s: "SPI / I²S",
  other: "Other",
};

export type Bus = "I²C" | "Analog" | "UART" | "Digital";
export type Socket = "gi2c" | "gda" | number[];

export interface Link {
  /** pin on the part */
  from: string;
  /** where it lands on the Wio Terminal */
  to: string;
  arduino?: string;
  /** "docs" = taken from Seeed's docs; "plan" = my suggestion for this kit */
  basis: "docs" | "plan";
}

export interface PartPlan {
  id: PartId;
  title: string;
  bus: Bus;
  /** which socket or header pins it uses */
  socket: Socket;
  links: Link[];
  snippet: string;
  note: string;
}

export const WIRING: PartPlan[] = [
  {
    id: "sht40",
    title: "SHT40 · air temperature + humidity",
    bus: "I²C",
    socket: "gi2c",
    links: [
      { from: "SDA", to: "Left Grove · SDA", arduino: "SDA", basis: "docs" },
      { from: "SCL", to: "Left Grove · SCL", arduino: "SCL", basis: "docs" },
      { from: "VCC, GND", to: "Left Grove · power", basis: "docs" },
    ],
    snippet: `#include <Wire.h>

void setup() {
  Wire.begin();                    // left Grove port
  Wire.beginTransmission(0x44);    // SHT40 address
  if (Wire.endTransmission() == 0) Serial.println("SHT40 found");
}`,
    note: "I²C is a shared bus: every I²C part hangs off the same two signal wires and answers to its own address. A Grove I²C hub gives you the extra sockets.",
  },
  {
    id: "sgp30",
    title: "SGP30 · air quality",
    bus: "I²C",
    socket: "gi2c",
    links: [
      { from: "SDA", to: "Left Grove · SDA (via hub)", arduino: "SDA", basis: "docs" },
      { from: "SCL", to: "Left Grove · SCL (via hub)", arduino: "SCL", basis: "docs" },
      { from: "VCC, GND", to: "Left Grove · power", basis: "docs" },
    ],
    snippet: `Wire.beginTransmission(0x58);    // SGP30 address
if (Wire.endTransmission() == 0) Serial.println("SGP30 found");`,
    note: "Shares the I²C bus with the SHT40, so the two never need their own pins. The address 0x58 is what tells them apart.",
  },
  {
    id: "vision",
    title: "Vision AI · camera",
    bus: "I²C",
    socket: "gi2c",
    links: [
      { from: "SDA", to: "Left Grove · SDA (via hub)", arduino: "SDA", basis: "plan" },
      { from: "SCL", to: "Left Grove · SCL (via hub)", arduino: "SCL", basis: "plan" },
      { from: "VCC, GND", to: "Left Grove · power", basis: "docs" },
    ],
    snippet: `Wire.beginTransmission(0x62);    // typical Vision AI address
if (Wire.endTransmission() == 0) Serial.println("Vision AI found");`,
    note: "This module can talk over I²C. I have not checked its address or which interface your unit uses, so scan the bus first and use what it reports.",
  },
  {
    id: "soil",
    title: "Soil probe · moisture",
    bus: "Analog",
    socket: "gda",
    links: [
      { from: "SIG", to: "Right Grove · A0", arduino: "A0", basis: "docs" },
      { from: "VCC, GND", to: "Right Grove · power", basis: "docs" },
    ],
    snippet: `int raw = analogRead(A0);       // right Grove, first signal pin
// then calibrate raw -> 0..100 % (lesson 5)`,
    note: "The right Grove socket is the configurable digital/analog one. The probe puts out a voltage and the board turns it into a number from 0 to 4095.",
  },
  {
    id: "light",
    title: "Light sensor · Creator Kit",
    bus: "Analog",
    socket: "gda",
    links: [
      { from: "SIG", to: "Right Grove · A1 (second signal pin)", arduino: "A1", basis: "plan" },
      { from: "VCC, GND", to: "Right Grove · power", basis: "docs" },
    ],
    snippet: `int raw = analogRead(A1);       // second analog pin
// or the built-in sensor, no wiring:
int built = analogRead(WIO_LIGHT);`,
    note: "Two analog parts share the one right socket, so you need a Grove splitter cable and the second part goes on the second signal pin. Check the silkscreen on your board. The Wio Terminal also has its own light sensor (WIO_LIGHT), which saves the wiring if you only need relative brightness.",
  },
  {
    id: "wioe5",
    title: "Wio-E5 · LoRa radio",
    bus: "UART",
    socket: [8, 10],
    links: [
      { from: "TX", to: "Header pin 8 · Serial1 RX", arduino: "Serial1", basis: "plan" },
      { from: "RX", to: "Header pin 10 · Serial1 TX", arduino: "Serial1", basis: "plan" },
      { from: "VCC, GND", to: "Header 3V3 + GND (pins 1, 6)", basis: "plan" },
    ],
    snippet: `void setup() {
  Serial1.begin(9600);           // header UART
  Serial1.println("AT");         // expect an OK reply
}`,
    note: "UART is a two-wire link where each side's TX goes to the other's RX. The pin names on the header are documented, but the K1100 kit may wire its radio through its own chassis, so follow the K1100 guide if it says otherwise.",
  },
  {
    id: "fan",
    title: "Fan · via relay",
    bus: "Digital",
    socket: [16],
    links: [
      { from: "SIG", to: "Header pin 16 · D2", arduino: "D2", basis: "plan" },
      { from: "VCC, GND", to: "Header 5V + GND (pins 2, 6)", basis: "plan" },
    ],
    snippet: `pinMode(D2, OUTPUT);
digitalWrite(D2, HIGH);          // relay on -> fan spins`,
    note: "A digital pin only switches the relay's coil. The fan's own power runs through the relay contacts, never through the Wio Terminal.",
  },
  {
    id: "pump",
    title: "Pump · via relay",
    bus: "Digital",
    socket: [18],
    links: [
      { from: "SIG", to: "Header pin 18 · D3", arduino: "D3", basis: "plan" },
      { from: "VCC, GND", to: "Header 5V + GND (pins 4, 6)", basis: "plan" },
    ],
    snippet: `pinMode(D3, OUTPUT);
digitalWrite(D3, HIGH);          // relay on -> pump runs
// always switch it off again: see MAX_PUMP_MIN`,
    note: "Same idea as the fan. In the watering lessons the sketch also stops the pump after a maximum run time, so a stuck sensor can never flood the crown.",
  },
];

export const wiringFor = (id: PartId) => WIRING.find((w) => w.id === id) ?? null;
