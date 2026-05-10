import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
const schema = z.object({ raceId: z.string().uuid(), status: z.string().optional(), segmentFrom: z.string().uuid().optional(), segmentTo: z.string().uuid().optional(), inactiveHours: z.number().optional() });
export async function POST(request: Request) { return guarded(async () => { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatný SMS filtr.", 400); const { raceId, status, segmentFrom, segmentTo, inactiveHours } = parsed.data; const inactiveBefore = inactiveHours ? new Date(Date.now() - inactiveHours * 3600_000) : undefined; const racers = await prisma.racer.findMany({ where: { raceId, phone: { not: null }, state: { ...(status ? { status: status as never } : {}), ...(segmentFrom ? { currentSegmentFrom: segmentFrom } : {}), ...(segmentTo ? { currentSegmentTo: segmentTo } : {}), ...(inactiveBefore ? { lastActivityAt: { lt: inactiveBefore } } : {}) } }, include: { state: true } }); return NextResponse.json({ count: racers.length, racers }); }); }
