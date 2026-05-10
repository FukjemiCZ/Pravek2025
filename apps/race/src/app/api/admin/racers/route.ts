import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createPublicAccessToken, normalizeEmail, normalizePhone } from "@/lib/crypto";
const schema = z.object({ raceId: z.string().uuid(), startNumber: z.string().optional().nullable(), firstName: z.string().min(1), lastName: z.string().min(1), email: z.string().optional().nullable(), phone: z.string().optional().nullable(), routeName: z.string().optional().nullable(), paymentStatus: z.string().optional().nullable(), registrationStatus: z.string().optional().nullable() });
export async function GET(request: Request) { return guarded(async () => { await requireAdmin(); const raceId = new URL(request.url).searchParams.get("raceId") || undefined; const racers = await prisma.racer.findMany({ where: { raceId }, include: { state: true }, orderBy: [{ startNumber: "asc" }, { lastName: "asc" }] }); return NextResponse.json({ racers }); }); }
export async function POST(request: Request) { return guarded(async () => { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatná data závodníka.", 400); const data = parsed.data; const racer = await prisma.racer.create({ data: { ...data, email: normalizeEmail(data.email), phone: normalizePhone(data.phone), publicAccessToken: createPublicAccessToken() }, include: { state: true } }); return NextResponse.json({ racer }); }); }
