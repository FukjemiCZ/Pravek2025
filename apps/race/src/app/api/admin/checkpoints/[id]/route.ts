import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
const schema = z.object({ name: z.string().min(1).optional(), order: z.number().int().optional(), distanceKm: z.number().nonnegative().optional() });
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) { return guarded(async () => { await requireAdmin(); const { id } = await context.params; const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatná data checkpointu.", 400); return NextResponse.json({ checkpoint: await prisma.checkpoint.update({ where: { id }, data: parsed.data }) }); }); }
export async function DELETE(_request: Request, context: Context) { return guarded(async () => { await requireAdmin(); const { id } = await context.params; await prisma.checkpoint.delete({ where: { id } }); return NextResponse.json({ ok: true }); }); }
