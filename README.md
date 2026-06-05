# Geo Vault

A curated collection of geolocation datasets for Bangladesh and the world.

Geo Vault provides structured geolocation data for administrative regions, including Bangladesh divisions, districts, upazilas, unions, district coordinates, and related metadata. The repository is organized so it can grow into a broader vault of worldwide geolocation datasets.

## Datasets

### Bangladesh

Primary JSON datasets live in [`data/bd`](data/bd):

| File | Description |
| --- | --- |
| `divisions.json` | Bangladesh divisions with English name, Bangla name, and government website. |
| `districts.json` | Districts mapped to divisions, including latitude, longitude, Bangla name, and government website. |
| `upazilas.json` | Upazilas mapped to districts, including English name, Bangla name, and government website. |
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

## Sources

The initial Bangladesh datasets are adapted from the MIT-licensed Bangladesh GeoCode dataset. The original project notes that information was collected from Bangladesh government websites, Wikipedia, and Google Maps.

See [`docs/data-sources.md`](docs/data-sources.md) for attribution and source notes.

## License

MIT. See [`LICENSE`](LICENSE).
