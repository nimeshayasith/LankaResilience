import { districtTotals, districtYearSeries } from "./floodStats.js";

export default function DistrictPanel({ district, stats, range }) {
  if (!district) {
    return (
      <aside className="district-panel">
        <p className="muted">
          Showing all districts. Click a district on the map, or pick one from the District
          list, to see its details.
        </p>
      </aside>
    );
  }

  const t = districtTotals(stats, district.id, range);
  const series = districtYearSeries(stats, district.id, range);
  const max = Math.max(1, ...series.map((s) => s.events));

  return (
    <aside className="district-panel">
      <h2>{district.name}</h2>
      <p className="muted">
        District code {district.id} · {range.from}–{range.to}
      </p>
      <dl className="stats">
        <dt>Flood event entries</dt>
        <dd>{t.events}</dd>
        <dt>Underlying reports</dt>
        <dd>{t.records}</dd>
        <dt>Reported deaths</dt>
        <dd>{t.deaths}</dd>
      </dl>
      <p className="muted">
        Entries are distinct district-and-date records (used for the map colours). Underlying
        reports are the individual reports merged into them. Deaths are as recorded in the
        source and not verified.
      </p>
      <h3>Entries per year</h3>
      <div
        className="bars"
        role="img"
        aria-label={`Entries per year for ${district.name}, ${range.from} to ${range.to}`}
      >
        {series.map((s) => (
          <span
            key={s.year}
            className="bar"
            style={{ height: `${(s.events / max) * 100}%` }}
            title={`${s.year}: ${s.events}`}
          />
        ))}
      </div>
      <div className="bars-axis muted">
        <span>{range.from}</span>
        <span>tallest bar = {max}</span>
        <span>{range.to}</span>
      </div>
    </aside>
  );
}
