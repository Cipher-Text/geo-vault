import fs from "node:fs";
import path from "node:path";

const [countiesInput, placesInput, subdivisionsInput, zctasInput] = process.argv.slice(2);
if (!countiesInput || !placesInput || !subdivisionsInput || !zctasInput) {
  console.error("Usage: node scripts/import-census-us.mjs <counties.txt> <places.txt> <county-subdivisions.txt> <zctas.txt>");
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const outputDirectory = path.join(root, "data/countries/us");
const readRows = (file) => {
  const lines = fs.readFileSync(file, "utf8").trim().split(/\r?\n/);
  const headers = lines.shift().split("|");
  return lines.filter(Boolean).map((line) => {
    const values = line.split("|");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
};
const slugify = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const text = (value) => value ?? "";
const csvEscape = (value) => {
  const valueText = String(value ?? "");
  return /[",\n\r]/.test(valueText) ? `"${valueText.replaceAll('"', '""')}"` : valueText;
};
const sqlEscape = (value) => String(value ?? "").replaceAll("\\", "\\\\").replaceAll("'", "''");

const counties = readRows(countiesInput).map((row) => ({
  id: `us-county-${row.GEOID}`,
  geoid: row.GEOID,
  state_code: row.USPS,
  state_fips: row.GEOID.slice(0, 2),
  name: row.NAME,
  slug: slugify(row.NAME),
  admin_level: "admin2",
  country_code: "US",
  country_iso3: "USA",
  land_area_sqmi: text(row.ALAND_SQMI),
  water_area_sqmi: text(row.AWATER_SQMI),
  lat: text(row.INTPTLAT),
  lon: text(row.INTPTLONG),
}));
const places = readRows(placesInput).map((row) => ({
  id: `us-place-${row.GEOID}`,
  geoid: row.GEOID,
  state_code: row.USPS,
  state_fips: row.GEOID.slice(0, 2),
  name: row.NAME,
  slug: slugify(row.NAME),
  admin_level: "place",
  country_code: "US",
  country_iso3: "USA",
  legal_statistical_area_code: text(row.LSAD),
  functional_status: text(row.FUNCSTAT),
  land_area_sqmi: text(row.ALAND_SQMI),
  water_area_sqmi: text(row.AWATER_SQMI),
  lat: text(row.INTPTLAT),
  lon: text(row.INTPTLONG),
}));
const subdivisions = readRows(subdivisionsInput).map((row) => ({
  id: `us-cousub-${row.GEOID}`,
  geoid: row.GEOID,
  state_code: row.USPS,
  state_fips: row.GEOID.slice(0, 2),
  name: row.NAME,
  slug: slugify(row.NAME),
  admin_level: "admin3",
  country_code: "US",
  country_iso3: "USA",
  functional_status: text(row.FUNCSTAT),
  land_area_sqmi: text(row.ALAND_SQMI),
  water_area_sqmi: text(row.AWATER_SQMI),
  lat: text(row.INTPTLAT),
  lon: text(row.INTPTLONG),
}));
const zctas = readRows(zctasInput).map((row) => ({
  id: `us-zcta-${row.GEOID}`,
  geoid: row.GEOID,
  name: row.GEOID,
  slug: `zcta-${row.GEOID}`,
  admin_level: "zcta",
  country_code: "US",
  country_iso3: "USA",
  land_area_sqmi: text(row.ALAND_SQMI),
  water_area_sqmi: text(row.AWATER_SQMI),
  lat: text(row.INTPTLAT),
  lon: text(row.INTPTLONG),
}));

const writeDataset = (name, records, table) => {
  fs.writeFileSync(path.join(outputDirectory, `${name}.json`), `${JSON.stringify(records, null, 2)}\n`);
  const headers = Object.keys(records[0]);
  const csv = [headers.join(","), ...records.map((record) => headers.map((header) => csvEscape(record[header])).join(","))].join("\n") + "\n";
  fs.writeFileSync(path.join(outputDirectory, `${name}.csv`), csv);
  const columns = headers.map((header) => `  \`${header}\` varchar(255) NOT NULL`).join(",\n");
  const values = records.map((record) => `(${headers.map((header) => `'${sqlEscape(record[header])}'`).join(", ")})`).join(",\n");
  const sql = `CREATE TABLE \`${table}\` (\n${columns}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\nINSERT INTO \`${table}\` (\`${headers.join("\`, \`")}\`) VALUES\n${values};\n`;
  fs.writeFileSync(path.join(outputDirectory, `${name}.sql`), sql);
};

fs.mkdirSync(outputDirectory, { recursive: true });
writeDataset("counties", counties, "us_counties");
writeDataset("places", places, "us_places");
writeDataset("county-subdivisions", subdivisions, "us_county_subdivisions");
writeDataset("zctas", zctas, "us_zctas");
console.log(`Wrote ${counties.length} counties, ${places.length} places, ${subdivisions.length} county subdivisions, and ${zctas.length} ZCTAs to ${path.relative(root, outputDirectory)}.`);
