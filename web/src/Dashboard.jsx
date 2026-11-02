import { overallTotals, topDistricts } from "./floodStats.js";

// Sri Lanka-wide numbers for the chosen years. These deliberately ignore the
// selected district, so the overview stays visible while exploring one district.
export default function Dashboard({ stats, range, names }) {
  const { total, perDistrict } = overallTotals(stats, range);
  const top = topDistricts(perDistrict, names);

  return (
    <section className="dashboard" aria-label="Sri Lanka overview">
      <h2>
        Sri Lanka overview, {range.from}–{range.to}
      </h2>
      <dl className="tiles">
        <div>
          <dt>Flood event entries</dt>
          <dd>{total.events.toLocaleString()}</dd>
          <small>Distinct district-and-date records (main measure)</small>
        </div>
        <div>
          <dt>Underlying reports</dt>
          <dd>{total.records.toLocaleString()}</dd>
          <small>Individual reports merged into the entries</small>
        </div>
        <div>
          <dt>Reported deaths</dt>
          <dd>{total.deaths.toLocaleString()}</dd>
          <small>As recorded in the source, not verified</small>
        </div>
        <div>
          <dt>Districts with entries</dt>
          <dd>{total.districtsWithEntries} of 25</dd>
          <small>At least one entry in these years</small>
        </div>
      </dl>
      <h3>Top districts by entries</h3>
      {top.length === 0 ? (
        <p className="muted">No entries in this range.</p>
      ) : (
        <ol className="top-list">
          {top.map((d) => (
            <li key={d.id}>
              <span>{names[d.id] ?? d.id}</span>
              <strong>{d.events}</strong>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
