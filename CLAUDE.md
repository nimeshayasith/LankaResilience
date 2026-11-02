# CLAUDE.md — LankaResilience

Project guide for Claude Code. Read this fully at the start of every session.

## 1. What we are building

**LankaResilience**: an interactive map of Sri Lanka that combines historical flood events with hospital locations, so people can see how disaster history relates to essential services.

Tagline: *See the risks. Discover the impact. Find the essential services.*

This is an entry for the **AWS Builder Center "put data on a map" weekend challenge**. Goal: win a top-5 prize AND learn properly along the way.

**Deadline: Monday Nov 2, 2026, 1:00 PM PT = Tuesday Nov 3, 2026, 2:30 AM Sri Lanka time.** Aim to finish submission at least 3 hours early.

## 2. About the developer (Nimesha)

- Final-year Computer Engineering student, University of Ruhuna. AWS Solutions Architect Associate certified.
- Comfortable with React/Vite, AWS, Terraform, GitHub Actions, Docker.
- New to geospatial work (MapLibre, GeoJSON, Turf.js, Amazon Location Service). Explain those more carefully.
- Prefers **short, plain-English** answers and **complete, working, ready-to-use output** (full files, not fragments).

## 3. Golden rules for how you work

### Rule 1: ASK BEFORE DECIDING
Do not make decisions silently. Before choosing any of these, stop and ask Nimesha:
- Which dataset, filter, or data field to use
- Which library, framework, or AWS service to add or swap
- Architecture changes, folder structure changes, new features, dropping features
- Anything that costs money, creates AWS resources, or is hard to undo
- Anything that changes the project story or scope

Ask with 2–4 clear options, say which you recommend and why (one line each), then wait for the answer. Small, obvious, reversible things (variable names, formatting) do not need a question.

### Rule 2: EXPLAIN FIRST, THEN DO
Before each technical step, give a 2–4 sentence plain-English explanation: what we are about to do, why, and what Nimesha will learn from it. Then do it. Do not dump code with no context.

### Rule 3: TEACH AS WE GO
Nimesha wants to learn, not just receive code. After each milestone, give a short "what just happened" summary and name the concepts used (for example: GeoJSON, clustering, haversine distance, API key vs Cognito auth). Keep it brief.

### Rule 4: NEVER FAKE DATA
Every point on the map must come from a real, traceable source. No invented coordinates, no placeholder numbers in the final app. If data is missing or thin, say so and ask what to do.

### Rule 5: TIME IS TIGHT
Build the smallest thing that works end to end first, then improve. Always keep a working, deployable version. Warn Nimesha early if something is eating time. Prefer 5 features that work well over 10 that are half done.

### Rule 6: HONEST CLAIMS
Do not overclaim in the app or the write-up. See "Data limitations" below.

## 4. Judging criteria (everything we do should serve these)

| Criterion | Weight | What we must show |
|---|---|---|
| Technical innovation and originality | 25% | Two independent datasets combined, clustering, nearest-facility analysis |
| Craft and execution | 25% | Live, reliable, responsive, interactive map |
| Usefulness and impact | 25% | Real problem, real insights, reusable pattern |
| Creativity and storytelling | 25% | Strong name, clear story, compelling under-3-minute demo |

**Entry requirements (must pass first, or score does not matter):**
1. Previously unpublished project
2. Real dataset, with name, description and source link
3. Amazon Location Service used and explained (how and why)
4. At least one more AWS service in the app or pipeline
5. Live map URL (or shown running in the demo)
6. Public demo video under 3 minutes, link placed in the **"demo" field**
7. Public GitHub repo (optional but strongly encouraged)
8. Write-up that covers all four criteria

## 5. Data plan

| Dataset | Use | Source |
|---|---|---|
| USGS Global Flood Impacts Database (GFID) | Historical flood events: date, coordinates, fatalities, affected population | data.gov / USGS |
| SLNSDI Health GIS (hospitals) | Hospital names and locations | `gisapps.nsdi.gov.lk/server/rest/services/SLNSDI/Health/MapServer` |
| Sri Lanka admin boundaries (optional) | District filtering | To be decided with Nimesha |

**First task of the project (first hour): validate the data.**
- Filter GFID to Sri Lanka. Count the records. Check for missing coordinates, dates, impact fields.
- Query the SLNSDI service as GeoJSON. Count hospitals. Check for missing names or bad coordinates.
- Check reuse and attribution terms for both sources and record them in the README.
- Report findings to Nimesha and **ask** whether to continue with LankaResilience or switch to the fallback.

**Fallback: LankaAccess** (Essential Services Accessibility Explorer). Uses SLNSDI hospitals and educational institutions, calculates nearest-facility distances, and highlights gaps in mapped coverage. Switch only if Sri Lanka flood data is too thin, and only after asking.

## 6. Planned features (build in this order)

1. **Base map**: Amazon Location Service + MapLibre GL JS, working and authenticated.
2. **Flood event layer**: clustered markers, click for details (date, fatalities, affected people, source).
3. **Hospital layer**: toggleable markers with name and location.
4. **Nearest hospitals**: click a flood event, show the 3 nearest hospitals with straight-line distance (Turf.js).
5. **Dashboard**: totals for events, fatalities, affected population, hospital count, with a year filter that updates the numbers live.
6. **Provenance**: every popup shows data source and fields, so users can trace it.
7. **Polish**: responsive layout, loading and error states, clear legend, about panel.

Optional only if time remains: district boundaries, Lambda + API Gateway for processing. Do not add them unless they solve a real problem, and ask first.

## 7. Architecture

```
React + Vite (frontend)
   |
   +-- Amazon Location Service  -> map tiles via MapLibre GL JS
   +-- Amazon S3                -> processed GeoJSON + built frontend
   +-- Amazon CloudFront        -> HTTPS delivery of the app
   +-- (optional) Lambda + API Gateway -> server-side processing
```

- Spatial analysis runs in the browser with **Turf.js**.
- Data is prepared offline by scripts (Node or Python) into small GeoJSON files, then uploaded to S3.
- Be ready to explain **why** each service is used. This goes into the write-up.

**Open decisions to ask Nimesha about (do not decide alone):**
- Location Service auth: API key vs Cognito identity pool (recommend API key for simplicity; restrict it by allowed referrer and allowed actions)
- Infrastructure: manual console setup vs Terraform (Terraform is a good learning and README story, but costs time)
- Hosting region and S3 bucket naming
- TypeScript vs JavaScript
- Styling approach (Tailwind or plain CSS)

## 8. Security and cost rules

- **Never commit secrets.** No AWS keys, no API keys in git. Use `.env` (gitignored) and provide `.env.example`.
- Restrict the Location Service API key to the deployed domain and the map actions only.
- S3 bucket stays private; CloudFront serves it (use Origin Access Control).
- Before creating any AWS resource, tell Nimesha what it is and roughly what it costs, then ask. Remind him to clean up resources after the challenge if he does not want them to keep running.
- Never use personal or sensitive data. Only public, reusable datasets.

## 9. Data limitations (must appear in the app and the write-up)

- Flood coordinates are **representative reported locations**, not exact flood boundaries. Show them as "historical event markers", not "flood-risk zones".
- Distances are **straight-line**, not road or travel distance.
- This is **not** a real-time warning, emergency dispatch, or hospital accessibility system.
- Do not claim the nearest hospital is reachable during a flood.

## 10. Code and repo conventions

- Keep the repo simple and readable:
  ```
  /data        raw + processed GeoJSON, with a README on sources
  /scripts     data preparation scripts
  /src         React app
  /docs        architecture diagram, screenshots
  README.md    required, see section 12
  CLAUDE.md    this file
  ```
- Commit small and often, with clear messages. Ask before force-pushing or rewriting history.
- Write comments that explain **why**, not only what.
- Handle errors visibly (failed data load, map load failure, no results). A broken map ruins the Craft score.
- Test on desktop and a phone-width viewport before deploying.
- Verify things actually run (build, lint, load the page) before saying something is done.

## 11. Work plan (hours from start; adjust with Nimesha)

| Phase | Time | Output |
|---|---|---|
| 1. Data prep and validation | ~2h | Two validated GeoJSON files, source notes |
| 2. App build | ~6–8h | Working interactive app locally |
| 3. AWS deploy | ~2–3h | Live HTTPS URL, tested on desktop and mobile |
| 4. Submission | ~3–4h | Repo, README, video, write-up, submitted |
| Buffer | ~3h+ | For deployment surprises |

Do the deploy early (even with a rough app), then keep redeploying. Do not leave first deployment until the end.

## 12. Submission checklist

Track these and remind Nimesha of what is left.

- [ ] Previously unpublished project
- [ ] Dataset names, descriptions, source links, attribution
- [ ] Explanation of the geospatial processing
- [ ] Amazon Location Service clearly identified, with why
- [ ] Other AWS services and their roles explained
- [ ] Live public URL works (test in a private window and on mobile)
- [ ] Public GitHub repo
- [ ] README: overview, architecture diagram, setup steps, data attribution, limitations
- [ ] Demo video under 3 minutes, public (YouTube/Vimeo), shows the live map
- [ ] Video link in the **"demo" field**
- [ ] Description addresses all four judging criteria explicitly
- [ ] Submitted well before the deadline

**Demo story (aim for about 2:30):**
1. The problem: disaster data and essential services are disconnected.
2. Open the live map, show flood events and clusters.
3. Select an event, show its reported impact.
4. Reveal the 3 nearest hospitals and distances.
5. Change the year filter, watch the dashboard update.
6. Show a provenance popup, then the architecture in one sentence, then the limitations.

## 13. Step-by-step playbook

Follow these in order. For every step: **explain first (plain English), ask if there is a decision, do it, verify it, then tell Nimesha what was learned.** Steps marked **ASK** need Nimesha's answer before going on. Always check the current official docs before using any AWS API, because Amazon Location Service has changed its map APIs recently (older "map resources" vs newer Maps v2 with style names). Do not rely on memory for exact action names or URLs.

### Step 0: Project setup (15 min)
1. **ASK:** TypeScript or JavaScript? Styling: Tailwind or plain CSS? Terraform or console clicks?
2. Create the project: `npm create vite@latest lankaresilience -- --template react` (or `react-ts`).
3. `cd lankaresilience && npm install`, then `npm install maplibre-gl @turf/turf`.
4. Create the folders: `data/raw`, `data/processed`, `scripts`, `docs`.
5. `git init`, add `.gitignore` (include `.env`, `node_modules`, `dist`, `data/raw` if large), create `.env.example`, make the first commit.
6. Verify: `npm run dev` opens the default page.
7. Create the public GitHub repo and push. **ASK** the repo name and license (MIT is a common choice).

**Learned:** Vite scaffolding, why `.env` stays out of git.

### Step 1: Get and validate the flood data (45 min)
1. Open the USGS GFID page on data.gov, find the download links, and **ask Nimesha** before downloading (state filename, source, size).
2. Save the file in `data/raw/`. Do not edit raw files; always work on copies.
3. Write `scripts/prepare_floods.py` (or `.mjs`) that:
   - loads the table,
   - keeps only rows where the country is Sri Lanka,
   - drops rows with missing or zero coordinates,
   - keeps useful fields (event date/year, latitude, longitude, fatalities, affected population, source/event id),
   - writes `data/processed/floods.geojson` (Point features).
4. Print a summary: total rows, rows kept, year range, count with fatalities, count with affected population.
5. **ASK:** show Nimesha the numbers. If there are only a handful of records, discuss the LankaAccess fallback before going further.

**Learned:** what GeoJSON is (`[longitude, latitude]` order, not lat/long), why we filter and validate.

### Step 2: Get and validate the hospital data (45 min)
1. Open the SLNSDI Health MapServer page in the browser and find the **hospital layer ID** (list layers first, do not guess).
2. Query it as GeoJSON using the ArcGIS REST pattern:
   `.../MapServer/<layerId>/query?where=1%3D1&outFields=*&f=geojson`
3. If the service caps results per request, page through with `resultOffset` and `resultRecordCount` until all records are collected.
4. Write `scripts/prepare_hospitals.py` that keeps only name, type/category (if present), district (if present), and coordinates, removes duplicates and bad coordinates, and writes `data/processed/hospitals.geojson`.
5. Check that all points fall inside Sri Lanka (roughly lat 5.9 to 9.9, lon 79.5 to 82.0).
6. Record the reuse and attribution terms in `data/README.md`. **ASK** Nimesha if the terms are unclear.

**Learned:** REST query parameters, pagination, coordinate sanity checks.

### Step 3: Set up Amazon Location Service (30 min)
1. **ASK:** AWS region (Singapore `ap-southeast-1` or Mumbai `ap-south-1` are the nearest options if Location Service is available there; confirm in docs) and which map style to use (for example Standard or Monochrome; Monochrome makes colored data stand out).
2. In the AWS console, open Amazon Location Service and create an **API key** for maps. Allow only the map actions needed to render tiles, styles, sprites and glyphs (look up the exact action names in the docs).
3. Restrict the key to allowed **referrers** (`http://localhost:5173/*` for now; add the CloudFront domain later).
4. Put the key, region and style name in `.env` as `VITE_LOCATION_API_KEY`, `VITE_AWS_REGION`, `VITE_MAP_STYLE`.
5. **ASK** before creating the key: explain what it is and that Location Service has a small free tier but is pay-per-use after that.

**Learned:** API key auth vs Cognito, least privilege, referrer restriction.

### Step 4: Render the base map (45 min)
1. Create `src/components/Map.jsx`. Initialise MapLibre with the style descriptor URL from the docs, pointing at Sri Lanka (center about `[80.7, 7.9]`, zoom about 7).
2. Add zoom and navigation controls.
3. Verify in the browser: the map loads, pans, zooms, and there are no 401/403 errors in the console.
4. Commit.

**Learned:** how MapLibre uses a style URL, how Location Service plugs into it.

### Step 5: Add the flood layer with clustering (1 to 1.5 h)
1. Copy `floods.geojson` into `public/data/`.
2. Add it as a GeoJSON source with `cluster: true`, plus layers for cluster circles, cluster count labels and individual points.
3. Click a cluster to zoom in; click a point to open a popup with date, fatalities, affected population and **source**.
4. Show loading and error messages if the file fails to load.
5. Verify, then commit.

**Learned:** clustering, sources vs layers in MapLibre, popups.

### Step 6: Add the hospital layer and layer toggles (1 h)
1. Add `hospitals.geojson` as a second source, with a distinct icon or color.
2. Build a small control panel with toggles for floods, clusters and hospitals.
3. Popup shows hospital name and source.
4. Add a legend.

**Learned:** managing multiple layers, layer visibility.

### Step 7: Nearest-hospital analysis (1.5 h)
1. When a flood point is selected, use Turf.js (`turf.distance`) to compute the distance from that event to every hospital.
2. Sort and take the nearest 3.
3. Draw lines from the event to those hospitals, and list names and distances (km) in a side panel.
4. Add the note: "Straight-line distance, not travel distance."
5. **ASK** whether to also add a "show hospitals within X km" radius.
6. Test with several events, including ones near the coast, in the hills and in the north.

**Learned:** haversine/great-circle distance, why straight-line is not road distance.

### Step 8: Dashboard and year filter (1.5 h)
1. Add a year range slider (or dropdown).
2. Filter the flood layer using a MapLibre filter expression and recompute the totals: events, fatalities, affected population, hospital count.
3. Make numbers update live; add small charts only if time allows (**ASK** first).
4. Add an "About this data" panel: sources, dates, limitations (Section 9).

**Learned:** map filters, derived statistics, keeping UI and map in sync.

### Step 9: Polish and reliability (1.5 h)
1. Make the layout responsive (side panel becomes a bottom sheet on phones).
2. Add loading spinner, error states and empty states.
3. Add a project title, tagline and a short onboarding hint.
4. Check performance, accessibility basics (contrast, labels) and browser console for errors.
5. Run `npm run build` and `npm run preview`; fix any problems.

### Step 10: Deploy to AWS (1.5 to 2 h)
1. **ASK:** confirm region, bucket name, and manual vs Terraform. Explain costs.
2. Create a **private** S3 bucket (block all public access).
3. Run `npm run build`, upload `dist/` contents to the bucket (`aws s3 sync dist/ s3://<bucket> --delete`). Data files in `public/data/` are included in `dist/`.
4. Create a CloudFront distribution: S3 as origin with **Origin Access Control**, apply the bucket policy CloudFront suggests, default root object `index.html`, viewer protocol redirect to HTTPS.
5. Add custom error responses so 403/404 return `/index.html` with status 200.
6. Add the CloudFront domain (`https://dxxxx.cloudfront.net/*`) to the Location API key's allowed referrers.
7. Test the live URL on desktop, on a phone, and in a private window.
8. Create an invalidation after each redeploy: `aws cloudfront create-invalidation --distribution-id <id> --paths "/*"`.
9. Optional: a small GitHub Actions workflow that builds, syncs to S3 and invalidates CloudFront. **ASK** first; good for the learning story but only if time allows.

**Learned:** private S3 + CloudFront OAC pattern, SPA error handling, cache invalidation.

### Step 11: README and architecture diagram (1 h)
README sections: overview, screenshots, live link, features, datasets (with links and attribution), how the geospatial processing works, AWS architecture (and why each service), setup and run instructions, deploy instructions, limitations, license. Add a simple architecture diagram in `docs/`.

### Step 12: Demo video (45 min)
1. Follow the demo story in Section 12 (under 3 minutes; rehearse once, record, trim).
2. Record the live URL, not localhost.
3. Upload to YouTube or Vimeo as **public**; test the link while logged out.

### Step 13: Write-up and submit (1 h)
1. Draft the project description with clear headings: dataset, how it is put on the map, Amazon Location Service and why, other AWS services, and one paragraph for each of the four judging criteria.
2. Include live URL, GitHub link, and the video link in the **demo** field.
3. Walk through the Section 12 checklist with Nimesha item by item.
4. Submit, then confirm the submission page shows everything correctly.

### After submission
Ask Nimesha whether to keep or tear down AWS resources to avoid charges.

## 14. When you are unsure

Stop and ask. A quick question costs seconds. A wrong silent decision can cost hours we do not have.
