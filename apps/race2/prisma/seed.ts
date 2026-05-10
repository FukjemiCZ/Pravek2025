import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@pravek.local";
  const password = process.env.ADMIN_PASSWORD || "change-me";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Administrátor závodu" }
  });

  const race = await prisma.race.upsert({
    where: { year_name: { year: 2026, name: "Pravěk v ráji 2026" } },
    update: {},
    create: { year: 2026, name: "Pravěk v ráji 2026", isActive: true }
  });

  const checkpoints = [
    ["Start", 0, 0],
    ["CP1", 1, 8],
    ["CP2", 2, 18],
    ["CP3", 3, 31],
    ["Cíl", 4, 50]
  ] as const;

  for (const [name, order, distanceKm] of checkpoints) {
    await prisma.checkpoint.upsert({
      where: { raceId_order: { raceId: race.id, order } },
      update: { name, distanceKm },
      create: { raceId: race.id, name, order, distanceKm }
    });
  }
}

main().finally(() => prisma.$disconnect());
