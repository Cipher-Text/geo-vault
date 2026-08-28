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

### Country Reference Collections

The normalized reference files are generated from the country collection and existing country metadata. Currency and language country lists are derived from the corresponding country fields. Timezone identifiers use the IANA naming convention; only country-to-timezone links already present in sourced country metadata are populated.

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

### China Country Metadata

The optional `metadata` block in `data/cn/country.json` adds China-specific country facts:

- Population estimate: National Bureau of Statistics of China, year-end 2025
- Area: World Bank World Development Indicators
- Language policy and language context: national standard-language policy and commonly reported regional/minority languages
- Time zone: IANA `Asia/Shanghai`, UTC+08:00

The existing `population` and `area_sqkm` fields remain unchanged because they are sourced from GeoNames countryInfo.

### Pakistan Country Metadata

The optional `metadata` block in `data/pk/country.json` adds Pakistan-specific country facts:

- Population estimate: World Bank World Development Indicators, 2024
- Language policy: Constitution of Pakistan
- Common-language context: Pakistan Bureau of Statistics
- Time zone: IANA `Asia/Karachi`, UTC+05:00

The existing `population` and `area_sqkm` fields remain unchanged because they are sourced from GeoNames countryInfo.

## Admin-1 Regions

The worldwide normalized Admin-1 collection is stored in `data/admin1.json`. It contains first-level divisions such as states, provinces, departments, and regions, with parent country references and coordinates.

Per-country `admin1.json` files for the US, Pakistan, and China are generated from Natural Earth Admin 1 - States, Provinces. India uses the country-specific `states.json` filename while retaining the same Natural Earth state and union-territory source data. Nepal’s `admin1.json` is generated from the GeoNames Nepal country dump and contains its seven provinces. Bhutan’s `admin1.json` is generated from the GeoNames Bhutan country dump and contains its 20 dzongkhags. Myanmar’s `admin1.json` is generated from the GeoNames Myanmar country dump and contains 15 states and regions.

- Source: Natural Earth Admin 1 - States, Provinces
- URL: https://www.naturalearthdata.com/downloads/10m-cultural-vectors/
- License: Public domain
- Worldwide Admin-1 source version: Natural Earth 10m cultural vectors, version 5.1.1 (source data updated 2022-05-08).

## Admin-2 Regions

The worldwide Admin-2 collection is stored in `data/admin2.json`. It is generated from GeoNames `admin2Codes.txt` and linked to GeoNames `admin1CodesASCII.txt` through the `parent_code`, `admin1_code`, and `admin2_code` fields. Depending on the country, these records represent districts, counties, municipalities, or equivalent second-level divisions. The source code table does not provide universal coordinates, so this layer intentionally contains names, identifiers, and hierarchy codes only.

- Source: GeoNames `admin2Codes.txt` and `admin1CodesASCII.txt`
- URL: https://download.geonames.org/export/dump/
- License: Creative Commons Attribution 4.0

## Admin-3 and Admin-4 Regions

The Admin-3 and Admin-4 importer reads `allCountries.txt` from the GeoNames `allCountries.zip` archive and selects records whose feature codes are `ADM3` or `ADM4`. These levels vary by country and may represent subdistricts, communes, unions, wards, or equivalent divisions. The importer preserves the full GeoNames hierarchy code in `parent_code`, `admin1_code`, `admin2_code`, `admin3_code`, and `admin4_code`.

The current committed exports cover Bangladesh, Bhutan, China, India, Myanmar, Nepal, Pakistan, and the United States. Additional country ZIP files can be combined and passed to the same importer as coverage expands.

- Source: GeoNames `allCountries.zip`
- URL: https://download.geonames.org/export/dump/
- License: Creative Commons Attribution 4.0

## Cities

Per-country `cities.json` files are generated from GeoNames `cities15000`.

- Source: GeoNames cities with population greater than 15000
- URL: https://download.geonames.org/export/dump/cities15000.zip
- License: Creative Commons Attribution 4.0

Nepal, Bhutan, and Myanmar are exceptions: their `cities.json` files are generated from their respective GeoNames country dumps by selecting populated places with population greater than 15,000.
