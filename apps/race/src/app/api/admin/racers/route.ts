import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createPublicAccessToken, normalizeEmail, normalizePhone } from "@/lib/crypto";

const schema = z.object({ raceId: z.string().uuid(), startNumber: z.string().optional(), firstName: z.string().min(1), lastName: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), routeName: z.string().optional() });

export async function GET(request: Request) {
  return guarded(async () => {
    await requireAdmin();
    const raceId = new URL(request.url).searchParams.get("raceId") || undefined;
    const racers = await prisma.racer.findMany({ where: { raceId }, include: { state: true }, orderBy: [{ startNumber: "asc" }, { lastName: "asc" }] });
    return NextResponse.json({ racers });
  });
}

export async function POST(request: Request) {
  return guarded(async () => {
    await requireAdmin();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return jsonError("Neplatná data závodníka.", 400);
    const racer = await prisma.racer.create({ data: { ...parsed.data, email: normalizeEmail(parsed.data.email), phone: normalizePhone(parsed.data.phone), publicAccessToken: createPublicAccessToken() } });
    return NextResponse.json({ racer });
  });
}
