import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  return guarded(async () => {
    await requireAdmin();
    const { id } = await context.params;

    const racer = await prisma.racer.findUnique({
      where: { id },
      include: {
        events: {
          include: {
            checkpoint: true
          },
          orderBy: {
            createdAt: "asc"
          }
        },
        state: true
      }
    });

    if (!racer) return jsonError("Závodník neexistuje.", 404);

    const timeline = racer.events.map((event) => ({
      id: event.id,
      type: event.type,
      checkpoint: event.checkpoint?.name ?? null,
      checkpointKm: event.checkpoint?.distanceKm ?? null,
      createdAt: event.createdAt,
      payload: event.payload
    }));

    return NextResponse.json({
      racer: {
        id: racer.id,
        firstName: racer.firstName,
        lastName: racer.lastName,
        startNumber: racer.startNumber,
        state: racer.state
      },
      timeline
    });
  });
}
