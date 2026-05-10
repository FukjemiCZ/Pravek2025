import { RaceEventType } from "@prisma/client";
import { prisma } from "./prisma";

export async function getRaceResults(raceId: string) {
  const checkpoints = await prisma.checkpoint.findMany({ where: { raceId }, orderBy: { order: "asc" } });
  const racers = await prisma.racer.findMany({
    where: { raceId },
    include: {
      state: true,
      events: { include: { checkpoint: true }, orderBy: { createdAt: "asc" } }
    },
    orderBy: [{ startNumber: "asc" }, { lastName: "asc" }]
  });

  return racers.map((racer) => {
    const start = racer.events.find((event) => event.type === RaceEventType.RACER_STARTED)?.createdAt ?? null;
    const finish = racer.events.find((event) => event.type === RaceEventType.RACER_FINISHED)?.createdAt ?? null;

    const cpTimes = checkpoints.map((checkpoint) => {
      const event = racer.events.find((item) => item.type === RaceEventType.CHECKPOINT_REACHED && item.checkpointId === checkpoint.id);
      return {
        checkpointId: checkpoint.id,
        checkpointName: checkpoint.name,
        distanceKm: checkpoint.distanceKm,
        time: event?.createdAt ?? null
      };
    });

    const splits = cpTimes.map((cp, index) => {
      const prevTime = index === 0 ? start : cpTimes[index - 1]?.time;
      return {
        from: index === 0 ? "Start" : cpTimes[index - 1]?.checkpointName,
        to: cp.checkpointName,
        seconds: prevTime && cp.time ? Math.floor((cp.time.getTime() - prevTime.getTime()) / 1000) : null
      };
    });

    return {
      racer,
      start,
      finish,
      totalSeconds: start && finish ? Math.floor((finish.getTime() - start.getTime()) / 1000) : null,
      checkpoints: cpTimes,
      splits
    };
  });
}

export function secondsToHms(seconds: number | null | undefined) {
  if (seconds == null) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":");
}
