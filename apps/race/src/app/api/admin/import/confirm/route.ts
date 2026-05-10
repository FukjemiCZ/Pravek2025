import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { guarded, jsonError } from "@/lib/http";
import { loadRacerCandidates } from "@/lib/googleSheets";
import { importCandidates } from "@/lib/importers";
const schema = z.object({ raceId: z.string().uuid(), year: z.number().int(), paid: z.enum(["all","yes","no"]).default("all"), confirmed: z.enum(["all","yes","no"]).default("all"), dedupMode: z.enum(["email","phone","email_or_phone","email_and_phone"]).default("email_or_phone") });
export async function POST(request: Request) { return guarded(async () => { await requireAdmin(); const parsed = schema.safeParse(await request.json()); if (!parsed.success) return jsonError("Neplatné parametry importu.", 400); const candidates = await loadRacerCandidates(parsed.data); return NextResponse.json(await importCandidates(parsed.data.raceId, candidates, parsed.data.dedupMode)); }); }
