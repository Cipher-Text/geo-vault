import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const countriesPath = path.join(root, "data/countries.json");
const countries = JSON.parse(fs.readFileSync(countriesPath, "utf8"));
const countryDirectories = fs.readdirSync(path.join(root, "data"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^[a-z]{2}$/.test(entry.name))
  .map((entry) => entry.name);
const countryRecords = new Map(countryDirectories.map((code) => [code, JSON.parse(fs.readFileSync(path.join(root, "data", code, "country.json"), "utf8"))]));

const slugify = (value) => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const write = (name, value) => fs.writeFileSync(path.join(root, "data", name), `${JSON.stringify(value, null, 2)}\n`);

const continents = [...new Map(countries.filter((x) => x.continent_code && x.continent).map((x) => [x.continent_code, {
  id: x.continent_code.toLowerCase(), code: x.continent_code, name: x.continent
}])).values()].sort((a, b) => a.name.localeCompare(b.name));
const regions = [...new Map(countries.filter((x) => x.region).map((x) => [x.region, {
  id: `region-${slugify(x.region)}`, name: x.region, continent_ids: [...new Set(countries.filter((y) => y.region === x.region).map((y) => y.continent_code.toLowerCase()))].sort()
}])).values()].sort((a, b) => a.name.localeCompare(b.name));
const currencies = [...new Map(countries.filter((x) => x.currency_code).map((x) => [x.currency_code, {
  id: x.currency_code, code: x.currency_code, name: x.currency_name, country_codes: []
}])).values()];
const languages = [...new Map(countries.flatMap((x) => x.languages ?? []).map((code) => [code, { id: code, code, country_codes: [] }])).values()];
const timezoneIds = new Set(["UTC"]);
for (const country of countryRecords.values()) for (const timezone of country.metadata?.time_zones ?? []) timezoneIds.add(timezone);
const timezones = [...timezoneIds].sort().map((id) => ({ id, iana_id: id, name: id }));

for (const country of countries) {
  const code = country.iso2;
  country.continent_id = country.continent_code?.toLowerCase() ?? "";
  country.region_id = country.region ? `region-${slugify(country.region)}` : "";
  country.currency_ids = country.currency_code ? [country.currency_code] : [];
  country.language_ids = country.languages ?? [];
  country.timezone_ids = countryRecords.get(code.toLowerCase())?.metadata?.time_zones ?? [];
}
for (const currency of currencies) currency.country_codes = countries.filter((x) => x.currency_code === currency.code).map((x) => x.iso2).sort();
for (const language of languages) language.country_codes = countries.filter((x) => (x.languages ?? []).includes(language.code)).map((x) => x.iso2).sort();

write("continents.json", continents);
write("regions.json", regions);
write("currencies.json", currencies.sort((a, b) => a.code.localeCompare(b.code)));
write("languages.json", languages.sort((a, b) => a.code.localeCompare(b.code)));
write("timezones.json", timezones);
write("countries.json", countries);
for (const [code, country] of countryRecords) {
  const master = countries.find((item) => item.id === code);
  if (master) {
    Object.assign(country, Object.fromEntries(Object.entries(master).filter(([key]) => key.endsWith("_id") || key.endsWith("_ids"))));
    fs.writeFileSync(path.join(root, "data", code, "country.json"), `${JSON.stringify(country, null, 2)}\n`);
  }
}
console.log(`Generated ${continents.length} continents, ${regions.length} regions, ${currencies.length} currencies, ${languages.length} languages, and ${timezones.length} timezones.`);
