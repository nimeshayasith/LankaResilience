import { NO_ENTRIES_COLOR, classColors } from "./floodStats.js";

export default function Legend({ breaks, range }) {
  const colors = classColors(breaks);
  // Class i covers [lower, next lower - 1]; the first starts at 1, the last is open-ended.
  const lowers = [1, ...breaks];
  const label = (i) =>
    i === lowers.length - 1
      ? `${lowers[i]}+`
      : lowers[i + 1] - 1 === lowers[i]
        ? `${lowers[i]}`
        : `${lowers[i]}–${lowers[i + 1] - 1}`;

  return (
    <div className="legend">
      <strong>
        Flood event entries per district, {range.from}–{range.to}
      </strong>
      <ul>
        <li>
          <span className="swatch" style={{ background: NO_ENTRIES_COLOR }} />
          None
        </li>
        {lowers.map((_, i) => (
          <li key={i}>
            <span className="swatch" style={{ background: colors[i] }} />
            {label(i)}
          </li>
        ))}
      </ul>
      <p className="muted">
        Classes are recalculated for the selected years and hold roughly equal numbers of
        districts, so colours are not comparable between different year ranges.
      </p>
    </div>
  );
}
