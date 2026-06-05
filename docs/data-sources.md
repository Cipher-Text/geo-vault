# Data Sources

## Bangladesh

The initial Bangladesh datasets are adapted from the MIT-licensed Bangladesh GeoCode project by Nuhil Mehdy.

Included data:

- Divisions
- Districts
- Upazilas
- Unions
- District GeoJSON boundaries
- Alternate dataset formats: CSV, SQL, JSON, PHP, and XML

The original project states that information, content, and spelling were collected from:

- Bangladesh government websites
- Wikipedia
- Google Maps

### P-Codes, Area, and Center Coordinates

Division, district, and upazila p-code, area, and center coordinate fields were joined from the HDX Bangladesh COD-AB gazetteer:

- Dataset: Bangladesh - Subnational Administrative Boundaries (`cod-ab-bgd`)
- Source: Bangladesh Bureau of Statistics (BBS)
- Publisher/maintainer: OCHA Field Information Services Section / HDX
- Division fields: `adm1_pcode`, `center_lat`, `center_lon`, and `area_sqkm` from the `bgd_admin1` sheet
- District fields: `adm2_pcode`, `adm1_pcode`, `center_lat`, `center_lon`, and `area_sqkm` from the `bgd_admin2` sheet
- Upazila fields: `adm3_pcode`, `adm2_pcode`, `adm1_pcode`, `center_lat`, `center_lon`, and `area_sqkm` from the `bgd_admin3` sheet
- License: Creative Commons Attribution for Intergovernmental Organisations (CC BY 3.0 IGO)
- Dataset URL: https://data.humdata.org/dataset/cod-ab-bgd

The coordinates represent administrative center coordinates from the gazetteer, not surveyed upazila office locations.

### Derived Fields

These fields are derived from repository data:

- `slug`
- `country_code`
- `admin_level`
- Parent IDs on child records
- Parent p-codes on child records
- `district_count`
- `upazila_count`
- `union_count`

Population has not been added yet. Add it only from a source with clear census year, licensing, and upazila-level identifiers or parent district fields suitable for a reliable join.

## World

### Countries

`data/world/countries.json` is generated from GeoNames `countryInfo.txt` and enriched with Natural Earth country metadata where available.

- Primary source: GeoNames country info
- Natural Earth enrichment fields: region, subregion, label coordinates, official name, Wikidata ID
- GeoNames URL: https://download.geonames.org/export/dump/countryInfo.txt
- Natural Earth URL: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
- GeoNames license: Creative Commons Attribution 4.0
- Natural Earth license: Public domain

### Admin-1 Regions

`data/world/admin1.json`, `data/world/states.json`, and `data/world/geojson/admin1.geojson` are generated from Natural Earth Admin 1 - States, Provinces.

- Source: Natural Earth Admin 1 - States, Provinces
- URL: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/
- License: Public domain

### Cities

`data/world/cities.json` is generated from GeoNames `cities15000`.

- Source: GeoNames cities with population greater than 15000
- URL: https://download.geonames.org/export/dump/cities15000.zip
- License: Creative Commons Attribution 4.0

### Country Geometry

`data/world/geojson/countries.geojson` is generated from Natural Earth Admin 0 - Countries.

- Source: Natural Earth Admin 0 - Countries
- URL: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
- License: Public domain
