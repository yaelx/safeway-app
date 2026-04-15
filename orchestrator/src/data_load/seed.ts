import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import csv from "csv-parser";
import fs from "fs";
import dotenv from "dotenv";
import { NormalizedShelter, RawShelter } from "../types/types";

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

export const normalizeShelter = (city: string) => {
  return function normalizer(s: RawShelter): NormalizedShelter {
    return {
      name: s.name || "shelter",
      address: s.address ?? "",
      lat: parseFloat(Number(s.lat).toFixed(6)),
      lng: parseFloat(Number(s.lng).toFixed(6)),
      type: s.type || "OTHER",
      city: city,
      isOfficial: true,
    };
  };
};

export function loadJSON(filePath: string): RawShelter[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

export function loadCSV(filePath: string): Promise<RawShelter[]> {
  return new Promise((resolve, reject) => {
    const results: RawShelter[] = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        results.push({
          name: data.name,
          address: data.address,
          lat: data.lat,
          lng: data.lng,
          type: data.type,
        });
      })
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

export async function insertShelters(
  prisma: PrismaClient,
  shelters: NormalizedShelter[],
) {
  for (const s of shelters) {
    await prisma.shelter.upsert({
      where: {
        lat_lng: {
          lat: s.lat,
          lng: s.lng,
        },
      },
      update: {
        name: s.name,
        address: s.address,
        type: s.type,
        city: s.city,
        // updatedAt will auto-update here!
      },
      create: {
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        address: s.address,
        type: s.type,
        isOfficial: true,
        city: s.city,
        // createdAt will auto-set here!
      },
    });
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing!");
  }

  let rawData;

  // 👇 רק כאן מחליטים לפי סוג קובץ
  const sheltersFiles = {
    Haifa: "./src/data/Haifa_shelters.csv",
    "kiryat-Motzkin": "./src/data/KiryatMotzkin_shelters.json",
    "kiryat-Bialik": "./src/data/KiryatBialik_shelters.csv",
    "kiryat-Ata": "./src/data/kiryatAta_shelters.csv",
  };

  for (const [city, filePath] of Object.entries(sheltersFiles)) {
    if (filePath.endsWith(".json")) {
      rawData = loadJSON(filePath);
    } else if (filePath.endsWith(".csv")) {
      rawData = await loadCSV(filePath);
    } else {
      throw new Error("Unsupported file type");
    }

    const normalizer = normalizeShelter(city);
    const normalized = rawData.map(normalizer);
    await insertShelters(prisma, normalized);
  }

  console.log("✅ Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
