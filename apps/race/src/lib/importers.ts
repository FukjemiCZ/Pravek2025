import { RaceEventType } from "@prisma/client";
import { prisma } from "./prisma";
import { createPublicAccessToken, normalizeEmail, normalizePhone } from "./crypto";
import { appendRaceEvent } from "./state";
import type { SheetRacerCandidate } from "./googleSheets";

export type DedupMode = "email" | "phone" | "email_or_phone" | "email_and_phone";

export async function previewCandidates(raceId: string, candidates: SheetRacerCandidate[], dedupMode: DedupMode, hideImported: boolean) {
  const existing = await prisma.racer.findMany({
    where: { raceId },
    select: { id: true, email: true, phone: true, firstName: true, lastName: true, startNumber: true }
  });

  const rows = candidates.map((candidate) => {
    const email = normalizeEmail(candidate.email);
    const phone = normalizePhone(candidate.phone);
    const matches = existing.filter((racer) => {
      const emailMatches = !!email && racer.email === email;
      const phoneMatches = !!phone && racer.phone === phone;
      if (dedupMode === "email") return emailMatches;
      if (dedupMode === "phone") return phoneMatches;
      if (dedupMode === "email_and_phone") return emailMatches && phoneMatches;
      return emailMatches || phoneMatches;
    });

    return { ...candidate, duplicate: matches.length > 0, existingRacers: matches };
  });

  return hideImported ? rows.filter((row) => !row.duplicate) : rows;
}

export async function importCandidates(raceId: string, candidates: SheetRacerCandidate[], dedupMode: DedupMode) {
  const preview = await previewCandidates(raceId, candidates, dedupMode, false);
  const created = [];
  const skipped = [];

  for (const row of preview) {
    if (row.duplicate) {
      skipped.push(row);
      continue;
    }

    const racer = await prisma.racer.create({
      data: {
        raceId,
        startNumber: row.startNumber || undefined,
        firstName: row.firstName,
        lastName: row.lastName,
        email: normalizeEmail(row.email),
        phone: normalizePhone(row.phone),
        routeName: row.routeName || undefined,
        paymentStatus: row.paymentStatus || undefined,
        registrationStatus: row.registrationStatus || undefined,
        dog1Name: row.dog1Name || undefined,
        dog1BirthDate: row.dog1BirthDate || undefined,
        dog1Breed: row.dog1Breed || undefined,
        dog2Name: row.dog2Name || undefined,
        dog2BirthDate: row.dog2BirthDate || undefined,
        dog2Breed: row.dog2Breed || undefined,
        dog3Name: row.dog3Name || undefined,
        dog3BirthDate: row.dog3BirthDate || undefined,
        dog3Breed: row.dog3Breed || undefined,
        publicAccessToken: createPublicAccessToken(),
        importedFrom: "google_sheets",
        importedSourceKey: row.sourceKey
      }
    });

    await appendRaceEvent({
      raceId,
      racerId: racer.id,
      type: RaceEventType.RACER_IMPORTED,
      payload: { sourceRow: row.sourceRow, paid: row.paid, confirmed: row.confirmed }
    });

    created.push(racer);
  }

  return { created, skipped };
}
