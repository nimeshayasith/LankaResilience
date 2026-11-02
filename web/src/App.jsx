import { useEffect, useMemo, useState } from "react";
import MapView from "./MapView.jsx";
import DistrictPanel from "./DistrictPanel.jsx";
import Legend from "./Legend.jsx";
import FilterBar from "./FilterBar.jsx";
import Dashboard from "./Dashboard.jsx";
import AboutPanel from "./AboutPanel.jsx";
import { computeBreaks } from "./floodStats.js";

export default function App() {
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [districts, setDistricts] = useState([]); // [{ id, name }] reported by the map
  // The selection and year range live here so the map, dropdowns and panels agree.
  const [selectedId, setSelectedId] = useState(null);
  const [range, setRange] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/flood_stats.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setStats(data);
        // Default is the full range found in the data (1974-2020).
        setRange({ from: data.meta.year_range[0], to: data.meta.year_range[1] });
      })
      .catch(() => !cancelled && setStatsError("Flood statistics could not be loaded."));
    return () => {
      cancelled = true;
    };
  }, []);

  const names = useMemo(
    () => Object.fromEntries(districts.map((d) => [d.id, d.name])),
    [districts]
  );
  const years = useMemo(() => {
    if (!stats) return [];
    const [first, last] = stats.meta.year_range;
    return Array.from({ length: last - first + 1 }, (_, i) => first + i);
  }, [stats]);
  const breaks = useMemo(
    () => (stats && range ? computeBreaks(stats, range) : null),
    [stats, range]
  );

  const ready = stats && range;
  const selected = selectedId ? { id: selectedId, name: names[selectedId] ?? selectedId } : null;

  return (
    <main className="app">
      <h1>LankaResilience</h1>
      <p className="tagline">
        Understand the Risks. Explore the Impact. Discover the Connections.
      </p>
      {statsError && <p className="map-message">{statsError}</p>}
      {ready && (
        <>
          <FilterBar
            years={years}
            range={range}
            onRangeChange={setRange}
            districts={districts}
            selectedId={selectedId}
            onSelectDistrict={setSelectedId}
          />
          <Dashboard stats={stats} range={range} names={names} />
        </>
      )}
      <MapView
        selectedId={selectedId}
        onSelectDistrict={setSelectedId}
        onDistrictsLoaded={setDistricts}
        stats={stats}
        breaks={breaks}
        range={range}
      />
      {ready && (
        <>
          <Legend breaks={breaks} range={range} />
          <DistrictPanel district={selected} stats={stats} range={range} />
          <AboutPanel unassigned={stats.unassigned} yearRange={stats.meta.year_range} />
        </>
      )}
    </main>
  );
}
