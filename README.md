# Geo Vault

A curated collection of geolocation datasets organized by country.

Geo Vault provides structured geolocation data for administrative regions, cities, coordinates, and related metadata. Data is organized per country under ISO 3166-1 alpha-2 codes, with a master country list at the root.

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
│   ├── bd/
│   │   ├── country.json        Country record
│   │   ├── administrative.json  Divisions → districts → upazilas → unions + city corporations
│   │   ├── cities.json         Cities (137)
│   │   ├── geojson/
│   │   └── formats/            Legacy CSV, SQL, and JSON exports
│   ├── us/
│   │   ├── country.json
│   │   ├── admin1.json         States (51)
│   │   └── cities.json         Cities (3,399)
│   ├── in/
│   │   ├── country.json
│   │   ├── states.json        States & union territories (36)
│   │   ├── districts.json     Districts / zila (763)
│   │   └── cities.json         Cities (3,776)
│   ├── pk/
│   │   ├── country.json
│   │   ├── admin1.json         Provinces (8)
│   │   └── cities.json         Cities (363)
│   └── cn/
│       ├── country.json
│       ├── admin1.json         Provinces (32)
│       └── cities.json         Cities (2,093)
│   └── np/
│       ├── country.json        Country record
│       ├── admin1.json         Provinces (7)
│       └── cities.json         Cities (46)
│   └── bt/
│       ├── country.json        Country record
│       ├── admin1.json         Dzongkhags (20)
│       └── cities.json         Cities (4)
│   └── mm/
│       ├── country.json        Country record
│       ├── admin1.json         States & regions (15)
│       └── cities.json         Cities (176)
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

Every country folder follows the same pattern:

| File | Description |
| --- | --- |
| `country.json` | Single country record extracted from the master list. |
| `administrative.json` | Country-specific nested administrative hierarchy, where available. |
| `admin1.json` | First-level divisions for countries using the generic flat layout. |
| `states.json` | India-specific state and union-territory records. |
| `districts.json` | India-specific district/zila records. |
| `cities.json` | GeoNames populated places with population greater than 15,000. |
| `geojson/` | Boundary geometries, if available. |

Some country records may include an optional `metadata` object for country-specific enrichment. The USA, India, and China records currently include population, area, language, time-zone, and country-identifier metadata.

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

`data/bd/administrative.json` contains nested divisions, districts, upazilas, and unions, plus a separate `city_corporations` collection for urban local government. City corporations are not placed inside the rural union tree.

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

India-specific names are available in `data/in/states.json` and `data/in/districts.json`; records use `state`, `union_territory`, and `district` as their level names. Their `admin1_code` and `admin2_code` values match the corresponding state and city records, allowing cities to be joined to a district and state.

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
