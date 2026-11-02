// Year range and district controls. Options are limited so an invalid range
// (From later than To) cannot be chosen in the first place.
export default function FilterBar({
  years,
  range,
  onRangeChange,
  districts,
  selectedId,
  onSelectDistrict,
}) {
  const fromOptions = years.filter((y) => y <= range.to);
  const toOptions = years.filter((y) => y >= range.from);
  const sorted = [...districts].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="filter-bar">
      <label>
        From
        <select
          value={range.from}
          onChange={(e) => onRangeChange({ ...range, from: Number(e.target.value) })}
        >
          {fromOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>
      <label>
        To
        <select
          value={range.to}
          onChange={(e) => onRangeChange({ ...range, to: Number(e.target.value) })}
        >
          {toOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>
      <label>
        District
        <select
          value={selectedId ?? ""}
          onChange={(e) => onSelectDistrict(e.target.value || null)}
          disabled={districts.length === 0}
        >
          <option value="">All districts (overview)</option>
          {sorted.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </label>
      <button type="button" onClick={() => onSelectDistrict(null)} disabled={!selectedId}>
        Clear district
      </button>
    </div>
  );
}
