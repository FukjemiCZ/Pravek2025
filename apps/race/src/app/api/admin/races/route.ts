import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
const schema = z.object({ name: z.string().min(1), year: z.number().int(), isActive: z.boolean().default(true) });
export async function GET() { return guarded(async () => { await requireAdmin(); return NextResponse.json({ races: await prisma.race.findMany({ orderBy: [{ year: "desc" }, { name: "asc" }] }) }); }); }
export async function POST(request: Request) { return guarded(async () => { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatná data závodu.", 400); return NextResponse.json({ race: await prisma.race.create({ data: parsed.data }) }); }); }
