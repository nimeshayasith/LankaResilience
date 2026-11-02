// Attribution, limitations and licence status. Kept plain and complete on purpose:
// the app must not overclaim (see CLAUDE.md section 9).
export default function AboutPanel({ unassigned, yearRange }) {
  return (
    <details className="about">
      <summary>About this data</summary>

      <h3>Flood data</h3>
      <p>
        Historical flood entries come from the DesInventar sheet of the USGS Global Flood
        Impacts Database (GFID), {yearRange[0]}–{yearRange[1]}. Entries are counted per
        district using the district name in the source.
      </p>
      <p>
        <strong>Licence status: unresolved.</strong> USGS describes its GFID metadata as CC0,
        but the redistribution terms for the underlying DesInventar data are not confirmed.
        This build is for local development and demonstration only and must not be published
        or deployed until those terms are confirmed.
      </p>

      <h3>District boundaries</h3>
      <p>
        Contains information from geoBoundaries (boundary source: OpenStreetMap, Wambacher;
        year represented 2017), which is made available under the{" "}
        <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer">
          Open Database License (ODbL) 1.0
        </a>
        . See <a href="https://www.geoboundaries.org" target="_blank" rel="noreferrer">geoBoundaries</a>;
        Runfola et al. (2020), PLoS ONE 15(4): e0231866. The geoBoundaries site also mentions
        CC BY 4.0; the stricter ODbL terms are applied here.
      </p>

      <h3>Base map</h3>
      <p>Base map and data providers are shown in the map&rsquo;s attribution, via Amazon Location Service.</p>

      <h3>Limitations</h3>
      <ul>
        <li>Counts reflect what was reported, not flood size, depth or extent. This is not a flood-risk map.</li>
        <li>Reporting practice varies by place and over time, so districts and years are not strictly comparable.</li>
        <li>Data is at district level. Individual locations inside a district are not shown.</li>
        <li>Reported deaths are as recorded in the source and have not been verified.</li>
        <li>
          The source field for directly affected people is empty for Sri Lanka, so it is not
          shown (it is not zero, it is missing).
        </li>
        <li>
          {unassigned?.events ?? 0} entry has no district in the source, so it is excluded from
          every district and total shown here.
        </li>
        <li>Two entries give only a year, so their year is taken from the text and the month and day are unknown.</li>
        <li>This is not a real-time warning, emergency dispatch or hospital accessibility system.</li>
      </ul>
    </details>
  );
}
