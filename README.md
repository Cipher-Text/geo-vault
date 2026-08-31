# Geo Vault — Bangladesh Geographic and Administrative Data

Geo Vault is an open geographic data repository with structured country, city, and administrative-boundary datasets. It includes Bangladesh geographic data—divisions, districts, upazilas (উপজেলা), unions, city/thana records, p-codes, latitude/longitude coordinates, areas, and GeoJSON boundaries—alongside datasets for other countries.

The repository is useful for Bangladesh maps, location search, address forms, geocoding, GIS applications, data analysis, administrative lookups, and country-level geographic APIs. Data is organized per country under ISO 3166-1 alpha-2 codes, with a master country list at the root.

## Bangladesh Geographic Dataset

Bangladesh is the deepest-covered country in this repository. The dataset includes all 8 divisions, 64 districts (জেলা), 494 rural upazilas, 4,540 unions, and a consolidated upazila export containing IDs 1–596, including city/thana records. Rural upazilas include administrative p-codes, center latitude and longitude, area, government URLs, and nested unions. City/thana records include Google Maps geocoded coordinates where available.

Key Bangladesh files:

- [`data/countries/bd/administrative.json`](data/countries/bd/administrative.json) — nested divisions, districts, rural upazilas, unions, and city corporations.
- [`data/countries/bd/formats/upazilas/upazilas.csv`](data/countries/bd/formats/upazilas/upazilas.csv) — CSV export of upazila and city/thana records with district IDs, names, coordinates, and `is_city`.
- [`data/countries/bd/formats/upazilas/upazilas.json`](data/countries/bd/formats/upazilas/upazilas.json) — JSON export for applications and APIs.
- [`data/countries/bd/formats/upazilas/upazilas.sql`](data/countries/bd/formats/upazilas/upazilas.sql) — MySQL-compatible SQL dump.
- [`data/countries/bd/formats/upazilas/upazilas-495-596-with-district.csv`](data/countries/bd/formats/upazilas/upazilas-495-596-with-district.csv) — consolidated upazila list with district names, Bengali names, and coordinates.
- [`data/geojson/`](data/geojson/) — boundary geometries where available.

## Countries

| Code | Country | Admin Levels | Cities | Notes |
| --- | --- | --- | --- | --- |
| `bd` | Bangladesh | 4 (divisions, districts, upazilas, unions) | 137 | Deep coverage with p-codes, area, coordinates, GeoJSON |
| `us` | United States | 1 (states) | 3,399 | |
| `in` | India | 2 (states/UTs, districts) | 3,776 | |
| `pk` | Pakistan | 1 (provinces, territories) | 363 | |
| `cn` | China | 1 (provinces, municipalities, autonomous regions) | 2,093 | |
| `np` | Nepal | 1 (provinces) | 46 | |
| `bt` | Bhutan | 1 (dzongkhags) | 4 | |
| `mm` | Myanmar | 1 (states/regions) | 176 | |

## Structure

```txt
geo-vault/
├── data/
│   ├── countries.json          Master list of 252 countries
│   ├── administrative/          Global Admin-1 through Admin-4 datasets
│   ├── continents.json           Continent reference records
│   ├── regions.json              Region reference records
│   ├── currencies.json           Currency reference records
│   ├── languages.json            Language reference records
│   ├── timezones.json            Partial IANA timezone reference records
│   ├── countries/                Country-specific datasets by ISO2 code
│   ├── cities/                   Country-keyed city collections
│   ├── geojson/                  Boundary geometries
│   └── historical/               Historical geographic and political records
├── schemas/
│   ├── country.schema.json
│   ├── admin1.schema.json
│   ├── city.schema.json
│   └── bd/
│       └── administrative.schema.json
├── docs/
├── README.md
└── LICENSE
```

## Per-Country Layout

Every country folder under `data/countries/` follows the same pattern:

| File | Description |
| --- | --- |
| `country.json` | Single country record extracted from the master list. |
| `administrative.json` | Country-specific nested administrative hierarchy, where available. |
| `admin1.json` | First-level divisions for countries using the generic flat layout. |
| `states.json` | India-specific state and union-territory records. |
| `districts.json` | India-specific district/zila records. |
| `data/cities/{cc}.json` | GeoNames populated places with population greater than 15,000. |
| `data/geojson/` | Boundary geometries, if available. |

Some country records may include an optional `metadata` object for country-specific enrichment. The USA, India, China, and Pakistan records currently include population, language, time-zone, and country-identifier metadata.

India uses country-specific administrative filenames: `states.json` and `districts.json`.

## Data Shape

### Country

```json
{
  "id": "bd",
  "name": "Bangladesh",
  "official_name": "People's Republic of Bangladesh",
  "slug": "bangladesh",
  "iso2": "BD",
  "iso3": "BGD",
  "continent": "Asia",
  "region": "Asia",
  "subregion": "Southern Asia",
  "capital": "Dhaka",
  "area_sqkm": "144000",
  "population": "164689383",
  "currency_code": "BDT",
  "phone_code": "+880",
  "lat": "23.684994",
  "lon": "90.356331"
}
```

### Admin Level 1 (example: US state)

```json
{
  "id": "ne-usa-3514",
  "name": "California",
  "name_en": "California",
  "slug": "california",
  "country_code": "US",
  "country_iso3": "USA",
  "admin_level": "admin1",
  "type": "State",
  "iso_3166_2": "US-CA",
  "lat": "37.1841",
  "lon": "-119.271"
}
```

### Bangladesh Administrative Hierarchy

`data/countries/bd/administrative.json` contains nested divisions, districts, upazilas, and unions, plus a separate `city_corporations` collection for urban local government. City corporations are not placed inside the rural union tree.

Example division:

```json
{
  "id": "1",
  "name": "Chattagram",
  "bn_name": "চট্টগ্রাম",
  "slug": "chattagram",
  "country_code": "BD",
  "admin_level": "division",
  "pcode": "BD20",
  "area_sqkm": "32833.07733648",
  "center_lat": "22.70130794",
  "center_lon": "91.70586117",
  "district_count": "11",
  "upazila_count": "104",
  "union_count": "950"
}
```

### City

```json
{
  "id": "geonames-1185241",
  "geoname_id": "1185241",
  "name": "Dhaka",
  "ascii_name": "Dhaka",
  "slug": "dhaka",
  "country_code": "BD",
  "lat": "23.7104",
  "lon": "90.40744",
  "population": "10356500",
  "timezone": "Asia/Dhaka"
}
```

### India District

India-specific names are available in `data/countries/in/states.json` and `data/countries/in/districts.json`; records use `state`, `union_territory`, and `district` as their level names. Their `admin1_code` and `admin2_code` values match the corresponding state and city records, allowing cities to be joined to a district and state.

## Documentation

| Doc | Description |
| --- | --- |
| [`docs/data-sources.md`](docs/data-sources.md) | Full source attribution and licensing per dataset. |
| [`docs/schemas.md`](docs/schemas.md) | Schema layout and which schema validates which data file. |
| [`docs/contributing.md`](docs/contributing.md) | Guidelines for data changes and adding new countries. |
| [`docs/bd-enrichment.md`](docs/bd-enrichment.md) | Bangladesh metadata enrichment process and match details. |

## Sources

- **Bangladesh administrative data**: Adapted from the MIT-licensed Bangladesh GeoCode dataset. P-codes, area, and center coordinates from the HDX Bangladesh COD-AB gazetteer (BBS/OCHA, CC BY 3.0 IGO).
- **World countries**: GeoNames countryInfo enriched with Natural Earth metadata (GeoNames CC BY 4.0, Natural Earth public domain).
- **Admin-1 regions**: Natural Earth Admin 1 - States, Provinces (public domain).
- **Cities**: GeoNames cities15000 (CC BY 4.0).

See [`docs/data-sources.md`](docs/data-sources.md) for full attribution.

## License

Code and MIT-sourced Bangladesh administrative data use the MIT license. Some enriched data fields have separate attribution requirements.

See [`LICENSE`](LICENSE) and [`LICENSE-DATA.md`](LICENSE-DATA.md).
