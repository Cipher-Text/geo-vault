import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const errors = [];

const readJson = (relativePath) => {
  const file = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
};

const isFiniteCoordinate = (value, min, max) => {
  if (value === "") return true;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max;
};

const assertUnique = (records, field, label) => {
  const seen = new Map();
  for (const [index, record] of records.entries()) {
    const value = record?.[field];
    if (!value) continue;
    if (seen.has(value)) errors.push(`${label}: duplicate ${field} '${value}' at indexes ${seen.get(value)} and ${index}`);
    else seen.set(value, index);
  }
};

const countries = readJson("data/countries.json");
if (Array.isArray(countries)) {
  assertUnique(countries, "id", "data/countries.json");
  assertUnique(countries, "iso2", "data/countries.json");
  assertUnique(countries, "iso3", "data/countries.json");

  for (const [index, country] of countries.entries()) {
    if (country.id !== country.iso2?.toLowerCase()) errors.push(`data/countries.json[${index}]: id must equal lowercase iso2`);
    if (!isFiniteCoordinate(country.lat, -90, 90)) errors.push(`data/countries.json[${index}]: invalid latitude`);
    if (!isFiniteCoordinate(country.lon, -180, 180)) errors.push(`data/countries.json[${index}]: invalid longitude`);
  }
}

const countryMap = new Map((countries ?? []).map((country) => [country.id, country]));
const admin1 = readJson("data/admin1.json");
if (Array.isArray(admin1)) {
  assertUnique(admin1, "id", "data/admin1.json");
  assertUnique(admin1, "adm1_code", "data/admin1.json");
  const countryCodes = new Set((countries ?? []).map((country) => country.iso2));
  for (const [index, region] of admin1.entries()) {
    if (!countryCodes.has(region.country_code)) errors.push(`data/admin1.json[${index}]: unknown country_code '${region.country_code}'`);
    if (region.admin_level !== "admin1") errors.push(`data/admin1.json[${index}]: admin_level must be 'admin1'`);
    if (!isFiniteCoordinate(region.lat, -90, 90)) errors.push(`data/admin1.json[${index}]: invalid latitude`);
    if (!isFiniteCoordinate(region.lon, -180, 180)) errors.push(`data/admin1.json[${index}]: invalid longitude`);
  }
}
const admin2 = readJson("data/admin2.json");
if (Array.isArray(admin2)) {
  assertUnique(admin2, "id", "data/admin2.json");
  assertUnique(admin2, "geonames_code", "data/admin2.json");
  const countryCodes = new Set((countries ?? []).map((country) => country.iso2));
  for (const [index, region] of admin2.entries()) {
    if (!countryCodes.has(region.country_code)) errors.push(`data/admin2.json[${index}]: unknown country_code '${region.country_code}'`);
    if (region.admin_level !== "admin2") errors.push(`data/admin2.json[${index}]: admin_level must be 'admin2'`);
    if (region.parent_code !== `${region.country_code}.${region.admin1_code}`) errors.push(`data/admin2.json[${index}]: parent_code does not match country/admin1 codes`);
  }
}
for (const level of ["admin3", "admin4"]) {
  const records = readJson(`data/${level}.json`);
  if (!Array.isArray(records)) continue;
  assertUnique(records, "id", `data/${level}.json`);
  assertUnique(records, "geonames_code", `data/${level}.json`);
  const countryCodes = new Set((countries ?? []).map((country) => country.iso2));
  for (const [index, region] of records.entries()) {
    if (!countryCodes.has(region.country_code)) errors.push(`data/${level}.json[${index}]: unknown country_code '${region.country_code}'`);
    if (region.admin_level !== level) errors.push(`data/${level}.json[${index}]: admin_level must be '${level}'`);
    if (region.parent_code !== region.geonames_code.split(".").slice(0, level === "admin3" ? 3 : 4).join(".")) errors.push(`data/${level}.json[${index}]: parent_code does not match hierarchy code`);
  }
}
const countryDirectories = fs.readdirSync(path.join(root, "data"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^[a-z]{2}$/.test(entry.name))
  .map((entry) => entry.name);

for (const code of countryDirectories) {
  const country = readJson(`data/${code}/country.json`);
  const master = countryMap.get(code);
  if (!master) errors.push(`data/${code}/country.json: missing from data/countries.json`);
  if (country?.id !== code) errors.push(`data/${code}/country.json: id must be '${code}'`);
  if (master) {
    for (const [key, value] of Object.entries(master)) {
      if (key !== "metadata" && JSON.stringify(country?.[key]) !== JSON.stringify(value)) {
        errors.push(`data/${code}/country.json: canonical field '${key}' differs from master record`);
      }
    }
  }
}

const jsonFiles = [];
const walk = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".json")) jsonFiles.push(fullPath);
  }
};
walk(path.join(root, "data"));
for (const file of jsonFiles) {
  try { JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { errors.push(`${path.relative(root, file)}: ${error.message}`); }
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Geo Vault validation passed: ${countries?.length ?? 0} countries, ${jsonFiles.length} data JSON files.`);
