"""Aggregate Sri Lanka flood rows (DesInventar sheet) into district-by-year stats.

Reads:  AggregatedFloodData.xlsx (never modified), geoBoundaries district file
Writes: web/public/data/flood_stats.json (git-ignored: DesInventar reuse terms
        are unresolved, see docs/DATA_SOURCES.md)

Standard library only. Run from the project root:
    python -I scripts/prepare_flood_stats.py
"""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import date, timedelta

XLSX = "AggregatedFloodData.xlsx"
DISTRICTS = "data/raw/geoboundaries/LKA_ADM2_simplified.geojson"
OUT = "web/public/data/flood_stats.json"
SHEET_FILE = "xl/worksheets/sheet1.xml"  # sheet "DesInventar" (checked in workbook.xml)

M = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# The flood data spells it "Moneragala"; geoBoundaries says "Monaragala".
# An explicit alias is safer than fuzzy matching, which could hide real mismatches.
ALIASES = {"Moneragala": "Monaragala"}


def col_index(ref):
    n = 0
    for ch in re.match(r"[A-Z]+", ref).group():
        n = n * 26 + ord(ch) - 64
    return n - 1


def read_rows(z):
    """Yield each row as {column index: text}. Strings come from sharedStrings."""
    shared = [
        "".join(t.text or "" for t in si.iter(M + "t"))
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(M + "si")
    ]
    for _, el in ET.iterparse(z.open(SHEET_FILE)):
        if el.tag != M + "row":
            continue
        row = {}
        for c in el.findall(M + "c"):
            v = c.find(M + "v")
            if v is not None:
                row[col_index(c.get("r"))] = shared[int(v.text)] if c.get("t") == "s" else v.text
        el.clear()
        yield row


def number(text):
    """Missing or 'NA' counts as 0 for summing; the raw file is untouched."""
    try:
        return float(text)
    except (TypeError, ValueError):
        return 0.0


def main():
    with open(DISTRICTS, encoding="utf-8") as f:
        iso_by_name = {
            ft["properties"]["shapeName"].removesuffix(" District"): ft["properties"]["shapeISO"]
            for ft in json.load(f)["features"]
        }

    z = zipfile.ZipFile(XLSX)
    rows = read_rows(z)
    header = next(rows)
    ci = {name: i for i, name in header.items()}

    # stats[iso][year] = running totals
    stats = defaultdict(lambda: defaultdict(lambda: Counter()))
    unassigned = Counter()
    total = kept = partial_dates = 0

    for r in rows:
        if r.get(ci["Country"]) != "Sri Lanka":
            continue
        total += 1
        raw_date = r[ci["Date"]]
        partial = re.match(r"(\d{4})/", raw_date)
        if partial:
            # Some rows hold text like "2012/00/00": the year is stated, month and day are not.
            year = int(partial.group(1))
            partial_dates += 1
        else:
            # Excel stores dates as days since 1899-12-30.
            year = (date(1899, 12, 30) + timedelta(days=int(float(raw_date)))).year
        name = ALIASES.get(r.get(ci["Adm2"]), r.get(ci["Adm2"]))
        iso = iso_by_name.get(name)
        if iso is None:
            # Held out, not guessed: counted separately so totals stay honest.
            unassigned["events"] += 1
            unassigned["records"] += int(number(r.get(ci["Records"])))
            unassigned["deaths"] += int(number(r.get(ci["Deaths"])))
            unassigned["directly_affected"] += int(number(r.get(ci["Directly affected"])))
            continue
        kept += 1
        s = stats[iso][year]
        s["events"] += 1  # one row = one district-and-date entry
        s["records"] += int(number(r.get(ci["Records"])))  # underlying reports merged into it
        s["deaths"] += int(number(r.get(ci["Deaths"])))
        s["directly_affected"] += int(number(r.get(ci["Directly affected"])))

    all_years = sorted({y for d in stats.values() for y in d})
    out = {
        "meta": {
            "source": "DesInventar (sheet 'DesInventar' of AggregatedFloodData.xlsx, USGS GFID)",
            "event_definition": "events = aggregated district-and-date entries; records = underlying reports merged into them",
            "district_assignment": "by Adm2 name (not by coordinates); 'Moneragala' aliased to geoBoundaries 'Monaragala'",
            "year_range": [all_years[0], all_years[-1]],
            "licence_status": "DesInventar redistribution terms UNRESOLVED; do not publish",
        },
        "unassigned": dict(unassigned),
        "districts": {
            iso: {str(y): dict(v) for y, v in sorted(years.items())}
            for iso, years in sorted(stats.items())
        },
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))

    grand = Counter()
    for years in stats.values():
        for v in years.values():
            grand.update(v)
    print(f"Sri Lanka rows: {total}  assigned to a district: {kept}  unassigned: {dict(unassigned)}")
    print(f"Rows with year-only text dates (year read from text): {partial_dates}")
    print(f"Districts with data: {len(stats)} of {len(iso_by_name)}  years: {all_years[0]}-{all_years[-1]}")
    print(f"Totals (assigned): {dict(grand)}")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
