import { Client } from "@googlemaps/google-maps-services-js";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "../../../../");
const inputFile = path.join(root, "data/countries/bd/formats/upazilas/upazilas.csv");
const districtsFile = path.join(root, "data/countries/bd/formats/districts/districts.csv");
const auditFile = path.join(scriptDir, "missing-upazilas-geocode-results.csv");
const apiKey = process.env.GOOGLE_MAPS_API_KEY;
const applyChanges = process.argv.includes("--apply");
const delayMs = Number(process.env.GOOGLE_MAPS_DELAY_MS || 200);

if (!apiKey) throw new Error("Set GOOGLE_MAPS_API_KEY before running this script.");

const parseCsv = (text) => text.trimEnd().split(/\r?\n/).map((line) => {
  const values = [];
  const pattern = /"((?:[^"]|"")*)"(?:,|$)/g;
  let match;
  while ((match = pattern.exec(line))) values.push(match[1].replaceAll('""', '"'));
  return values;
});

const csvEscape = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const rows = parseCsv(fs.readFileSync(inputFile, "utf8"));
const districtRows = parseCsv(fs.readFileSync(districtsFile, "utf8"));
const districts = new Map(districtRows.map((row) => [row[0], row[2]]));
const targets = rows.filter((row) => Number(row[0]) >= 495 && Number(row[0]) <= 596 && (!row[5] || !row[6]));
const client = new Client({});
const audit = [];
let geocoded = 0;

for (const row of targets) {
  const [id, districtId, name] = row;
  const district = districts.get(districtId) || "";
  const address = `${name}, ${district}, Bangladesh`;
  console.log(`Fetching ${id}: ${address}`);

  try {
    const response = await client.geocode({
      params: { address, components: { country: "BD" }, language: "en", key: apiKey },
    });
    const result = response.data.results?.[0];
    const location = result?.geometry?.location;
    if (location) {
      row[5] = String(location.lat);
      row[6] = String(location.lng);
      geocoded += 1;
      audit.push([id, name, district, address, response.data.status || "OK", result.formatted_address || "", result.place_id || "", row[5], row[6], applyChanges ? "yes" : "no"]);
    } else {
      audit.push([id, name, district, address, response.data.status || "ZERO_RESULTS", "", "", "", "", "no"]);
      console.warn(`No result found for ${id}: ${address}`);
    }
  } catch (error) {
    audit.push([id, name, district, address, `ERROR: ${error.message}`, "", "", "", "", "no"]);
    console.error(`Error fetching ${id}: ${error.message}`);
  }
  await new Promise((resolve) => setTimeout(resolve, delayMs));
}

const headers = ["id", "name", "district", "query", "status", "formatted_address", "place_id", "lat", "lon", "applied"];
fs.writeFileSync(auditFile, `${[headers, ...audit].map((row) => row.map(csvEscape).join(",")).join("\n")}\n`);

if (applyChanges) {
  fs.writeFileSync(inputFile, `${rows.map((row) => row.map(csvEscape).join(",")).join("\n")}\n`);
  const sync = spawnSync(process.execPath, [path.join(root, "scripts/sync-upazila-exports.mjs")], { cwd: root, stdio: "inherit" });
  if (sync.status !== 0) process.exit(sync.status ?? 1);
}

console.log(`Geocoded ${geocoded}/${targets.length}; audit: ${auditFile}`);
if (!applyChanges) console.log("Review the audit and rerun with --apply to update CSV, JSON, and SQL.");
