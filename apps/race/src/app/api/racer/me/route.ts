import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) { const token = new URL(request.url).searchParams.get("token") || ""; const racer = await prisma.racer.findUnique({ where: { publicAccessToken: token }, include: { race: true, state: true } }); if (!racer) return NextResponse.json({ error: "Závodník nenalezen." }, { status: 404 }); const checkpoints = await prisma.checkpoint.findMany({ where: { raceId: racer.raceId }, orderBy: { order: "asc" } }); return NextResponse.json({ racer, race: racer.race, checkpoints }); }
