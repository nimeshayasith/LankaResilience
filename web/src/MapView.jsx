import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { colorExpression, districtTotals } from "./floodStats.js";

// MapLibre finds its worker file next to its own code, which breaks once Vite
// bundles it. Point it at the worker explicitly.
maplibregl.setWorkerUrl(workerUrl);

// Read from web/.env. Vite only exposes variables that start with VITE_.
const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;
const REGION = import.meta.env.VITE_AWS_LOCATION_REGION;
const STYLE_NAME = import.meta.env.VITE_AWS_LOCATION_STYLE || "Standard";

// GeoJSON and MapLibre both use [longitude, latitude] order.
const SRI_LANKA_CENTER = [80.7, 7.8];
const INITIAL_ZOOM = 7;

const DISTRICTS_URL = "/data/districts.geojson";
const SOURCE_ID = "districts";

// feature-state lets us flip "hover"/"selected" flags per district without
// rebuilding the geometry. It needs a stable id, so we use the ISO code
// (for example LK-41) as the feature id via promoteId.
const FILL_OPACITY = [
  "case",
  ["boolean", ["feature-state", "selected"], false], 0.9,
  ["boolean", ["feature-state", "hover"], false], 0.85,
  0.7,
];

// geoBoundaries names look like "Jaffna District"; show just "Jaffna".
function toDistrict(feature) {
  const { shapeName, shapeISO } = feature.properties;
  return { id: shapeISO, name: shapeName.replace(/ District$/, "") };
}

export default function MapView({
  selectedId,
  onSelectDistrict,
  onDistrictsLoaded,
  stats,
  breaks,
  range,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const selectedIdRef = useRef(null); // which district currently carries selected=true
  const [error, setError] = useState(null);
  // Layers exist only after the base style and the district file have loaded.
  const [layersReady, setLayersReady] = useState(false);

  // Keep the latest callbacks in refs so changing them never rebuilds the map.
  const onSelectRef = useRef(onSelectDistrict);
  const onDistrictsRef = useRef(onDistrictsLoaded);
  useEffect(() => {
    onSelectRef.current = onSelectDistrict;
    onDistrictsRef.current = onDistrictsLoaded;
  }, [onSelectDistrict, onDistrictsLoaded]);

  const missingConfig = !API_KEY || !REGION;

  useEffect(() => {
    if (missingConfig) return;

    // The style is a JSON file (served by Amazon Location) that tells MapLibre
    // where to get tiles, fonts and icons. The API key travels in the URL.
    const styleUrl = `https://maps.geo.${REGION}.amazonaws.com/v2/styles/${STYLE_NAME}/descriptor?key=${API_KEY}`;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: SRI_LANKA_CENTER,
      zoom: INITIAL_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    let cancelled = false;
    let hoveredId = null;

    const setState = (id, state) => {
      if (id !== null) map.setFeatureState({ source: SOURCE_ID, id }, state);
    };

    map.on("load", async () => {
      let data;
      try {
        const response = await fetch(DISTRICTS_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();
      } catch {
        if (!cancelled) setError("District boundaries could not be loaded.");
        return;
      }
      // The effect may have been cleaned up while we were fetching.
      if (cancelled) return;

      map.addSource(SOURCE_ID, { type: "geojson", data, promoteId: "shapeISO" });

      map.addLayer({
        id: "district-fill",
        type: "fill",
        source: SOURCE_ID,
        paint: { "fill-color": "#0b6e8a", "fill-opacity": FILL_OPACITY },
      });
      map.addLayer({
        id: "district-outline",
        type: "line",
        source: SOURCE_ID,
        paint: { "line-color": "#0b6e8a", "line-width": 1 },
      });
      map.addLayer({
        id: "district-outline-selected",
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#0b6e8a",
          // Only the selected district gets a thick outline.
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false], 3,
            0,
          ],
        },
      });

      map.on("mousemove", "district-fill", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const id = e.features[0]?.id ?? null;
        if (id === hoveredId) return;
        setState(hoveredId, { hover: false });
        hoveredId = id;
        setState(hoveredId, { hover: true });
      });

      map.on("mouseleave", "district-fill", () => {
        map.getCanvas().style.cursor = "";
        setState(hoveredId, { hover: false });
        hoveredId = null;
      });

      // One handler for all clicks: a district selects it, empty map clears it.
      // The selection itself lives in App; the effect below mirrors it on the map.
      map.on("click", (e) => {
        const [feature] = map.queryRenderedFeatures(e.point, {
          layers: ["district-fill"],
        });
        onSelectRef.current?.(feature ? feature.id : null);
      });

      onDistrictsRef.current?.(data.features.map((f) => toDistrict(f)));
      setLayersReady(true);
    });

    // Keep the message generic: error details can include the request URL (and key).
    map.on("error", () => {
      setError(
        "The map could not load. Check the API key, region, allowed referrers and key permissions."
      );
    });

    // React StrictMode runs effects twice in development, so always clean up.
    return () => {
      cancelled = true;
      mapRef.current = null;
      setLayersReady(false);
      map.remove();
    };
  }, [missingConfig]);

  // Choropleth: whenever the stats or year range change, give each district its
  // entry total as feature-state and swap in a colour expression with new breaks.
  useEffect(() => {
    const map = mapRef.current;
    if (!layersReady || !map || !stats || !breaks) return;
    for (const id of Object.keys(stats.districts)) {
      map.setFeatureState(
        { source: SOURCE_ID, id },
        { events: districtTotals(stats, id, range).events }
      );
    }
    map.setPaintProperty("district-fill", "fill-color", colorExpression(breaks));
  }, [layersReady, stats, breaks, range]);

  // Mirror the selection held in App onto the map, so a click on the map and a
  // choice in the dropdown both end up highlighting the same district.
  useEffect(() => {
    const map = mapRef.current;
    if (!layersReady || !map) return;
    if (selectedIdRef.current !== null) {
      map.setFeatureState({ source: SOURCE_ID, id: selectedIdRef.current }, { selected: false });
    }
    selectedIdRef.current = selectedId;
    if (selectedId !== null) {
      map.setFeatureState({ source: SOURCE_ID, id: selectedId }, { selected: true });
    }
  }, [layersReady, selectedId]);

  if (missingConfig) {
    return (
      <p className="map-message">
        Map not configured. Add VITE_AWS_LOCATION_API_KEY and
        VITE_AWS_LOCATION_REGION to web/.env, then restart the dev server.
      </p>
    );
  }

  return (
    <>
      <div ref={containerRef} className="map-container" />
      {error && <p className="map-message">{error}</p>}
    </>
  );
}
