# Schemas

JSON Schema definitions live in the `schemas/` directory and validate the shape of each data file.

## Universal Schemas

These schemas apply to every country folder.

| Schema | Validates | Description |
| --- | --- | --- |
| `country.schema.json` | `{cc}/country.json` | Country record with ISO codes, population, currency, coordinates, etc. |
| `admin1.schema.json` | `{cc}/admin1.json` | First-level administrative divisions from Natural Earth (states, provinces, etc.). |
| `city.schema.json` | `{cc}/cities.json` | GeoNames populated places with population greater than 15,000. |

## Bangladesh-Specific Schemas

Bangladesh has deeper administrative coverage with its own field set (Bengali names, p-codes, area, child counts). These schemas live in `schemas/bd/`.

| Schema | Validates | Admin Level |
| --- | --- | --- |
| `bd/admin1.schema.json` | `bd/admin1.json` | Divisions (8) |
| `bd/admin2.schema.json` | `bd/admin2.json` | Districts (64) |
| `bd/admin3.schema.json` | `bd/admin3.json` | Upazilas (494) |
| `bd/admin4.schema.json` | `bd/admin4.json` | Unions (4,540) |

Bangladesh `admin1.json` uses the BD-specific schema (not the universal one) because the data comes from a different source (HDX/BBS) with richer fields than Natural Earth.

## Notes

- All field values are strings, matching the original source datasets.
- `additionalProperties` is `false` on all schemas to catch unexpected fields.
- When adding a new country with deeper admin levels, create country-specific schemas under `schemas/{cc}/`.
