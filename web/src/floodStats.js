// Helpers for district flood stats (web/public/data/flood_stats.json).
// Shape: { meta, unassigned, districts: { "LK-91": { "1974": { events, records, deaths, ... } } } }
//
// "events" in the data means ENTRIES: distinct district-and-date records.
// "records" means the underlying reports merged into those entries.
// A range is { from, to }, both inclusive years.

// Light to dark, one hue: darker means more entries. Up to five classes.
const COLORS = ["#d6ecf2", "#9fd3e0", "#62b6cd", "#2b8fae", "#0b5f7a"];
// Districts with zero entries get their own neutral colour so "none" is never
// confused with "a few".
export const NO_ENTRIES_COLOR = "#e9e9e9";

const inRange = (year, range) => Number(year) >= range.from && Number(year) <= range.to;

export function districtTotals(stats, id, range) {
  const t = { events: 0, records: 0, deaths: 0 };
  for (const [year, v] of Object.entries(stats.districts[id] ?? {})) {
    if (!inRange(year, range)) continue;
    t.events += v.events;
    t.records += v.records;
    t.deaths += v.deaths;
  }
  return t;
}

// One value per year in the range (zero when a year has no entries), for the bar strip.
export function districtYearSeries(stats, id, range) {
  const years = stats.districts[id] ?? {};
  const series = [];
  for (let year = range.from; year <= range.to; year++) {
    series.push({ year, events: years[year]?.events ?? 0 });
  }
  return series;
}

// Totals across ALL districts for the range, independent of any selection.
export function overallTotals(stats, range) {
  const total = { events: 0, records: 0, deaths: 0, districtsWithEntries: 0 };
  const perDistrict = [];
  for (const id of Object.keys(stats.districts)) {
    const t = districtTotals(stats, id, range);
    total.events += t.events;
    total.records += t.records;
    total.deaths += t.deaths;
    if (t.events > 0) total.districtsWithEntries += 1;
    perDistrict.push({ id, events: t.events });
  }
  return { total, perDistrict };
}

// Top N districts by entries; ties are broken by name so the order is stable.
export function topDistricts(perDistrict, names, n = 5) {
  return perDistrict
    .filter((d) => d.events > 0)
    .sort(
      (a, b) =>
        b.events - a.events || (names[a.id] ?? a.id).localeCompare(names[b.id] ?? b.id)
    )
    .slice(0, n);
}

// Quintile breaks from the districts that HAVE entries in the range, so each
// colour class holds about the same number of districts. Returns the lower
// bound of classes 2..n. Duplicate or useless breaks are dropped because
// MapLibre's "step" needs strictly ascending values.
export function computeBreaks(stats, range) {
  const values = overallTotals(stats, range)
    .perDistrict.map((d) => d.events)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (values.length === 0) return [];
  const raw = [1, 2, 3, 4].map((k) => values[Math.floor((k * values.length) / 5)]);
  return [...new Set(raw)].filter((b) => b > values[0]);
}

// Spread the palette evenly when there are fewer than five classes.
export function classColors(breaks) {
  const n = breaks.length + 1;
  if (n === 1) return [COLORS[2]];
  return Array.from({ length: n }, (_, i) => COLORS[Math.round((i * (COLORS.length - 1)) / (n - 1))]);
}

// MapLibre expression: reads the "events" feature-state of each district.
export function colorExpression(breaks) {
  const colors = classColors(breaks);
  const events = ["coalesce", ["feature-state", "events"], 0];
  const step = ["step", events, colors[0]];
  breaks.forEach((b, i) => step.push(b, colors[i + 1]));
  return ["case", ["==", events, 0], NO_ENTRIES_COLOR, step];
}
