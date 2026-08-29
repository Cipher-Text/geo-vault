#!/usr/bin/env python3
"""Extract the mPDF water-level availability table without normalizing values."""

import csv
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path


SOURCE = Path("data/countries/bd/mpdf.pdf")
OUTPUT = Path("data/countries/bd/mpdf.csv")

# Left edges of the table columns in PDF points.  The PDF uses separate text
# blocks for each cell, so these remain stable even when a cell wraps.
COLUMN_STARTS = [25, 40, 70, 145, 280, 315, 360, 415, 452, 487]
HEADERS = [
    "SL",
    "Station ID",
    "Station",
    "River",
    "Tidal Status",
    "District",
    "Upazila",
    "Latitude",
    "Longitude",
    "First Date",
    "Last Date",
]
DATE_RE = re.compile(r"^\d{2}-\d{2}-\d{4}$")


def column_for(x_min: float) -> int:
    """Map a word's x coordinate to its table column."""
    for idx in range(len(COLUMN_STARTS) - 1, -1, -1):
        if x_min >= COLUMN_STARTS[idx]:
            return idx
    return 0


def page_lines(page):
    """Return (y, [(x, text), ...]) rows from one PDF page."""
    line_words = defaultdict(list)
    for word in page.iter("word"):
        x = float(word.attrib["xMin"])
        y = float(word.attrib["yMin"])
        text = "".join(word.itertext())
        # Text on the same baseline differs by tiny floating point amounts.
        y_key = round(y, 2)
        line_words[y_key].append((x, text))
    return [(y, sorted(words)) for y, words in sorted(line_words.items())]


def data_row_starts(page):
    """Find the baseline of each data row from its SL and Station ID cells."""
    starts = []
    for _y, words in page_lines(page):
        has_sl = any(25 <= x < 40 and text.isdigit() for x, text in words)
        has_station_id = any(
            40 <= x < 70 and text.startswith("SW") for x, text in words
        )
        if has_sl and has_station_id:
            starts.append(next(y for y, line_words in page_lines(page) if line_words == words))
    return starts


def extract_records(pdf_path: Path):
    bbox = subprocess.run(
        ["pdftotext", "-bbox-layout", str(pdf_path), "-"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    root = ET.fromstring(bbox)
    # pdftotext emits an XHTML default namespace; remove it for simple XPath.
    for element in root.iter():
        if "}" in element.tag:
            element.tag = element.tag.rsplit("}", 1)[1]
    parsed = []
    for page in root.findall(".//page"):
        starts = data_row_starts(page)
        row_cells = [defaultdict(list) for _ in starts]
        for block in page.findall(".//block"):
            words = list(block.iter("word"))
            if not words:
                continue
            x = float(block.attrib["xMin"])
            y_min = float(block.attrib["yMin"])
            y_max = float(block.attrib["yMax"])
            center = (y_min + y_max) / 2
            row_index, row_y = min(
                enumerate(starts), key=lambda item: abs(item[1] - center)
            )
            # Header/title/footer blocks are farther from a data-row baseline.
            if abs(row_y - center) > 8:
                continue
            for word in words:
                word_x = float(word.attrib["xMin"])
                word_y = float(word.attrib["yMin"])
                col = column_for(word_x)
                text = "".join(word.itertext())
                row_cells[row_index][col].append((word_y, word_x, text))

        for cells in row_cells:
            values_by_col = {}
            for col, values in cells.items():
                values_by_col[col] = [
                    text for _y, _x, text in sorted(values, key=lambda item: (item[0], item[1]))
                ]

            # The dates occupy one PDF column but two CSV columns.
            dates = []
            for value in values_by_col.get(9, []):
                dates.extend(token for token in value.split() if DATE_RE.match(token))
            if len(dates) != 2 or not all(DATE_RE.match(value) for value in dates):
                raise ValueError(f"Could not parse dates for record: {values_by_col}")

            row = [" ".join(values_by_col.get(idx, [])).strip() for idx in range(9)]
            row.extend(dates)
            parsed.append(row)

    return parsed


def main():
    rows = extract_records(SOURCE)
    expected = list(range(1, 416))
    actual = [int(row[0]) for row in rows]
    if actual != expected:
        raise ValueError(
            f"Expected SL values 1..415, got {len(rows)} rows and sequence {actual[:5]}...{actual[-5:]}"
        )
    if any(len(row) != len(HEADERS) for row in rows):
        raise ValueError("One or more extracted rows has the wrong number of columns")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(HEADERS)
        writer.writerows(rows)

    print(f"Wrote {len(rows)} rows to {OUTPUT}")


if __name__ == "__main__":
    try:
        main()
    except (subprocess.CalledProcessError, ET.ParseError, ValueError) as exc:
        print(f"Extraction failed: {exc}", file=sys.stderr)
        sys.exit(1)
