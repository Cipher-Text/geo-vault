#!/usr/bin/env python3
"""Remove BWDB river records already represented in water-bodies.csv."""

import csv
import re
from pathlib import Path


RAW = Path("data/countries/bd/raw")
BWDB = RAW / "bwdb-rivers.csv"
WATER_BODIES = RAW / "water-bodies.csv"
HEADERS = ["bwdb_serial", "river_name_en", "bwdb_zone", "border_river", "flow_type", "source"]


def normalize(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


def main():
    with WATER_BODIES.open(encoding="utf-8", newline="") as handle:
        existing = {normalize(row["name_en"]) for row in csv.DictReader(handle)}
    with BWDB.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))

    removed = [row for row in rows if normalize(row["river_name_en"]) in existing]
    remaining = [row for row in rows if normalize(row["river_name_en"]) not in existing]
    remaining.sort(key=lambda row: int(row["bwdb_serial"]))

    with BWDB.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADERS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(remaining)

    print(f"Removed {len(removed)} duplicate BWDB records; {len(remaining)} remain")
    print("Removed:", ", ".join(row["river_name_en"] for row in removed))


if __name__ == "__main__":
    main()
