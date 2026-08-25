# Schemas

JSON Schema definitions live in the `schemas/` directory and validate the shape of each data file.

## Universal Schemas

These schemas apply to country folders using the generic flat layout. Bangladesh and India use country-specific administrative layouts for their deeper coverage.

| Schema | Validates | Description |
| --- | --- | --- |
| `country.schema.json` | `{cc}/country.json` | Country record with ISO codes, population, currency, coordinates, etc. |
| `admin1.schema.json` | `{cc}/admin1.json` | First-level administrative divisions from Natural Earth (states, provinces, etc.). |
| `city.schema.json` | `{cc}/cities.json` | GeoNames populated places with population greater than 15,000. |

## Bangladesh-Specific Schema

Bangladesh has deeper administrative coverage with its own field set (Bengali names, p-codes, area, child counts). The nested hierarchy is validated by `schemas/bd/administrative.schema.json`.

India uses country-specific filenames, `data/in/states.json` and `data/in/districts.json`, so its administrative levels retain the local terms state, union territory, and district.

| Schema | Validates | Structure |
| --- | --- | --- |
| `bd/administrative.schema.json` | `bd/administrative.json` | Divisions → districts → upazilas → unions, plus city corporations |


## Notes

- All field values are strings, matching the original source datasets.
- `additionalProperties` is `false` on all schemas to catch unexpected fields.
- When adding a new country with deeper admin levels, create country-specific schemas under `schemas/{cc}/`.
