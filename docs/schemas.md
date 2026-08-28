# Schemas

JSON Schema definitions live in the `schemas/` directory and validate the shape of each data file.

## Universal Schemas

These schemas apply to country folders using the generic flat layout. Bangladesh and India use country-specific administrative layouts for their deeper coverage.

| Schema | Validates | Description |
| --- | --- | --- |
| `country.schema.json` | One `{cc}/country.json` record | Country record with ISO codes, population, currency, coordinates, etc. |
| `country-file.schema.json` | `data/countries.json` | Array of country records using `country.schema.json` as its item schema. |
| Reference files | `data/continents.json`, `regions.json`, `currencies.json`, `languages.json`, `timezones.json` | Normalized lookup collections referenced by IDs from country records. |
| `historical.schema.json` | Records in `data/historical/*.json` | Common contract for dated historical geographic and political records. |
| `admin1-file.schema.json` | `data/administrative/admin1.json` | Worldwide array of first-level administrative records using `admin1.schema.json` as its item schema. |
| `admin2.schema.json` | One record in `data/administrative/admin2.json` | Second-level division such as a district, county, or municipality. |
| `admin2-file.schema.json` | `data/administrative/admin2.json` | Worldwide array of Admin-2 records using `admin2.schema.json` as its item schema. |
| `admin3-4.schema.json` | One record in `data/administrative/admin3.json` or `data/administrative/admin4.json` | Third- or fourth-level division such as a subdistrict, commune, union, or ward. |
| `admin1.schema.json` | `{cc}/admin1.json` | First-level administrative divisions from Natural Earth (states, provinces, etc.). |
| `city.schema.json` | `{cc}/cities.json` | GeoNames populated places with population greater than 15,000. |

## Bangladesh-Specific Schema

Bangladesh has deeper administrative coverage with its own field set (Bengali names, p-codes, area, child counts). The nested hierarchy is validated by `schemas/bd/administrative.schema.json`.

India uses country-specific filenames, `data/countries/in/states.json` and `data/countries/in/districts.json`, so its administrative levels retain the local terms state, union territory, and district.

| Schema | Validates | Structure |
| --- | --- | --- |
| `bd/administrative.schema.json` | `bd/administrative.json` | Divisions → districts → upazilas → unions, plus city corporations |


## Notes

- Core source fields generally remain strings, matching the original source datasets. Country `metadata` fields use typed values where appropriate, such as integer estimates and arrays.
- `additionalProperties` is `false` on all schemas to catch unexpected fields.
- When adding a new country with deeper admin levels, create country-specific schemas under `schemas/{cc}/`.
- Run `npm run validate` after data changes. It checks JSON parsing, country identity consistency, duplicate country identifiers, and coordinate ranges.
