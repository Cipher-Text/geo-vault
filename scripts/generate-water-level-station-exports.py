#!/usr/bin/env python3
"""Create CSV, JSON, and SQL exports for the mPDF water-level station table."""

import csv
import json
import re
from pathlib import Path


SOURCE = Path("data/countries/bd/mpdf.csv")
BASE = Path("data/countries/bd/formats/water-level-station")
DISTRICTS = Path("data/countries/bd/formats/districts/districts.json")
UPAZILAS = Path("data/countries/bd/formats/upazilas/upazilas.json")

CSV_HEADERS = [
    "SL", "Station ID", "Station", "River", "Tidal Status",
    "District ID", "District", "Upazila ID", "Upazila", "Latitude",
    "Longitude",
]

DISTRICT_ALIASES = {
    "Coxs Bazar": "Coxsbazar",
    "Cumilla": "Comilla",
    "Jessore": "Jashore",
    "Jhalokathi": "Jhalakathi",
    "Nawabganj": "Chapainawabganj",
}

UPAZILA_ALIASES = {
    ("Barguna", "Patharghata"): "Pathorghata",
    ("Barisal", "Gaurnadi"): "Gournadi",
    ("Bhola", "Daulatkhan"): "Doulatkhan",
    ("Bogura", "Bogura Sadar"): "Bogra Sadar",
    ("Bogura", "Dhupchanchia"): "Dupchanchia",
    ("Bogura", "Sonatola"): "Sonatala",
    ("Brahmanbaria", "Brahamanbaria Sadar"): "Brahmanbaria Sadar",
    ("Chandpur", "Matlab Dakshin"): "Matlab South",
    ("Chandpur", "Matlab Uttar"): "Matlab North",
    ("Chattogram", "Bashkhali"): "Banshkhali",
    ("Chuadanga", "Jjbannagar"): "Jibannagar",
    ("Coxs Bazar", "Cox's Bazar Sadar"): "Coxsbazar Sadar",
    ("Coxs Bazar", "Maheshkhali"): "Moheshkhali",
    ("Cumilla", "Cumilla Sadar"): "Comilla Sadar",
    ("Dhaka", "Dhaka Sadar(Kotwal"): None,
    ("Dinajpur", "Kaharole"): "Kaharol",
    ("Dinajpur", "Biral"): "Birol",
    ("Gaibandha", "Fulchhari"): "Phulchari",
    ("Gaibandha", "Saghatta"): "Saghata",
    ("Jamalpur", "Dewanganj"): "Dewangonj",
    ("Jamalpur", "Melandaha"): "Melandah",
    ("Jessore", "Chaugachha"): "Chougachha",
    ("Jessore", "Jhikargachha"): "Jhikargacha",
    ("Jhalokathi", "Jhalokati Sadar"): "Jhalakathi Sadar",
    ("Khagrachhari", "Manikchhari"): "Manikchari",
    ("Khulna", "Dacope"): "Dakop",
    ("Khulna", "Paikgachha"): "Paikgasa",
    ("Kishoreganj", "Astagram"): "Austagram",
    ("Kurigram", "Raumari"): "Rowmari",
    ("Madaripur", "Rajori"): "Rajoir",
    ("Manikganj", "Ghior"): "Gior",
    ("Manikganj", "Shivalaya"): "Shibaloy",
    ("Moulvibazar", "Kamalganj"): "Kamolganj",
    ("Munshiganj", "Gazaria"): "Gajaria",
    ("Munshiganj", "Lohajang"): "Louhajanj",
    ("Mymensingh", "Gaffargaon"): "Gafargaon",
    ("Mymensingh", "Muktagachha"): "Muktagacha",
    ("Naogaon", "Mahadebpur"): "Mohadevpur",
    ("Narsingdi", "Roypura"): "Raipura",
    ("Nawabganj", "Gomastapur"): "Gomostapur",
    ("Nawabganj", "Nawabganj Sadar"): "Chapainawabganj Sadar",
    ("Nilphamari", "Saidpur"): "Syedpur",
    ("Noakhali", "Hatiya"): "Hatia",
    ("Pabna", "Ishwardi"): "Ishurdi",
    ("Panchagarh", "Tentulia"): "Tetulia",
    ("Pirojpur", "Nazirpiur"): "Nazirpur",
    ("Pirojpur", "Swarupkati"): "Nesarabad",
    ("Rajbari", "Goalandaghat"): "Goalanda",
    ("Rajbari", "Pangsha"): "Pangsa",
    ("Netrokona", "Mohanganj"): "Mohongonj",
    ("Rajshahi", "Baghmara"): "Bagmara",
    ("Rajshahi", "Boalia"): None,
    ("Rangpur", "Badarganj"): "Badargonj",
    ("Rangpur", "Taraganj"): "Taragonj",
    ("Shariatpur", "Sariatpur Sadar"): "Shariatpur Sadar",
    ("Sherpur", "Sreebardi"): "Sreebordi",
    ("Sirajganj", "Raiganj"): "Raigonj",
    ("Sunamganj", "Bishwamvarpur"): "Bishwambarpur",
    ("Sunamganj", "Dharampasha"): "Dharmapasha",
    ("Sylhet", "Kanairghat"): "Kanaighat",
    ("Sylhet", "Osmani Nagar"): "Osmaninagar",
    ("Thakurgaon", "Thakurgaon"): "Thakurgaon Sadar",
}


def load_table(path):
    payload = json.loads(path.read_text(encoding="utf-8"))
    return next(item["data"] for item in payload if item.get("type") == "table")


def key(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


def quote_sql(value):
    return "'" + value.replace("'", "''") + "'"


def main():
    districts = load_table(DISTRICTS)
    upazilas = load_table(UPAZILAS)
    district_by_name = {key(row["name"]): row for row in districts}
    upazila_by_district_and_name = {
        (row["district_id"], key(row["name"])): row for row in upazilas
    }

    with SOURCE.open(encoding="utf-8", newline="") as handle:
        source_rows = list(csv.DictReader(handle))

    output_rows = []
    unresolved = []
    for source in source_rows:
        source_district = source["District"]
        district_name = DISTRICT_ALIASES.get(source_district, source_district)
        district = district_by_name.get(key(district_name))
        district_id = district["id"] if district else None

        source_upazila = source["Upazila"]
        upazila_name = UPAZILA_ALIASES.get(
            (source_district, source_upazila), source_upazila
        )
        upazila = (
            upazila_by_district_and_name.get((district_id, key(upazila_name)))
            if district_id and upazila_name
            else None
        )
        upazila_id = upazila["id"] if upazila else None
        if not district_id or not upazila_id:
            unresolved.append((source["SL"], source_district, source_upazila))

        output_rows.append({
            "SL": source["SL"],
            "Station ID": source["Station ID"],
            "Station": source["Station"],
            "River": source["River"],
            "Tidal Status": source["Tidal Status"],
            "District ID": district_id or "",
            "District": source_district,
            "Upazila ID": upazila_id or "",
            "Upazila": source_upazila,
            "Latitude": source["Latitude"],
            "Longitude": source["Longitude"],
        })

    if unresolved:
        details = "; ".join(f"{sl}: {district} / {upazila}" for sl, district, upazila in unresolved)
        print(f"Warning: unresolved upazila IDs ({len(unresolved)}): {details}")

    BASE.mkdir(parents=True, exist_ok=True)
    with (BASE / "water-level-station.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=CSV_HEADERS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(output_rows)

    json_rows = []
    for row in output_rows:
        json_rows.append({
            "sl": row["SL"],
            "station_id": row["Station ID"],
            "station": row["Station"],
            "river": row["River"],
            "tidal_status": row["Tidal Status"],
            "district_id": row["District ID"] or None,
            "district": row["District"],
            "upazila_id": row["Upazila ID"] or None,
            "upazila": row["Upazila"],
            "latitude": row["Latitude"],
            "longitude": row["Longitude"],
        })
    json_payload = [
        {"type": "header", "version": "4.8.5", "comment": "Export to JSON plugin for PHPMyAdmin"},
        {"type": "database", "name": "bd_geo_code"},
        {"type": "table", "name": "water_level_stations", "database": "bd_geo_code", "data": json_rows},
    ]
    (BASE / "water-level-station.json").write_text(
        json.dumps(json_payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    columns = [
        ("sl", "int", False), ("station_id", "varchar(20)", False),
        ("station", "varchar(100)", False), ("river", "varchar(100)", False),
        ("tidal_status", "varchar(12)", False), ("district_id", "int", True),
        ("district", "varchar(30)", False), ("upazila_id", "int", True),
        ("upazila", "varchar(40)", False), ("latitude", "varchar(15)", False),
        ("longitude", "varchar(15)", False),
    ]
    sql = [
        "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";",
        "SET NAMES utf8mb4;",
        "START TRANSACTION;",
        "",
        "CREATE TABLE `water_level_stations` (",
    ]
    definitions = []
    for name, sql_type, nullable in columns:
        definitions.append(f"  `{name}` {sql_type} {'DEFAULT NULL' if nullable else 'NOT NULL'}")
    sql.append(",\n".join(definitions) + ",\n  PRIMARY KEY (`sl`),\n  KEY `idx_water_level_stations_district_id` (`district_id`),\n  KEY `idx_water_level_stations_upazila_id` (`upazila_id`)\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;")
    sql.append("")
    sql.append("INSERT INTO `water_level_stations` (`" + "`, `".join(name for name, _type, _nullable in columns) + "`) VALUES")
    values = []
    for row in output_rows:
        vals = []
        for name, _type, nullable in columns:
            csv_name = next(header for header in CSV_HEADERS if header.lower().replace(" ", "_") == name)
            value = row[csv_name]
            vals.append("NULL" if nullable and value == "" else quote_sql(value))
        values.append("(" + ", ".join(vals) + ")")
    sql.append(",\n".join(values) + ";")
    sql.extend(["", "COMMIT;", ""])
    (BASE / "water-level-station.sql").write_text("\n".join(sql), encoding="utf-8")
    print(f"Wrote {len(output_rows)} rows to {BASE}")


if __name__ == "__main__":
    main()
