# Data sources, licences and attribution

Status of each dataset. **No dataset marked UNRESOLVED or UNVERIFIED is cleared for public redistribution** (GitHub, S3, public app).
Last updated: 2026-11-02. Nothing here is legal advice.

Legend: CONFIRMED = read in the source text by the assistant; REPORTED = reported by the project owner after reading the official page, not independently checked by the assistant; UNRESOLVED = open question.

## 1. Flood impacts: USGS Global Flood Impacts Database (GFID)
- File: `AggregatedFloodData.xlsx` (downloaded by the project owner from the official USGS release; DOI 10.5066/P135ARGI). Publisher: U.S. Geological Survey. Release dated 2026-10-05.
- Contains records merged from DesInventar, DFO, EM-DAT and HANZE. Each has its own reporting method and may have its own terms.
- Sri Lanka in the `Aggregated` sheet: 1,861 records (DesInventar 1,718; EM-DAT 84; DFO 59), years 1966-2024.
- Known limits: coordinates are approximate representative locations (often district centres; 271 rows at the country centroid), not flood extents; dates are Excel day-numbers.
- **CONFIRMED:** The USGS metadata of the three GFID child items (Aggregated, Original, Geocoded) states: "These data are marked with a Creative Common CC0 1.0 Universal License" and "in the public domain and do not have any use constraints." (data.usgs.gov/datacatalog/metadata/ USGS.69e7e00db66b0164d0f7302d.xml, USGS.69e8dc76b66b0183fe173403.xml, USGS.69e8dc49b66b0183fe17322d.xml)
- **CONFIRMED caveat:** The Original child's metadata says users are responsible for consulting the original data providers' documentation, citation requirements and terms of use.
- **UNRESOLVED:** Third-party source terms are not stated in the USGS metadata, and it is not established whether the CC0 label overrides them. The parent ScienceBase record could not be read (HTTP 403). USGS gives no suggested-citation field; a citation can be built from the metadata (Magers et al., 2026, GFID, USGS data release, https://doi.org/10.5066/P135ARGI) but is not USGS-supplied text.
- Status: **not cleared for public redistribution** until the source-record terms are resolved. Aggregation does not remove source-record requirements.

## 2. EM-DAT (inside GFID)
- **CONFIRMED** terms (doc.emdat.be/docs/legal/terms-of-use/): free access for academic, non-profit and international public organisations after registration; prohibits redistributing EM-DAT or a substantial part, creating derivative databases, and sharing via the Internet to unauthorised users; commercial use needs a paid licence; citation is mandatory.
- **Decision: EM-DAT records and EM-DAT-derived figures are EXCLUDED from the public application.**
- UNRESOLVED: whether the USGS-hosted copy carries the same restrictions.

## 3. DesInventar (inside GFID; planned source of the flood layer)
- Planned use: DesInventar rows only (1,717 with a matching official district name; 1 row has `Adm2` = `NA`, unknown district).
- **REPORTED (project owner):** The official portal states that database contributions belong to their respective contributing organisations.
- **UNRESOLVED:** The redistribution licence for the specific Sri Lankan dataset is unverified. The assistant could not read the DesInventar site (timeouts).
- Status: **not cleared for public redistribution.** Processed flood statistics must not be published until reuse terms are confirmed. Fallback: show the flood layer in the demo video only.

## 4. District boundaries for the public app: geoBoundaries Sri Lanka ADM2
- **CONFIRMED** (API metadata, www.geoboundaries.org/api/current/gbOpen/LKA/ADM2/): licence "Open Data Commons Open Database License 1.0"; source "OpenStreetMap, Wambacher"; year represented 2017; built Dec 2023; 25 units. The geoBoundaries homepage says CC BY 4.0; this conflict is **UNRESOLVED**, so the stricter ODbL reading is used.
- ODbL 1.0 requirements (CONFIRMED from the licence text): attribute public use; a produced work shown publicly needs a notice such as "Contains information from DATABASE NAME, which is made available here under the Open Database License (ODbL)"; a Derivative Database that is publicly used must be offered under ODbL (share-alike), with a machine-readable copy or list of alterations offered free online.
- **Assistant's interpretation, to be assessed:** simplifying the boundaries likely creates a derivative database; a web app that sends the boundary file to browsers likely counts as conveying a copy. Keep boundary geometry in its own file (do not merge flood statistics into it) and join in the browser.
- geoBoundaries asks for a prominent "geoBoundaries" credit with a link and, in written works, citation of Runfola et al. (2020), PLoS ONE 15(4): e0231866.
- Status: **attribution and share-alike obligations still to be assessed**; not cleared.
- **Downloaded and validated (2026-11-02):** file `data/raw/geoboundaries/LKA_ADM2_simplified.geojson` (geoBoundaries' own pre-simplified geometry, unmodified; SHA-256 and details in `data/raw/geoboundaries/PROVENANCE.md`). 25 districts, all vertices inside Sri Lanka's bounding box, no unclosed rings. 24 of 25 names match the flood data after removing " District"; "Monaragala" (geoBoundaries) vs "Moneragala" (flood data) is handled by an explicit alias at processing time, not by editing the file. Interior-point cross-check against SLNSDI district boundaries: 25 of 25 passed.
- **In the app:** byte-identical copy at `web/public/data/districts.geojson` (git-ignored). Used for district outlines, hover and selection only. The app does not yet show the required ODbL/geoBoundaries attribution notice; this must be added before any public deploy.

## 5. District boundaries and hospitals (local development only): SLNSDI
- Publisher: Sri Lanka National Spatial Data Infrastructure. Raw files and provenance in `data/raw/slnsdi/` (see `PROVENANCE.md` there).
- Hospitals: 618 records in nine selected categories (617 with Point geometry); districts: 25 polygons.
- **UNVERIFIED.** The service has no copyright text, and the SLNSDI FAQ says the Geoportal offers both free and commercial layers.
- **Not to be uploaded to GitHub or deployed publicly.** Local use only, subject to applicable permissions. Hospitals are excluded from the public MVP.

## 6. Base map: Amazon Location Service
- Provider attribution shown by the map style must stay visible in the app.
- Region (candidate): ap-south-1 (Mumbai); availability and pricing still to be verified.

## 7. Processing decisions (so far)
- Originals in `data/raw/` are never modified.
- Hospital district: assigned by point-in-polygon into a new field; original `district_name` kept; mismatches flagged (3 found; Kalmunai points fall inside Ampara).
- Hospital with null geometry (Divisional Hospital Mahadowa, id 5734): excluded from maps for now; its attribute coordinates fall inside Badulla.
- Twelve hospital records share six coordinates; all kept and flagged.
- The one flood row with unknown district is kept and excluded from district maps and statistics.
