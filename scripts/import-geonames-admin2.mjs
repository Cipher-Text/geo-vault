import fs from "node:fs";
import path from "node:path";

const [admin2Input, admin1Input, output = "data/admin2.json"] = process.argv.slice(2);
if (!admin2Input || !admin1Input) {
  console.error("Usage: node scripts/import-geonames-admin2.mjs <admin2Codes.txt> <admin1CodesASCII.txt> [output.json]");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const countries = JSON.parse(fs.readFileSync(path.join(root, "data/countries.json"), "utf8"));
const countriesByIso2 = new Map(countries.map((country) => [country.iso2, country]));
const admin1ByCode = new Map();
for (const line of fs.readFileSync(admin1Input, "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const [code, name, asciiName, geonameId] = line.split("\t");
  if (code && geonameId) admin1ByCode.set(code, { name, asciiName, geonameId });
}

const slugify = (value) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const text = (value) => value ?? "";
const records = [];
const seen = new Set();

for (const line of fs.readFileSync(admin2Input, "utf8").split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const [code, name, asciiName, geonameId] = line.split("\t");
  const parts = code?.split(".");
  if (parts?.length !== 3 || !geonameId) continue;
  const [countryCode, admin1Code, admin2Code] = parts;
  const country = countriesByIso2.get(countryCode);
  if (!country) continue;
  const parentCode = `${countryCode}.${admin1Code}`;
  const record = {
    id: `geonames-${geonameId}`,
    name: text(name),
    name_en: text(asciiName) || text(name),
    local_name: text(name),
    slug: slugify(text(asciiName) || text(name)),
    country_code: countryCode,
    country_iso3: country.iso3,
    country_name: country.name,
    admin_level: "admin2",
    type: "Administrative division",
    parent_code: parentCode,
    admin1_code: admin1Code,
    admin2_code: admin2Code,
    geoname_id: text(geonameId),
    geonames_code: code
  };
  if (seen.has(record.id)) throw new Error(`Duplicate GeoNames ID: ${record.id}`);
  seen.add(record.id);
  records.push(record);
}

records.sort((a, b) => a.country_code.localeCompare(b.country_code) || a.parent_code.localeCompare(b.parent_code) || a.name.localeCompare(b.name));
const destination = path.resolve(output);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Wrote ${records.length} Admin-2 records to ${output}`);
