import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { loadRacerCandidates } from "@/lib/googleSheets";
import { previewCandidates } from "@/lib/importers";
const schema = z.object({ raceId: z.string().uuid(), year: z.number().int(), paid: z.enum(["all","yes","no"]).default("all"), confirmed: z.enum(["all","yes","no"]).default("all"), dedupMode: z.enum(["email","phone","email_or_phone","email_and_phone"]).default("email_or_phone"), hideImported: z.boolean().default(true) });
export async function POST(request: Request) { return guarded(async () => { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatné parametry importu.", 400); const candidates = await loadRacerCandidates(parsed.data); const rows = await previewCandidates(parsed.data.raceId, candidates, parsed.data.dedupMode, parsed.data.hideImported); return NextResponse.json({ rows, total: rows.length }); }); }
