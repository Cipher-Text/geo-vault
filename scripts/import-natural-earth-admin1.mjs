import fs from "node:fs";
import path from "node:path";

const input = process.argv[2];
const output = process.argv[3] ?? "data/admin1.json";

if (!input) {
  console.error("Usage: node scripts/import-natural-earth-admin1.mjs <admin1.geojson> [output.json]");
  process.exit(1);
}

const slugify = (value) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

const text = (value) => value == null ? "" : String(value);
const source = JSON.parse(fs.readFileSync(input, "utf8"));
const records = source.features
  .filter(({ properties }) => properties.name && /^[A-Z]{2}$/.test(properties.iso_a2 ?? ""))
  .map(({ properties }) => {
  const name = text(properties.name);
  const iso2 = text(properties.iso_a2).toUpperCase();
  const iso3 = text(properties.adm0_a3).toUpperCase();
  const code = text(properties.adm1_code);
  return {
    id: `ne-${code.toLowerCase()}`,
    name,
    name_en: text(properties.name_en) || name,
    local_name: text(properties.name_local),
    slug: slugify(name),
    country_code: iso2,
    country_iso3: iso3,
    country_name: text(properties.admin) || text(properties.geonunit),
    admin_level: "admin1",
    type: text(properties.type_en) || text(properties.type),
    iso_3166_2: text(properties.iso_3166_2),
    adm1_code: code,
    postal_code: text(properties.postal),
    fips_code: text(properties.fips),
    geoname_id: text(properties.gn_id),
    geonames_admin1_code: text(properties.gn_a1_code),
    lat: text(properties.latitude),
    lon: text(properties.longitude),
    wikidata_id: text(properties.wikidataid)
  };
});

const ids = new Set();
for (const record of records) {
  if (!record.adm1_code || !record.country_code || !record.name) throw new Error("Source contains an incomplete Admin-1 record");
  if (ids.has(record.id)) throw new Error(`Duplicate normalized ID: ${record.id}`);
  ids.add(record.id);
}

records.sort((a, b) => a.country_code.localeCompare(b.country_code) || a.name.localeCompare(b.name));
const destination = path.resolve(output);
fs.mkdirSync(path.dirname(destination), { recursive: true });
fs.writeFileSync(destination, `${JSON.stringify(records, null, 2)}\n`);
console.log(`Wrote ${records.length} Admin-1 records to ${output}`);
