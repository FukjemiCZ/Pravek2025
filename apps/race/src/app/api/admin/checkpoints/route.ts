import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
const schema = z.object({ raceId: z.string().uuid(), name: z.string().min(1), order: z.number().int(), distanceKm: z.number().nonnegative() });
export async function GET(request: Request) { return guarded(async () => { await requireAdmin(); const raceId = new URL(request.url).searchParams.get("raceId") || undefined; const checkpoints = await prisma.checkpoint.findMany({ where: { raceId }, orderBy: { order: "asc" } }); return NextResponse.json({ checkpoints }); }); }
export async function POST(request: Request) { return guarded(async () => { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatná data checkpointu.", 400); return NextResponse.json({ checkpoint: await prisma.checkpoint.create({ data: parsed.data }) }); }); }
