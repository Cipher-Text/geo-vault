#!/usr/bin/env python3
"""Import the current English BWDB river table into the Bangladesh raw folder."""

import csv
import html
import re
from pathlib import Path


HTML_SOURCE = Path("/tmp/bwdb-rivers.html")
OUTPUT = Path("data/countries/bd/raw/bwdb-rivers.csv")
SOURCE_URL = "https://en.bwdb.gov.bd/rivers-information"
HEADERS = ["bwdb_serial", "river_name_en", "bwdb_zone", "border_river", "flow_type", "source"]


def main():
    source = HTML_SOURCE.read_text(encoding="utf-8")
    body = re.search(r"<tbody[^>]*>(.*?)</tbody>", source, re.I | re.S)
    if not body:
        raise ValueError("BWDB table body not found")
    rows = []
    for raw_row in re.findall(r"<tr[^>]*>(.*?)</tr>", body.group(1), re.I | re.S):
        cells = [html.unescape(re.sub(r"<[^>]+>", "", cell)).strip() for cell in re.findall(r"<td[^>]*>(.*?)</td>", raw_row, re.I | re.S)]
        cells = [" ".join(cell.split()) for cell in cells]
        if len(cells) == 5 and cells[0].isdigit():
            rows.append(dict(zip(HEADERS[:5], cells)))
    rows.sort(key=lambda row: int(row["bwdb_serial"]))
    if len(rows) != 405 or [int(row["bwdb_serial"]) for row in rows] != list(range(1, 406)):
        raise ValueError(f"Expected BWDB serials 1..405, found {len(rows)} records")
    for row in rows:
        row["source"] = SOURCE_URL

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=HEADERS, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} BWDB river records to {OUTPUT}")


if __name__ == "__main__":
    main()
