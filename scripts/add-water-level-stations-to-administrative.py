#!/usr/bin/env python3
"""Attach matched water-level stations to their specific upazila records."""

import json
from pathlib import Path


ADMINISTRATIVE = Path("data/countries/bd/administrative.json")
STATIONS = Path("data/countries/bd/formats/water-level-station/water-level-station.json")


def main():
    administrative = json.loads(ADMINISTRATIVE.read_text(encoding="utf-8"))
    station_payload = json.loads(STATIONS.read_text(encoding="utf-8"))
    stations = next(item["data"] for item in station_payload if item.get("type") == "table")

    upazilas = {}
    for division in administrative["divisions"]:
        for district in division["districts"]:
            for upazila in district["upazilas"]:
                upazilas[(district["id"], upazila["id"])] = upazila

    for division in administrative["divisions"]:
        for district in division["districts"]:
            for upazila in district["upazilas"]:
                upazila.pop("water_level_stations", None)

    attached = 0
    unmatched = []
    for station in stations:
        district_id = station.get("district_id")
        upazila_id = station.get("upazila_id")
        target = upazilas.get((district_id, upazila_id)) if district_id and upazila_id else None
        if target is None:
            unmatched.append(station["sl"])
            continue
        target.setdefault("water_level_stations", []).append(station)
        attached += 1

    if unmatched:
        print(f"Skipped {len(unmatched)} stations without matched upazila IDs: {', '.join(unmatched)}")

    for upazila in upazilas.values():
        if "water_level_stations" in upazila:
            upazila["water_level_stations"].sort(key=lambda item: int(item["sl"]))

    ADMINISTRATIVE.write_text(
        json.dumps(administrative, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Attached {attached} water-level stations to {sum('water_level_stations' in u for u in upazilas.values())} upazilas")


if __name__ == "__main__":
    main()
