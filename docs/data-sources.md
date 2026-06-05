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

### Upazila Coordinates, P-Codes, and Area

Upazila `lat`, `lon`, `pcode`, and `area_sqkm` fields were joined from the HDX Bangladesh COD-AB gazetteer:

- Dataset: Bangladesh - Subnational Administrative Boundaries (`cod-ab-bgd`)
- Source: Bangladesh Bureau of Statistics (BBS)
- Publisher/maintainer: OCHA Field Information Services Section / HDX
- Fields: `center_lat`, `center_lon`, `adm3_pcode`, and `area_sqkm` from the `bgd_admin3` sheet
- License: Creative Commons Attribution for Intergovernmental Organisations (CC BY 3.0 IGO)
- Dataset URL: https://data.humdata.org/dataset/cod-ab-bgd

The coordinates represent administrative center coordinates from the gazetteer, not surveyed upazila office locations.

Population has not been added yet. Add it only from a source with clear census year, licensing, and upazila-level identifiers or parent district fields suitable for a reliable join.

## World

Worldwide datasets are planned but not yet populated. Add source notes here when country, state/province, and city datasets are introduced.
