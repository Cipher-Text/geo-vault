# Data Sources

## Bangladesh

The initial Bangladesh datasets are adapted from the MIT-licensed Bangladesh GeoCode project by Nuhil Mehdy.

Included data:

- Bangladesh administrative hierarchy (`data/bd/administrative.json`)
- City corporations are maintained as a separate urban local-government collection within the hierarchy file, based on the Local Government Division's city-corporation list.
- District GeoJSON boundaries (`data/bd/geojson/districts.geojson`)
- Alternate dataset formats: CSV, SQL, JSON, PHP, and XML (`data/bd/formats/`)

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

## Countries

`data/countries.json` and per-country `country.json` files are generated from GeoNames `countryInfo.txt` and enriched with Natural Earth country metadata where available.

- Primary source: GeoNames country info
- Natural Earth enrichment fields: region, subregion, label coordinates, official name, Wikidata ID
- GeoNames URL: https://download.geonames.org/export/dump/countryInfo.txt
- Natural Earth URL: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/
- GeoNames license: Creative Commons Attribution 4.0
- Natural Earth license: Public domain

### United States Country Metadata

The optional `metadata` block in `data/us/country.json` adds current U.S.-specific country facts:

- Population estimate: U.S. Census Bureau QuickFacts, July 1, 2025
- Land and water area: U.S. Census Bureau GEOINFO, 2023
- Language distribution: U.S. Census Bureau 2023 American Community Survey, Table S1601
- Time zones: IANA time zone identifiers representing the nine U.S. time-zone areas, including territories

The existing `population` and `area_sqkm` fields remain unchanged because they are sourced from GeoNames countryInfo.

### India Districts

`data/in/districts.json` contains 763 GeoNames administrative-level-2 records representing Indian districts and district-equivalent areas. Records retain GeoNames identifiers, state and district codes, coordinates, population, time zone, and source modification dates.

- Source: GeoNames India country dump (`IN.zip`)
- Filter: `feature_class=A` and `feature_code=ADM2`
- License: Creative Commons Attribution 4.0

### India Country Metadata

The optional `metadata` block in `data/in/country.json` adds India-specific country facts:

- Population estimate and area: World Bank World Development Indicators, 2025
- Official-language policy: Department of Official Language, Government of India
- Scheduled languages and mother-tongue context: Census of India 2011
- Time zone: IANA `Asia/Kolkata`, UTC+05:30

The existing `population` and `area_sqkm` fields remain unchanged because they are sourced from GeoNames countryInfo.

## Admin-1 Regions

Per-country `admin1.json` files for the US, Pakistan, and China are generated from Natural Earth Admin 1 - States, Provinces. India uses the country-specific `states.json` filename while retaining the same Natural Earth state and union-territory source data.

- Source: Natural Earth Admin 1 - States, Provinces
- URL: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/
- License: Public domain

## Cities

Per-country `cities.json` files are generated from GeoNames `cities15000`.

- Source: GeoNames cities with population greater than 15000
- URL: https://download.geonames.org/export/dump/cities15000.zip
- License: Creative Commons Attribution 4.0
