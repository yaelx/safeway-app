import axios from "axios";
import * as fs from "fs";
import path from "path";
import { API_PATHS } from "./config/constants";

/**
 * Direct OSRM Probe
 * This script bypasses the Node & Python servers to capture the full metadata
 * provided by the OpenSource Routing Machine.
 */
async function dumpOSRMData() {
  // Test Route: Haifa Hanevi'im to Kiryat Motzkin Goshen
  const start = "35.07734964460863,32.827977145489434"; // my location
  const end = "34.965471,32.8222798"; // 5 tzarfat st, haifa

  // Port 5000 is the default for osrm-routed.
  // We MUST include annotations=true and steps=true to see road types.
  const osrmUrl = `${API_PATHS.OSRM_ROUTE}${start};${end}?alternatives=true&overview=full&geometries=polyline&steps=true&annotations=true`;
  const params = {
    alternatives: "true",
    overview: "full",
    geometries: "polyline",
    steps: "true",
    annotations: "true",
  };

  console.log("🚀 Probing OSRM Engine directly...");

  try {
    const response = await axios.get(osrmUrl);

    const outputPath = path.join(__dirname, "osrm_debug_dump.json");

    fs.writeFileSync(
      outputPath,
      JSON.stringify(response.data, null, 2),
      "utf-8",
    );

    console.log("✅ Success!");
    console.log(`📂 File saved to: ${outputPath}`);
    console.log(
      "💡 Next Step: Open the file and look for 'routes[0].legs[0].steps'",
    );
  } catch (error: any) {
    console.error("❌ Failed to reach OSRM.");
    if (error.code === "ECONNREFUSED") {
      console.error(
        "Connection Refused. Ensure your OSRM Docker/Subprocess is running on port 5000.",
      );
    } else {
      console.error(error.message);
    }
  }
}

dumpOSRMData();
