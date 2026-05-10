import { NextResponse } from "next/server";
import { z } from "zod";
import { RaceEventType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { appendRaceEvent } from "@/lib/state";
const schema = z.object({ raceId: z.string().uuid(), racerId: z.string().uuid().optional().nullable(), type: z.enum(["INJURY", "LOST", "DOG_ISSUE", "TRANSPORT_NEEDED", "TIMEOUT", "MANUAL_NOTE", "OTHER"]), severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"), status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]).default("OPEN"), title: z.string().min(1), description: z.string().optional().nullable(), assignedTo: z.string().optional().nullable() });
export async function GET(request: Request) { return guarded(async () => { await requireAdmin(); const raceId = new URL(request.url).searchParams.get("raceId") || undefined; const incidents = await prisma.incident.findMany({ where: { raceId }, include: { racer: true }, orderBy: { createdAt: "desc" } }); return NextResponse.json({ incidents }); }); }
export async function POST(request: Request) { return guarded(async () => { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatná data incidentu.", 400); const incident = await prisma.incident.create({ data: parsed.data, include: { racer: true } }); await appendRaceEvent({ raceId: incident.raceId, racerId: incident.racerId, type: RaceEventType.INCIDENT_CREATED, payload: { incidentId: incident.id, title: incident.title, severity: incident.severity } }); return NextResponse.json({ incident }); }); }
