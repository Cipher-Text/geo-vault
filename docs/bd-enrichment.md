# Bangladesh Metadata Enrichment

Bangladesh division, district, and upazila datasets were enriched with p-codes, area, and center coordinate values from the HDX Bangladesh COD-AB gazetteer.

The union dataset now includes ADM4 p-codes and polygon-centroid coordinates for 2,629 unambiguous reconciliations against the Bangladesh DGHS `All_Union` boundary service. The remaining 1,911 records are intentionally left without these fields until their spelling aliases and source-code conflicts are reconciled.

The source contains 4,714 features and duplicated ADM4 codes. Matching used the existing repository upazila p-code to normalize the source's ADM4 code layout, then required an exact union-name match within that upazila. Duplicate source codes and duplicate repository name/parent keys were excluded from enrichment.

## Source

- Dataset: Bangladesh - Subnational Administrative Boundaries (`cod-ab-bgd`)
- Sheets: `bgd_admin1`, `bgd_admin2`, `bgd_admin3`
- Fields: `center_lat`, `center_lon`, administrative p-code fields, and `area_sqkm`
- Source agency: Bangladesh Bureau of Statistics (BBS)
- Publisher/maintainer: OCHA / HDX
- License: CC BY 3.0 IGO

## Union Boundary Metadata

- Service: Bangladesh DGHS `All_Union` FeatureServer layer
- URL: https://gis.dghs.gov.bd/server/rest/services/Hosted/All_Union/FeatureServer/0
- Fields used: `adm4_pcode`, division, district, upazila, union name, and polygon centroid
- Spatial reference: WGS84 / EPSG:4326
- Retrieved: 2026-08-26

## City Corporations

The hierarchy file includes 12 city corporations as a separate urban local-government collection. They are linked to their division and district by existing p-codes, include official government websites, and are not nested under unions.

- Source: Local Government Division city-corporation listing and Bangladesh National Portal government directory
- Sources: https://lgd.gov.bd/pages/static-pages/69414021c4774958d7b54bbc and https://bangladesh.gov.bd/views/ministry-and-directorate-list

## Upazila Match Summary

- Total repo upazilas enriched: 494
- Exact district-scoped name matches: 388
- Explicit aliases: 10
- Fuzzy transliteration matches: 96

## Explicit Aliases

These records were mapped with explicit aliases because the source dataset uses renamed or alternate administrative names:

| Repo district | Repo upazila | HDX ADM3 name |
| --- | --- | --- |
| Comilla | Comilla Sadar | Adarsha Sadar |
| Comilla | Sadarsouth | Sadar Dakkhin |
| Chandpur | Matlab South | Matlab Dakkhin |
| Chandpur | Matlab North | Matlab Uttar |
| Khulna | Fultola | Phultala |
| Pirojpur | Zianagar | Indurkani |
| Pirojpur | Nesarabad | Nesarabad (Swarupkathi) |
| Barisal | Barisal Sadar | Barishal Sadar (Kotwali) |
| Barisal | Wazirpur | Ujirpur |
| Sunamganj | South Sunamganj | Shantiganj |

District spelling aliases were also used for current administrative spellings, such as Comilla/Cumilla, Barisal/Barishal, Coxsbazar/Cox's Bazar, Jhalakathi/Jhalokati, Chapainawabganj/Chapainababganj, and Netrokona/Netrakona.
