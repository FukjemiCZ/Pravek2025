import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  raceId: z.string().uuid(),
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int(),
    })
  ).min(1),
});

export async function POST(request: Request) {
  return guarded(async () => {
    await requireAdmin();

    const parsed = schema.safeParse(await request.json());

    if (!parsed.success) {
      return jsonError("Neplatné pořadí checkpointů.", 400);
    }

    const { raceId, items } = parsed.data;

    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.checkpoint.update({
          where: { id: item.id },
          data: { order: item.order + 10000 },
        });
      }

      for (const item of items) {
        await tx.checkpoint.update({
          where: { id: item.id },
          data: { order: item.order },
        });
      }
    });

    const checkpoints = await prisma.checkpoint.findMany({
      where: { raceId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ checkpoints });
  });
}