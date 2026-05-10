import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({ raceId: z.string().uuid(), status: z.string().optional(), segmentFrom: z.string().uuid().optional(), segmentTo: z.string().uuid().optional() });

export async function POST(request: Request) {
  return guarded(async () => {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Neplatný segment.", 400);
    const racers = await prisma.racer.findMany({ where: { raceId: parsed.data.raceId, phone: { not: null }, state: { ...(parsed.data.status ? { status: parsed.data.status as never } : {}), ...(parsed.data.segmentFrom ? { currentSegmentFrom: parsed.data.segmentFrom } : {}), ...(parsed.data.segmentTo ? { currentSegmentTo: parsed.data.segmentTo } : {}) } }, include: { state: true } });
    return NextResponse.json({ count: racers.length, racers });
  });
}
