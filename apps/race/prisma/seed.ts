import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { createPublicAccessToken } from "../src/lib/crypto";

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@pravek-v-raji.cz").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name: "Admin" },
    create: { email, passwordHash, name: "Admin" }
  });

  const race = await prisma.race.upsert({
    where: { year_name: { year: 2026, name: "Pravěk v Ráji 2026" } },
    update: { isActive: true },
    create: { year: 2026, name: "Pravěk v Ráji 2026", isActive: true }
  });

  if ((await prisma.checkpoint.count({ where: { raceId: race.id } })) === 0) {
    await prisma.checkpoint.createMany({
      data: [
        { raceId: race.id, name: "Start", order: 0, distanceKm: 0 },
        { raceId: race.id, name: "CP1", order: 1, distanceKm: 8 },
        { raceId: race.id, name: "CP2", order: 2, distanceKm: 18 },
        { raceId: race.id, name: "Cíl", order: 3, distanceKm: 30 }
      ]
    });
  }

  if ((await prisma.racer.count({ where: { raceId: race.id } })) === 0) {
    await prisma.racer.create({
      data: {
        raceId: race.id,
        startNumber: "1",
        firstName: "Demo",
        lastName: "Závodník",
        email: "demo@example.com",
        phone: "+420777000111",
        paymentStatus: "zaplaceno",
        registrationStatus: "potvrzeno",
        dog1Name: "Rex",
        dog1Breed: "Husky",
        publicAccessToken: createPublicAccessToken()
      }
    });
  }

  console.log(`Admin ready: ${email}`);
}

main().finally(() => prisma.$disconnect());
