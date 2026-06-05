# Bangladesh Upazila Metadata Enrichment

`data/bd/upazilas.json` was enriched with `lat`, `lon`, `pcode`, and `area_sqkm` values from the HDX Bangladesh COD-AB gazetteer.

## Source

- Dataset: Bangladesh - Subnational Administrative Boundaries (`cod-ab-bgd`)
- Sheet: `bgd_admin3`
- Fields: `center_lat`, `center_lon`, `adm3_pcode`, `area_sqkm`
- Source agency: Bangladesh Bureau of Statistics (BBS)
- Publisher/maintainer: OCHA / HDX
- License: CC BY 3.0 IGO

## Match Summary

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
