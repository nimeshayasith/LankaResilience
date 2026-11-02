# LankaResilience

**Understand the Risks. Explore the Impact. Discover the Connections.**

An interactive map of Sri Lanka's 25 districts that shows how often historical flood events were reported in each district, 1974–2020. It is an entry for the AWS Builder Center "put data on a map" weekend challenge.

> **Status: work in progress.** The app runs locally. It is not deployed yet, and there is no live URL. The flood statistics file is deliberately **not** in this repository (see [Data and licences](#data-and-licences)).

## What it does

- District map of Sri Lanka, coloured by the number of historical flood event entries (a choropleth).
- Year range filter (From / To, 1974–2020). Map colours, legend and numbers update together.
- Sri Lanka overview for the selected years: entries, underlying reports, reported deaths, districts with entries, and the top five districts.
- Click a district, or pick it from a list, to see its totals and an entries-per-year bar strip.
- An "About this data" panel with sources, licence status and limitations.

### What the numbers mean

| Term | Meaning |
|---|---|
| **Entry** | One distinct district-and-date record in the source data. This is the main measure used for colours and rankings. |
| **Underlying reports** | The individual reports that were merged into entries. |
| **Reported deaths** | Deaths as recorded in the source. Not verified. |

The source field for "directly affected" people is empty for Sri Lanka, so it is not shown.

## Built with

- React 19 + Vite, plain JavaScript and CSS
- MapLibre GL JS for the map
- **Amazon Location Service** for the base map (Maps style served with an API key restricted by allowed referrers)
- GeoJSON for boundaries; district statistics are joined in the browser

Planned for deployment (not done yet): a private Amazon S3 bucket served through Amazon CloudFront with Origin Access Control, over HTTPS.

## Data and licences

| Data | Source | Status |
|---|---|---|
| Flood events | DesInventar sheet of the [USGS Global Flood Impacts Database (GFID)](https://www.usgs.gov/) | **Redistribution terms unresolved.** USGS describes its GFID metadata as CC0, but the underlying DesInventar data has no confirmed redistribution licence. The processed statistics are therefore **not included in this repository** and must not be published until this is resolved. |
| District boundaries | [geoBoundaries](https://www.geoboundaries.org) Sri Lanka ADM2 (boundary source: OpenStreetMap, Wambacher; year represented 2017) | Open Database License (ODbL) 1.0 per file metadata. Attribution and share-alike obligations are still being assessed. The boundary file is not included here yet. |
| Base map | Amazon Location Service | Provider attribution is shown on the map. |

geoBoundaries: Runfola et al. (2020), PLoS ONE 15(4): e0231866. Contains information from geoBoundaries, which is made available under the [Open Database License](https://opendatacommons.org/licenses/odbl/1-0/).

Full details and open questions: [docs/DATA_SOURCES.md](docs/DATA_SOURCES.md).

## Limitations

- Counts reflect what was **reported**, not flood size, depth or extent. This is **not** a flood-risk map.
- Reporting practice varies by place and over time, so districts and years are not strictly comparable.
- Data is at district level; locations inside a district are not shown.
- Colour classes are recalculated for the selected years, so colours are not comparable between different year ranges.
- One entry has no district in the source and is excluded from all totals. Two entries give only a year.
- This is **not** a real-time warning, emergency dispatch or hospital accessibility system.

## Repository layout

```
web/            React + Vite app (src/, public/, index.html)
scripts/        Data preparation (prepare_flood_stats.py)
docs/           Data sources and licence register
data/           Local raw and processed data (git-ignored)
CLAUDE.md       Project guide used while building with Claude Code
```

## Running it locally

You need Node.js, Python 3 (standard library only) and an Amazon Location API key.

1. **Install and configure the app**
   ```
   cd web
   npm install
   cp .env.example .env
   ```
   Edit `web/.env` and set `VITE_AWS_LOCATION_API_KEY` (and the region if different). Never commit `.env`.
   The key should allow only the map actions and, ideally, only `http://localhost:5173/*` as a referrer.

2. **Provide the data files.** Because of the licence questions above, these are not in the repo:
   - `web/public/data/districts.geojson`: the geoBoundaries Sri Lanka ADM2 simplified file.
   - `web/public/data/flood_stats.json`: generated from `AggregatedFloodData.xlsx` (download it from the official USGS GFID page) by running, from the project root:
     ```
     python -I scripts/prepare_flood_stats.py
     ```
     The script reads the workbook, never modifies it, and prints a summary of what it kept and what it held out.

3. **Start the app**
   ```
   npm run dev
   ```
   Then open http://localhost:5173. Use `npm run build` for a production build.

## Licence

No licence has been chosen yet. Until one is added, all rights are reserved by the author. Data sources keep their own licences, listed above.
