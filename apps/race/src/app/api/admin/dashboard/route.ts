import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { guarded } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  return guarded(async () => {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const raceId = params.get("raceId") || undefined;
    const status = params.get("status") || undefined;
    const segmentFrom = params.get("segmentFrom") || undefined;
    const segmentTo = params.get("segmentTo") || undefined;

    const racers = await prisma.racer.findMany({
      where: {
        raceId,
        state: {
          ...(status ? { status: status as never } : {}),
          ...(segmentFrom ? { currentSegmentFrom: segmentFrom } : {}),
          ...(segmentTo ? { currentSegmentTo: segmentTo } : {})
        }
      },
      include: { state: true },
      orderBy: [{ startNumber: "asc" }, { lastName: "asc" }]
    });
    const checkpoints = await prisma.checkpoint.findMany({ where: { raceId }, orderBy: { order: "asc" } });
    return NextResponse.json({ racers, checkpoints });
  });
}
