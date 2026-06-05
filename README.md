# Geo Vault

A curated collection of geolocation datasets for Bangladesh and the world.

Geo Vault provides structured geolocation data for administrative regions, including Bangladesh divisions, districts, upazilas, unions, coordinates, and related metadata. The repository is organized so it can grow into a broader vault of worldwide geolocation datasets.

## Datasets

### Bangladesh

Primary JSON datasets live in [`data/bd`](data/bd):

| File | Description |
| --- | --- |
| `divisions.json` | Bangladesh divisions with names, slug, p-code, area, center coordinates, website, and child counts. |
| `districts.json` | Districts mapped to divisions, including names, slug, p-code, area, center coordinates, source coordinates, website, and child counts. |
| `upazilas.json` | Upazilas mapped to districts and divisions, including names, slug, p-code, area, center coordinates, website, and union count. |
| `unions.json` | Unions mapped to upazilas, districts, and divisions, including names, slug, parent IDs, parent p-codes, and website. |
| `geojson/districts.geojson` | GeoJSON boundaries for Bangladesh districts. |

Original alternate formats are preserved in [`data/bd/formats`](data/bd/formats), including CSV, SQL, XML, PHP arrays, and the original phpMyAdmin JSON exports.

### World

Worldwide datasets are planned under [`data/world`](data/world):

| File | Description |
| --- | --- |
| `countries.json` | Countries and country-level metadata. |
| `states.json` | States, provinces, or equivalent administrative regions. |
| `cities.json` | Cities and populated places. |

These files currently start as empty arrays until data sources and schema coverage are added.

## Structure

```txt
geo-vault/
├── data/
│   ├── bd/
│   │   ├── divisions.json
│   │   ├── districts.json
│   │   ├── upazilas.json
│   │   ├── unions.json
│   │   ├── geojson/
│   │   └── formats/
│   └── world/
│       ├── countries.json
│       ├── states.json
│       └── cities.json
├── schemas/
├── docs/
├── README.md
└── LICENSE
```

## Data Shape

Bangladesh JSON files are plain arrays of objects.

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
  "url": "www.chittagongdiv.gov.bd",
  "district_count": "11",
  "upazila_count": "104",
  "union_count": "950"
}
```

Example district:

```json
{
  "id": "1",
  "division_id": "1",
  "name": "Comilla",
  "bn_name": "কুমিল্লা",
  "slug": "comilla",
  "country_code": "BD",
  "admin_level": "district",
  "pcode": "BD2019",
  "division_pcode": "BD20",
  "lat": "23.4682747",
  "lon": "91.1788135",
  "center_lat": "23.43704815",
  "center_lon": "91.03297863",
  "area_sqkm": "3097.33937792",
  "url": "www.comilla.gov.bd",
  "upazila_count": "17",
  "union_count": "192"
}
```

Example upazila:

```json
{
  "id": "1",
  "division_id": "1",
  "district_id": "1",
  "name": "Debidwar",
  "bn_name": "দেবিদ্বার",
  "slug": "debidwar",
  "country_code": "BD",
  "admin_level": "upazila",
  "pcode": "BD20190040",
  "division_pcode": "BD20",
  "district_pcode": "BD2019",
  "lat": "23.5797482",
  "lon": "90.99808648",
  "area_sqkm": "239.26585137",
  "url": "debidwar.comilla.gov.bd",
  "union_count": "15"
}
```

Example union:

```json
{
  "id": "1",
  "division_id": "1",
  "district_id": "1",
  "upazila_id": "1",
  "upazilla_id": "1",
  "name": "Subil",
  "bn_name": "সুবিল",
  "slug": "subil",
  "country_code": "BD",
  "admin_level": "union",
  "division_pcode": "BD20",
  "district_pcode": "BD2019",
  "upazila_pcode": "BD20190040",
  "url": "subilup.comilla.gov.bd"
}
```

## Sources

The initial Bangladesh administrative datasets are adapted from the MIT-licensed Bangladesh GeoCode dataset. Division, district, and upazila p-codes, area values, and center coordinates are joined from the HDX Bangladesh COD-AB gazetteer, sourced from the Bangladesh Bureau of Statistics and OCHA. Slugs, parent IDs, parent p-codes, country codes, admin levels, and child counts are derived from repository data.

See [`docs/data-sources.md`](docs/data-sources.md) for attribution and source notes.

## License

Code and MIT-sourced Bangladesh administrative data use the MIT license. Some enriched data fields have separate attribution requirements, including p-codes, area, and center coordinates from HDX/BBS/OCHA under CC BY 3.0 IGO.

See [`LICENSE`](LICENSE) and [`LICENSE-DATA.md`](LICENSE-DATA.md).
