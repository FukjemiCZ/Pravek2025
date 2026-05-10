import { Prisma, RaceEventType, RacerStatus } from "@prisma/client";
import { prisma } from "./prisma";

export async function appendRaceEvent(input: {
  raceId: string;
  racerId?: string | null;
  checkpointId?: string | null;
  type: RaceEventType;
  payload?: Prisma.InputJsonValue;
}) {
  const event = await prisma.raceEvent.create({ data: input });
  if (input.racerId) await rebuildRacerState(input.racerId);
  return event;
}

export async function rebuildRacerState(racerId: string) {
  const racer = await prisma.racer.findUniqueOrThrow({ where: { id: racerId } });

  const events = await prisma.raceEvent.findMany({
    where: { racerId },
    orderBy: { createdAt: "asc" },
    include: { checkpoint: true }
  });

  const checkpoints = await prisma.checkpoint.findMany({
    where: { raceId: racer.raceId },
    orderBy: { order: "asc" }
  });

  let status: RacerStatus = "NOT_STARTED";
  let lastCheckpointId: string | null = null;
  let lastCheckpointKm: number | null = null;
  let lastActivityAt: Date | null = null;
  let photoCount = 0;

  for (const event of events) {
    lastActivityAt = event.createdAt;
    if (event.type === "RACER_STARTED") status = "ON_ROUTE";
    if (event.type === "CHECKPOINT_REACHED" && event.checkpoint) {
      status = "ON_ROUTE";
      lastCheckpointId = event.checkpoint.id;
      lastCheckpointKm = event.checkpoint.distanceKm;
    }
    if (event.type === "PHOTO_UPLOADED") photoCount += 1;
    if (event.type === "RACER_FINISHED") status = "FINISHED";
    if (event.type === "RACER_DNF") status = "DNF";
  }

  const lastCheckpoint = lastCheckpointId ? checkpoints.find((cp) => cp.id === lastCheckpointId) : null;
  const nextCheckpoint = status === "ON_ROUTE"
    ? checkpoints.find((cp) => lastCheckpoint ? cp.order > lastCheckpoint.order : cp.order > 0)
    : null;

  return prisma.racerRaceState.upsert({
    where: { racerId },
    update: {
      raceId: racer.raceId,
      status,
      lastCheckpointId,
      lastCheckpointKm,
      currentSegmentFrom: status === "ON_ROUTE" ? lastCheckpoint?.id ?? null : null,
      currentSegmentTo: status === "ON_ROUTE" ? nextCheckpoint?.id ?? null : null,
      lastActivityAt,
      photoCount
    },
    create: {
      raceId: racer.raceId,
      racerId,
      status,
      lastCheckpointId,
      lastCheckpointKm,
      currentSegmentFrom: status === "ON_ROUTE" ? lastCheckpoint?.id ?? null : null,
      currentSegmentTo: status === "ON_ROUTE" ? nextCheckpoint?.id ?? null : null,
      lastActivityAt,
      photoCount
    }
  });
}
