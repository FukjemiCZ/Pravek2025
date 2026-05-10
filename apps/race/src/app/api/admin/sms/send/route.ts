import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { appendRaceEvent } from "@/lib/state";

const schema = z.object({ raceId: z.string().uuid(), body: z.string().min(1).max(459), status: z.string().optional(), segmentFrom: z.string().uuid().optional(), segmentTo: z.string().uuid().optional() });

export async function POST(request: Request) {
  return guarded(async () => {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Neplatná SMS zpráva.", 400);
    const racers = await prisma.racer.findMany({ where: { raceId: parsed.data.raceId, phone: { not: null }, state: { ...(parsed.data.status ? { status: parsed.data.status as never } : {}), ...(parsed.data.segmentFrom ? { currentSegmentFrom: parsed.data.segmentFrom } : {}), ...(parsed.data.segmentTo ? { currentSegmentTo: parsed.data.segmentTo } : {}) } }, include: { state: true } });
    const results = [];
    for (const racer of racers) {
      if (!racer.phone) continue;
      const result = await sendSms(racer.phone, parsed.data.body);
      await prisma.smsMessage.create({ data: { raceId: parsed.data.raceId, racerId: racer.id, phone: racer.phone, body: parsed.data.body, ...result } });
      await appendRaceEvent({ raceId: parsed.data.raceId, racerId: racer.id, type: result.status === "SENT" ? "SMS_SENT" : "SMS_FAILED", payload: result });
      results.push({ racerId: racer.id, phone: racer.phone, ...result });
    }
    return NextResponse.json({ sent: results.filter((r) => r.status === "SENT").length, total: results.length, results });
  });
}
