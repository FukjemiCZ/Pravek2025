import { NextResponse } from "next/server";
import { z } from "zod";
import { RaceEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appendRaceEvent } from "@/lib/state";
import { jsonError } from "@/lib/http";
const schema = z.object({ token: z.string().min(1), type: z.enum(["RACER_STARTED","CHECKPOINT_REACHED","RACER_FINISHED","RACER_DNF"]), checkpointId: z.string().uuid().optional() });
export async function POST(request: Request) { const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatná data události.", 400); const racer = await prisma.racer.findUnique({ where: { publicAccessToken: parsed.data.token } }); if (!racer) return jsonError("Závodník nenalezen.", 404); const event = await appendRaceEvent({ raceId: racer.raceId, racerId: racer.id, checkpointId: parsed.data.checkpointId, type: parsed.data.type as RaceEventType, payload: { source: "racer-mobile" } }); return NextResponse.json({ event }); }
