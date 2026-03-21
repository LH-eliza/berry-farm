import { NextRequest, NextResponse } from "next/server";
import { parseK1100Payload } from "@/lib/hardware/sensecap-k1100";

/**
 * Ingest environmental readings from a SenseCAP K1100 (Wio Terminal + Groves).
 * Configure the device to POST JSON here, or forward LoRaWAN payloads from a bridge.
 *
 * Optional auth: set `K1100_INGEST_SECRET` in `.env.local` and send
 * `Authorization: Bearer <same value>`.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.K1100_INGEST_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const { sensorData, warnings } = parseK1100Payload(body);
    return NextResponse.json({
      ok: true,
      sensorData: {
        ...sensorData,
        timestamp: sensorData.timestamp.toISOString(),
      },
      warnings,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
