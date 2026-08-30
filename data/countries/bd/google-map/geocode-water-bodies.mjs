import { Client } from "@googlemaps/google-maps-services-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const INPUT_FILE = path.resolve(SCRIPT_DIR, "../raw/water-bodies-master.csv");
const OUTPUT_FILE = path.resolve(SCRIPT_DIR, "water-bodies-geocoded.csv");
const AUDIT_FILE = path.resolve(SCRIPT_DIR, "water-bodies-geocode-results.csv");
const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const APPLY_CHANGES = process.argv.includes("--apply");
const DELAY_MS = Number(process.env.GOOGLE_MAPS_DELAY_MS || 200);

if (!API_KEY) {
  throw new Error("Set GOOGLE_MAPS_API_KEY before running this script.");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows;
}

function readCsv(file) {
  const rows = parseCsv(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
  const headers = rows.shift();
  return {
    headers,
    records: rows
      .filter((row) => row.some((value) => value.trim() !== ""))
      .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""]))),
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(file, headers, records) {
  const lines = [
    headers.map(csvEscape).join(","),
    ...records.map((record) => headers.map((header) => csvEscape(record[header])).join(",")),
  ];
  fs.writeFileSync(file, `${lines.join("\n")}\n`);
}

function hasCoordinates(record) {
  return record.latitude.trim() !== "" && record.longitude.trim() !== "";
}

function buildAddress(record) {
  const parts = [
    record.name_en,
    record.water_body_type,
    record.district,
    record.upazila,
    "Bangladesh",
  ].filter((part) => part?.trim());

  return parts.join(", ");
}

const { headers, records } = readCsv(INPUT_FILE);
const requiredHeaders = ["id", "name_en", "water_body_type", "district", "upazila", "latitude", "longitude"];
const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

if (missingHeaders.length > 0) {
  throw new Error(`Missing required CSV columns: ${missingHeaders.join(", ")}`);
}

const client = new Client({});
const audit = [];
let geocoded = 0;
let skipped = 0;

for (const record of records) {
  if (hasCoordinates(record)) {
    skipped += 1;
    continue;
  }

  const address = buildAddress(record);
  console.log(`Fetching ${record.id}: ${address}`);

  try {
    const response = await client.geocode({
      params: {
        address,
        components: { country: "BD" },
        language: "en",
        key: API_KEY,
      },
    });
    const result = response.data.results?.[0];

    if (result?.geometry?.location) {
      record.latitude = String(result.geometry.location.lat);
      record.longitude = String(result.geometry.location.lng);
      geocoded += 1;
      audit.push({
        id: record.id,
        name_en: record.name_en,
        query: address,
        status: response.data.status || "OK",
        result_type: result.types?.join("|") || "",
        formatted_address: result.formatted_address || "",
        place_id: result.place_id || "",
        latitude: record.latitude,
        longitude: record.longitude,
        applied: APPLY_CHANGES ? "yes" : "no",
      });
    } else {
      console.warn(`No result found for ${record.id}: ${address}`);
      audit.push({ id: record.id, name_en: record.name_en, query: address, status: response.data.status || "ZERO_RESULTS", applied: "no" });
    }
  } catch (error) {
    console.error(`Error fetching ${record.id}: ${error.message}`);
    audit.push({ id: record.id, name_en: record.name_en, query: address, status: `ERROR: ${error.message}`, applied: "no" });
  }

  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
}

const resultHeaders = ["id", "name_en", "query", "status", "result_type", "formatted_address", "place_id", "latitude", "longitude", "applied"];
writeCsv(AUDIT_FILE, resultHeaders, audit);

if (APPLY_CHANGES) {
  writeCsv(INPUT_FILE, headers, records);
  console.log(`Updated ${INPUT_FILE}`);
} else {
  writeCsv(OUTPUT_FILE, headers, records);
  console.log(`Wrote review copy to ${OUTPUT_FILE}`);
  console.log("Use --apply to write coordinates into water-bodies-master.csv.");
}

console.log(`Geocoded: ${geocoded}; skipped existing coordinates: ${skipped}; audit: ${AUDIT_FILE}`);
