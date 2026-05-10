import { NextResponse } from "next/server";
import { RaceEventType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  return guarded(async () => {
    await requireAdmin();
    const { id } = await context.params;

    const checkpoint = await prisma.checkpoint.findUnique({
      where: { id },
      include: { race: true }
    });

    if (!checkpoint) return jsonError("Checkpoint neexistuje.", 404);

    const events = await prisma.raceEvent.findMany({
      where: {
        checkpointId: id,
        type: RaceEventType.CHECKPOINT_REACHED
      },
      include: {
        racer: {
          include: {
            state: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 300
    });

    return NextResponse.json({
      checkpoint,
      race: checkpoint.race,
      passages: events.map((event) => ({
        id: event.id,
        createdAt: event.createdAt,
        racer: event.racer
      }))
    });
  });
}
