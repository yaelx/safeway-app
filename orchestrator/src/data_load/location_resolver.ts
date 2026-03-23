import fs from "fs";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify/sync";
import fetch from "node-fetch";

const INPUT_FILE = "./src/data/kiryatAta_shelters_raw.csv";
const OUTPUT_FILE = "./src/data/kiryatAta_shelters.csv";
const MANUAL_REVIEW_FILE = "./src/data/kiryatAta_shelters_MANUAL_REVIEW.csv";

async function geocodeAddress(address: string, city: string) {
  if (!address || !city) return { lat: "", lng: "" };

  const query = encodeURIComponent(`${address}, ${city}, Israel`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SafeWay-Shelter-Seeder",
        "Accept-Language": "he,en",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = (await response.json()) as any[];

    if (data && data.length > 0) {
      return { lat: data[0].lat, lng: data[0].lon };
    }

    console.warn(`⚠️ No coordinates found for: ${address}`);
  } catch (error: any) {
    console.error(`❌ Network error geocoding "${address}":`, error.message);
  }

  return { lat: "", lng: "" };
}

async function main() {
  try {
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error(`Input file "${INPUT_FILE}" not found.`);
    }

    const successRecords: any[] = [];
    const failedRecords: any[] = [];

    const stream = fs.createReadStream(INPUT_FILE).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }),
    );

    console.log("🚀 Starting Geocoding Process...");

    for await (const record of stream) {
      // Respect Nominatim Usage Policy (max 1 request per second)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        const coords = await geocodeAddress(record.address, record.city);

        if (coords.lat && coords.lng) {
          successRecords.push({
            ...record,
            lat: coords.lat,
            lng: coords.lng,
          });
          console.log(
            `✅ ${record.address}: Found [${coords.lat}, ${coords.lng}]`,
          );
        } else {
          // If coords are empty, it's a "not found" case
          failedRecords.push(record);
        }
      } catch (recordError: any) {
        console.error(`Error processing row:`, recordError.message);
        failedRecords.push(record);
      }
    }

    // 1. Write Successful matches
    if (successRecords.length > 0) {
      const successOutput = stringify(successRecords, { header: true });
      fs.writeFileSync(OUTPUT_FILE, successOutput);
      console.log(
        `\n💾 SUCCESS: ${successRecords.length} rows saved to ${OUTPUT_FILE}`,
      );
    }

    // 2. Write Failed matches for manual review
    if (failedRecords.length > 0) {
      const failedOutput = stringify(failedRecords, { header: true });
      fs.writeFileSync(MANUAL_REVIEW_FILE, failedOutput);
      console.log(
        `\n⚠️ MANUAL REVIEW NEEDED: ${failedRecords.length} rows saved to ${MANUAL_REVIEW_FILE}`,
      );
    }
  } catch (mainError: any) {
    console.error(`\n🛑 CRITICAL SCRIPT ERROR:`, mainError.message);
    process.exit(1);
  }
}

main();
