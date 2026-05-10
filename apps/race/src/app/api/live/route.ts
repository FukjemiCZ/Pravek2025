import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(request: Request) {
  const raceId = new URL(request.url).searchParams.get("raceId") || undefined;
  const race = raceId ? await prisma.race.findUnique({ where: { id: raceId } }) : await prisma.race.findFirst({ where: { isActive: true }, orderBy: { year: "desc" } });
  if (!race) return NextResponse.json({ race: null, racers: [] });
  const racers = await prisma.racer.findMany({ where: { raceId: race.id }, include: { state: true }, orderBy: [{ startNumber: "asc" }, { lastName: "asc" }] });
  return NextResponse.json({ race, racers: racers.map((racer) => ({ id: racer.id, startNumber: racer.startNumber, firstName: racer.firstName, lastName: racer.lastName, routeName: racer.routeName, state: racer.state })) });
}
