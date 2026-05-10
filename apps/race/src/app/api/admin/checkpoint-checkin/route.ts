import { NextResponse } from "next/server";
import { z } from "zod";
import { RaceEventType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { normalizeQrToken } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { appendRaceEvent } from "@/lib/state";
const schema = z.object({ checkpointId: z.string().uuid(), token: z.string().min(1), offlineCreatedAt: z.string().optional() });
export async function POST(request: Request) { return guarded(async () => { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatná data check-inu.", 400); const token = normalizeQrToken(parsed.data.token); const racer = await prisma.racer.findUnique({ where: { publicAccessToken: token } }); if (!racer) return jsonError("Závodník nebyl nalezen.", 404); const checkpoint = await prisma.checkpoint.findUnique({ where: { id: parsed.data.checkpointId } }); if (!checkpoint) return jsonError("Checkpoint nebyl nalezen.", 404); const event = await appendRaceEvent({ raceId: racer.raceId, racerId: racer.id, checkpointId: checkpoint.id, type: RaceEventType.CHECKPOINT_REACHED, payload: { source: "admin-checkin", offlineCreatedAt: parsed.data.offlineCreatedAt ?? null } }); return NextResponse.json({ ok: true, racer, checkpoint, event }); }); }
