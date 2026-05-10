import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/http";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return jsonError("Chybí token závodníka.", 400);
  const racer = await prisma.racer.findUnique({ where: { publicAccessToken: token }, include: { race: true, state: true } });
  if (!racer) return jsonError("Závodník nebyl nalezen.", 404);
  const checkpoints = await prisma.checkpoint.findMany({ where: { raceId: racer.raceId }, orderBy: { order: "asc" } });
  return NextResponse.json({ racer, race: racer.race, checkpoints });
}
