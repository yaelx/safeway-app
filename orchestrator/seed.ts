import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";
import shelters from "./kiryatMotzkinShelters.json";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing!");
  }
  // Clear existing data to avoid duplicates during testing
  await prisma.shelter.deleteMany({});

  for (const s of shelters) {
    await prisma.shelter.create({
      data: {
        name: s.name,
        lat: parseFloat(s.lat.toString()), // Ensure they are numbers
        lng: parseFloat(s.lng.toString()),
        address: s.address,
        isOfficial: true,
      },
    });
  }
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
