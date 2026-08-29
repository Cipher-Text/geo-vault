#!/usr/bin/env python3
"""Merge Bangladesh inland water bodies and rivers into one typed CSV."""

import csv
from pathlib import Path


RAW = Path("data/countries/bd/raw")
OUTPUT = RAW / "water-bodies.csv"

HEADERS = [
    "record_type", "name_en", "name_bn", "water_body_type", "river_type", "body_type",
    "district", "upazila", "latitude", "longitude", "area_monsoon_sqkm",
    "area_dry_sqkm", "water_volume_est", "origin_source", "division_traversed",
    "districts_traversed", "length_km_bd", "avg_width_m", "max_depth_m",
    "mean_discharge_m3s", "bwdb_gauging_stations", "outfall_tributary_to",
    "transboundary_flag", "banglapedia_match_name", "banglapedia_length_km",
    "banglapedia_area_covered_old_districts", "banglapedia_source",
]

BANGLEPEDIA_SOURCE = "https://en.banglapedia.org/index.php/River"
BANGLEPEDIA_RIVERS = {
    "Padma": ("Ganges-Padma (Ganges 258, Padma 120)", "378", "Rajshahi (145), Pabna (98), Dhaka and Faridpur (135)"),
    "Jamuna": ("Brahmaputra-Jamuna (Jamuna 207)", "276", "Rangpur (140) Pabna (136)"),
    "Arial Khan": ("Arial Khan", "160", "Faridpur (102) Barisal (58)"),
    "Bangshi": ("Bangshi", "238", "Mymensingh (198) Dhaka (40)"),
    "Betna-Kholpetua": ("Betna-Kholpotua", "191", "Jessore (103) Khulna (88)"),
    "Bhadra": ("Bhadra", "193", "Jessore (58) Khulna (135)"),
    "Bhairab": ("Bhairab", "250", "Jessore, Khulna"),
    "Bhogai-Kangsa": ("Bhogai-Kangsa", "225", "Mymensingh (225)"),
    "Brahmaputra-Jamuna": ("Brahmaputra-Jamuna (Jamuna 207)", "276", "Rangpur (140) Pabna (136)"),
    "Buriganga": ("Buriganga", "27", "Dhaka (27)"),
    "Chitra": ("Chitra", "170", "Kushtia (19) Jessore (151)"),
    "Dakatia": ("Dakatia", "207", "Comilla (180) Noakhali (27)"),
    "Dhaleswari": ("Dhaleshwari", "160", "Mymensingh, Dhaka"),
    "Dhaleshwari": ("Dhaleshwari", "160", "Mymensingh, Dhaka"),
    "Dhanu-Baulai-Ghorautra": ("Dhanu-Baulai-Ghorautra", "235", "Mymensingh (126) Sylhet (109)"),
    "Deonai_Charalkata_Jamuneswari_Karatoa": ("Donai-Charalkata-Jamuneshwari-Karatoya", "450", "Rangpur (193), Bogra (157), Pabna (100)"),
    "Ganges-Padma": ("Ganges-Padma (Ganges 258, Padma 120)", "378", "Rajshahi (145), Pabna (98), Dhaka and Faridpur (135)"),
    "Gorai-Madhumati-Haringhata-Baleswar": ("Gorai-Madhumati-Baleshwar", "371", "Kushtia (37), Faridpur (71), Jessore (92), Khulna (104), Barisal (67)"),
    "Gorai": ("Gorai-Madhumati-Baleshwar", "371", "Kushtia (37), Faridpur (71), Jessore (92), Khulna (104), Barisal (67)"),
    "Ghagot": ("Ghaghat", "236", "Rangpur (236)"),
    "Karatoa-Atrai-Gur-Gumani-Hurasagar": ("Karatoya-Atrai-Gur-Gumani-Hurasagar", "597", "Dinajpur (259), Rajshahi (258), Pabna (80)"),
    "Karnafuli": ("Karnafuli", "180", "Chittagong HT, Chittagong"),
    "Karnaphuli": ("Karnafuli", "180", "Chittagong HT, Chittagong"),
    "Kobadak": ("Kobadak", "260", "Jessore (80) Khulna (180)"),
    "Kopotakho (Kabadak)": ("Kobadak", "260", "Jessore (80) Khulna (180)"),
    "Kumar (Jessore)": ("Kumar", "162", "Jessore, Faridpur"),
    "Kushiyara": ("Kushiyara", "228", "Sylhet (228)"),
    "Little Feni Dakatia": ("Little Feni-Dakatia", "195", "Noakhali (95) Comilla (100)"),
    "Matamuhuri": ("Matamuhuri", "287", "Chittagong HT and Chittagong"),
    "Mathabhanga": ("Mathabhanga", "156", "Rajshahi (16), Kushtia (140)"),
    "Nabaganga": ("Nabaganga", "230", "Kushtia (26) Jessore (204)"),
    "Old Brahmaputra": ("Old Brahmaputra", "276", "Mymensingh (276)"),
    "Punarbhaba": ("Punarbhaba", "160", "Dinajpur (80) Rajshahi (80)"),
    "Rupsa-Pasur": ("Rupsa-Pasur", "141", "Khulna (141)"),
    "Sangu": ("Sangu", "173", "Chittagong (80), Chittagong Hill Tracts (93)"),
    "Surma-Meghna": ("Surma-Meghna", "670", "Sylhet (290), Comilla (235), Barisal (145)"),
    "Teesta": ("Tista", "115", "Rangpur (115)"),
}


def read_rows(path):
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def merge_row(source, record_type, water_body_type):
    row = {header: "" for header in HEADERS}
    row["record_type"] = record_type
    row["name_en"] = source.get("name_en", source.get("river_name_en", ""))
    row["name_bn"] = source.get("name_bn", source.get("river_name_bn", ""))
    row["water_body_type"] = water_body_type
    row["river_type"] = source.get("river_type", "")
    row["body_type"] = source.get("body_type", "")
    for field in (
        "district", "upazila", "latitude", "longitude", "area_monsoon_sqkm",
        "area_dry_sqkm", "water_volume_est", "origin_source", "division_traversed",
        "districts_traversed", "length_km_bd", "avg_width_m", "max_depth_m",
        "mean_discharge_m3s", "bwdb_gauging_stations", "outfall_tributary_to",
        "transboundary_flag",
    ):
        row[field] = source.get(field, "")
    if record_type == "river" and source["river_name_en"] in BANGLEPEDIA_RIVERS:
        match_name, length_km, area_covered = BANGLEPEDIA_RIVERS[source["river_name_en"]]
        row["banglapedia_match_name"] = match_name
        row["banglapedia_length_km"] = length_km
        row["banglapedia_area_covered_old_districts"] = area_covered
        row["banglapedia_source"] = BANGLEPEDIA_SOURCE
    return row


def main():
    inland = read_rows(RAW / "inland-water-body.txt")
    rivers = read_rows(RAW / "river.txt")
    rows = [merge_row(row, "inland_water_body", row["body_type"]) for row in inland]
    rows.extend(merge_row(row, "river", row["river_type"]) for row in rivers)

    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADERS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} rows ({len(inland)} inland water bodies, {len(rivers)} rivers) to {OUTPUT}")


if __name__ == "__main__":
    main()
