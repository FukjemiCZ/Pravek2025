import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";
import { appendRaceEvent } from "@/lib/state";

const schema = z.object({ token: z.string().min(8), type: z.enum(["RACER_STARTED", "CHECKPOINT_REACHED", "RACER_FINISHED", "RACER_DNF"]), checkpointId: z.string().uuid().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Neplatná událost.", 400);
  const racer = await prisma.racer.findUnique({ where: { publicAccessToken: parsed.data.token } });
  if (!racer) return jsonError("Závodník nebyl nalezen.", 404);
  if (parsed.data.type === "CHECKPOINT_REACHED" && !parsed.data.checkpointId) return jsonError("Chybí checkpoint.", 400);
  await appendRaceEvent({ raceId: racer.raceId, racerId: racer.id, checkpointId: parsed.data.checkpointId, type: parsed.data.type });
  const state = await prisma.racerRaceState.findUnique({ where: { racerId: racer.id } });
  return NextResponse.json({ ok: true, state });
}
