import { Client } from "@googlemaps/google-maps-services-js";
import fs from "node:fs";

const INPUT_FILE = new URL("./missing-unions.csv", import.meta.url);
const OUTPUT_FILE = new URL("./verified-unions.csv", import.meta.url);
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const client = new Client({});

if (!API_KEY) {
  throw new Error("Set GOOGLE_MAPS_API_KEY before running this script.");
}

function parseCsv(text) {
  return text.trim().split(/\r?\n/).slice(1).map((line) => {
    const [zila, upazila, union] = line.split(",");
    return { zila, upazila, union };
  });
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const unions = parseCsv(fs.readFileSync(INPUT_FILE, "utf8"));
const results = [];

for (const item of unions) {
  const address = `${item.union} Union, ${item.upazila}, ${item.zila}, Bangladesh`;
  console.log(`Fetching: ${address}...`);

  try {
    const response = await client.geocode({ params: { address, key: API_KEY } });
    const result = response.data.results[0];

    if (result) {
      const location = result.geometry.location;
      results.push({
        zila: item.zila,
        upazila: item.upazila,
        union: item.union,
        lat: location.lat,
        lon: location.lng,
      });
    } else {
      console.warn(`No result found for: ${address}`);
    }
  } catch (error) {
    console.error(`Error fetching ${address}:`, error.message);
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
}

const header = "zila,upazila,union,lat,lon";
const lines = results.map((row) => [row.zila, row.upazila, row.union, row.lat, row.lon].map(csvEscape).join(","));
fs.writeFileSync(OUTPUT_FILE, `${header}\n${lines.join("\n")}\n`);
console.log(`Saved ${results.length} verified coordinates to ${OUTPUT_FILE.pathname}`);
