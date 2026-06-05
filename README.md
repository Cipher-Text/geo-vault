# Geo Vault

A curated collection of geolocation datasets for Bangladesh and the world.

Geo Vault provides structured geolocation data for administrative regions, including Bangladesh divisions, districts, upazilas, unions, coordinates, and related metadata. The repository is organized so it can grow into a broader vault of worldwide geolocation datasets.

## Datasets

### Bangladesh

Primary JSON datasets live in [`data/bd`](data/bd):

| File | Description |
| --- | --- |
| `divisions.json` | Bangladesh divisions with English name, Bangla name, and government website. |
| `districts.json` | Districts mapped to divisions, including latitude, longitude, Bangla name, and government website. |
| `upazilas.json` | Upazilas mapped to districts, including English name, Bangla name, government website, latitude, longitude, p-code, and area. |
| `unions.json` | Unions mapped to upazilas, including English name, Bangla name, and government website. |
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
  "url": "www.chittagongdiv.gov.bd"
}
```

Example district:

```json
{
  "id": "1",
  "division_id": "1",
  "name": "Comilla",
  "bn_name": "কুমিল্লা",
  "lat": "23.4682747",
  "lon": "91.1788135",
  "url": "www.comilla.gov.bd"
}
```

Example upazila:

```json
{
  "id": "1",
  "district_id": "1",
  "name": "Debidwar",
  "bn_name": "দেবিদ্বার",
  "url": "debidwar.comilla.gov.bd",
  "lat": "23.5797482",
  "lon": "90.99808648",
  "pcode": "BD201927",
  "area_sqkm": "238.36"
}
```

## Sources

The initial Bangladesh administrative datasets are adapted from the MIT-licensed Bangladesh GeoCode dataset. Upazila latitude, longitude, p-code, and area values are joined from the HDX Bangladesh COD-AB gazetteer, sourced from the Bangladesh Bureau of Statistics and OCHA.

See [`docs/data-sources.md`](docs/data-sources.md) for attribution and source notes.

## License

Code and MIT-sourced Bangladesh administrative data use the MIT license. Some enriched data fields have separate attribution requirements, including upazila coordinates from HDX/BBS/OCHA under CC BY 3.0 IGO.

See [`LICENSE`](LICENSE) and [`LICENSE-DATA.md`](LICENSE-DATA.md).
