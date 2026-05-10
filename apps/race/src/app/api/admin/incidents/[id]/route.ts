import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
const schema = z.object({ status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).optional(), severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(), title: z.string().min(1).optional(), description: z.string().optional().nullable(), assignedTo: z.string().optional().nullable() });
type Context = { params: Promise<{ id: string }> };
export async function PUT(request: Request, context: Context) { return guarded(async () => { await requireAdmin(); const { id } = await context.params; const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatná data incidentu.", 400); return NextResponse.json({ incident: await prisma.incident.update({ where: { id }, data: parsed.data, include: { racer: true } }) }); }); }
export async function DELETE(_request: Request, context: Context) { return guarded(async () => { await requireAdmin(); const { id } = await context.params; await prisma.incident.delete({ where: { id } }); return NextResponse.json({ ok: true }); }); }
