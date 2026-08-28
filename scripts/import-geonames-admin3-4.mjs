import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";

const [archive, admin3Output = "data/admin3.json", admin4Output = "data/admin4.json"] = process.argv.slice(2);
if (!archive) {
  console.error("Usage: node scripts/import-geonames-admin3-4.mjs <allCountries.zip> [admin3.json] [admin4.json]");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const countries = JSON.parse(fs.readFileSync(path.join(root, "data/countries.json"), "utf8"));
const countriesByIso2 = new Map(countries.map((country) => [country.iso2, country]));
const slugify = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const text = (value) => value ?? "";
const output = { ADM3: [], ADM4: [] };
const seen = new Set();

const unzip = spawn("unzip", ["-p", archive, "allCountries.txt"]);
unzip.stderr.on("data", (chunk) => process.stderr.write(chunk));
const lines = readline.createInterface({ input: unzip.stdout, crlfDelay: Infinity });

for await (const line of lines) {
  const fields = line.split("\t");
  const [geonameId, name, asciiName, , lat, lon, featureClass, featureCode, countryCode, , admin1Code, admin2Code, admin3Code, admin4Code] = fields;
  if (featureClass !== "A" || !["ADM3", "ADM4"].includes(featureCode) || !countryCode || !countriesByIso2.has(countryCode)) continue;
  const level = featureCode === "ADM3" ? "admin3" : "admin4";
  const country = countriesByIso2.get(countryCode);
  const parentCode = featureCode === "ADM3"
    ? `${countryCode}.${admin1Code}.${admin2Code}`
    : `${countryCode}.${admin1Code}.${admin2Code}.${admin3Code}`;
  const geonamesCode = featureCode === "ADM3"
    ? `${countryCode}.${admin1Code}.${admin2Code}.${admin3Code}`
    : `${countryCode}.${admin1Code}.${admin2Code}.${admin3Code}.${admin4Code}`;
  const record = {
    id: `geonames-${geonameId}`,
    name: text(name),
    name_en: text(asciiName) || text(name),
    local_name: text(name),
    slug: slugify(text(asciiName) || text(name)),
    country_code: countryCode,
    country_iso3: country.iso3,
    country_name: country.name,
    admin_level: level,
    type: "Administrative division",
    parent_code: parentCode,
    admin1_code: text(admin1Code),
    admin2_code: text(admin2Code),
    admin3_code: text(admin3Code),
    admin4_code: text(admin4Code),
    geoname_id: text(geonameId),
    geonames_code: geonamesCode
  };
  if (seen.has(record.id)) throw new Error(`Duplicate GeoNames ID: ${record.id}`);
  seen.add(record.id);
  output[featureCode].push(record);
}

if (unzip.exitCode !== null && unzip.exitCode !== 0) throw new Error("Could not read allCountries.txt from the GeoNames archive");
for (const [level, records] of Object.entries(output)) {
  records.sort((a, b) => a.country_code.localeCompare(b.country_code) || a.parent_code.localeCompare(b.parent_code) || a.name.localeCompare(b.name));
  const destination = path.resolve(level === "ADM3" ? admin3Output : admin4Output);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Wrote ${records.length} ${level.toLowerCase()} records to ${path.relative(root, destination)}`);
}
