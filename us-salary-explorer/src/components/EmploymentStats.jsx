/**
 * EmploymentStats
 *
 * Metrics 3, 4, 5, 8: Employment Levels, Location Quotient,
 * Metro/Nonmetro Comparison, State Rankings
 *
 * Data source: oews_state.json (BLS OEWS May 2024 state estimates)
 *              National employment from BLS API (passed as nationalEmp prop)
 *
 * Location Quotient interpretation:
 *   LQ > 1.2 → Above-average geographic concentration
 *   LQ 0.8–1.2 → Near national average
 *   LQ 0.5–0.8 → Below-average concentration
 *   LQ < 0.5  → Significantly underrepresented
 *
 * Metro/Nonmetro: When nonmetro balance data is available in the file,
 * it is shown alongside the state mean (which approximates metro wages
 * since most workers in a state are in metropolitan areas).
 *
 * State Rankings: All states sorted by annual mean wage, showing where
 * the selected state ranks. Useful for relocation and employer benchmarking.
 */

const fmtN = new Intl.NumberFormat('en-US')
const fmtC = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

function lqColor(lq) {
  if (lq == null) return '#94a3b8'
  if (lq >= 1.5) return '#16a34a'
  if (lq >= 1.2) return '#22c55e'
  if (lq >= 0.8) return '#f59e0b'
  if (lq >= 0.5) return '#f97316'
  return '#ef4444'
}

function lqLabel(lq) {
  if (lq == null) return 'No data'
  if (lq >= 1.5) return 'Highly concentrated'
  if (lq >= 1.2) return 'Above average'
  if (lq >= 0.8) return 'Near average'
  if (lq >= 0.5) return 'Below average'
  return 'Underrepresented'
}

function LQGauge({ lq }) {
  const color = lqColor(lq)
  const label = lqLabel(lq)
  // Scale LQ 0–3 on a 0–100 bar; LQ=1 is the midpoint at 33%
  const barPct = lq != null ? Math.min(100, (lq / 3) * 100) : 0

  return (
    <div className="lq-gauge">
      <div className="lq-bar-track">
        <div className="lq-bar-fill" style={{ width: `${barPct}%`, background: color }} />
        {/* National average marker at LQ=1 (33.3% of bar) */}
        <div className="lq-avg-line" style={{ left: '33.3%' }} title="LQ = 1.0 (national average)" />
      </div>
      <div className="lq-meta">
        <span className="lq-value" style={{ color }}>
          {lq != null ? lq.toFixed(2) : 'N/A'}
        </span>
        <span className="lq-label" style={{ color }}>{label}</span>
      </div>
    </div>
  )
}

function StateRankRow({ rank, entry, isSelected, total }) {
  const pct = entry.a_mean != null ? Math.min(100, (entry.a_mean / 250000) * 100) : 0
  return (
    <div className={`rank-row${isSelected ? ' rank-row-selected' : ''}`}>
      <span className="rank-num">{rank}</span>
      <span className="rank-state">{entry.state_abbr || entry.name.slice(0, 2).toUpperCase()}</span>
      <div className="rank-bar-track">
        <div className="rank-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="rank-wage">{entry.a_mean != null ? fmtC.format(entry.a_mean) : 'N/A'}</span>
    </div>
  )
}

export default function EmploymentStats({
  stateData,        // data for selected state from oews_state.json
  stateRankings,    // [{name, state_abbr, a_mean, ...}] sorted by a_mean desc
  nonmetroEntries,  // [{name, a_mean, h_mean, ...}]
  derivedNational,  // {tot_emp, a_mean_est} derived from state aggregates
  nationalEmp,      // tot_emp from BLS API (may be null)
  selectedState,
  occupation,
}) {
  const natEmp = nationalEmp ?? derivedNational?.tot_emp
  const stateEmp = stateData?.tot_emp
  const lq = stateData?.loc_quotient
  const jobs1000 = stateData?.jobs_1000

  // Find selected state rank
  const selectedRank = stateRankings.findIndex(r => r.name === selectedState) + 1
  const totalStates = stateRankings.length

  // Top 3 states by LQ (geographic hotspots)
  const topLQ = [...stateRankings]
    .filter(r => r.loc_quotient != null)
    .sort((a, b) => b.loc_quotient - a.loc_quotient)
    .slice(0, 5)

  // Show up to 5 rows around the selected state in rankings
  const selectedIdx = stateRankings.findIndex(r => r.name === selectedState)
  const rankWindow = stateRankings.slice(
    Math.max(0, selectedIdx - 2),
    Math.min(totalStates, selectedIdx + 3)
  )

  return (
    <section className="card metric-card">
      <div className="metric-header">
        <div>
          <h2>Employment & Geography</h2>
          <p className="metric-subtitle">Employment levels · Location quotient · Metro context</p>
        </div>
      </div>

      {/* ── Employment Numbers ──────────────────────────────────── */}
      <div className="emp-grid">
        <div className="emp-stat">
          <span className="emp-stat-val">
            {natEmp != null ? fmtN.format(natEmp) : '—'}
          </span>
          <span className="emp-stat-label">
            National employment
            {derivedNational?.tot_emp && !nationalEmp && <span className="emp-est"> (est.)</span>}
          </span>
        </div>
        <div className="emp-stat">
          <span className="emp-stat-val">
            {stateEmp != null ? fmtN.format(stateEmp) : '—'}
          </span>
          <span className="emp-stat-label">{selectedState} employment</span>
        </div>
        {jobs1000 != null && (
          <div className="emp-stat">
            <span className="emp-stat-val">{jobs1000.toFixed(1)}</span>
            <span className="emp-stat-label">Jobs per 1,000 workers in {selectedState}</span>
          </div>
        )}
      </div>

      {/* ── Location Quotient ───────────────────────────────────── */}
      <div className="metric-section">
        <h3 className="metric-section-title">
          Location Quotient — {selectedState}
          <span className="metric-section-hint">
            Ratio of occupation's employment share vs. national average (1.0 = average)
          </span>
        </h3>
        <LQGauge lq={lq} />
      </div>

      {/* ── Geographic Hotspots (top LQ states) ────────────────── */}
      {topLQ.length > 0 && (
        <div className="metric-section">
          <h3 className="metric-section-title">
            Top States by Concentration
            <span className="metric-section-hint">Location Quotient &gt; 1.0 means above-average concentration</span>
          </h3>
          <div className="lq-list">
            {topLQ.map(s => (
              <div className="lq-list-row" key={s.name}>
                <span className="lq-list-state">{s.state_abbr || s.name.slice(0, 2)}</span>
                <span className="lq-list-name">{s.name}</span>
                <span className="lq-list-lq" style={{ color: lqColor(s.loc_quotient) }}>
                  {s.loc_quotient?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Metro vs Nonmetro ───────────────────────────────────── */}
      {nonmetroEntries.length > 0 && (
        <div className="metric-section">
          <h3 className="metric-section-title">
            Nonmetro Wage Comparison
            <span className="metric-section-hint">
              State mean approximates metro wages; nonmetro shows rural areas
            </span>
          </h3>
          <div className="metro-list">
            {stateData?.a_mean && (
              <div className="metro-row">
                <span className="metro-label">{selectedState} (state avg ≈ metro)</span>
                <span className="metro-wage">{fmtC.format(stateData.a_mean)}</span>
              </div>
            )}
            {nonmetroEntries.slice(0, 3).map(e => (
              <div className="metro-row metro-row-nonmetro" key={e.name}>
                <span className="metro-label">{e.name}</span>
                <span className="metro-wage">{e.a_mean != null ? fmtC.format(e.a_mean) : 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── State Rankings Snapshot (Metric 8) ─────────────────── */}
      {selectedRank > 0 && (
        <div className="metric-section">
          <h3 className="metric-section-title">
            State Wage Ranking
            <span className="metric-section-badge">
              #{selectedRank} of {totalStates} states
            </span>
          </h3>
          <div className="rank-list">
            {selectedIdx > 2 && (
              <>
                {stateRankings.slice(0, 1).map((e, i) => (
                  <StateRankRow key={e.name} rank={i + 1} entry={e} isSelected={e.name === selectedState} />
                ))}
                <div className="rank-ellipsis">···</div>
              </>
            )}
            {rankWindow.map((e, i) => {
              const rank = stateRankings.indexOf(e) + 1
              return <StateRankRow key={e.name} rank={rank} entry={e} isSelected={e.name === selectedState} />
            })}
            {selectedIdx < totalStates - 3 && (
              <>
                <div className="rank-ellipsis">···</div>
                {stateRankings.slice(-1).map((e, i) => (
                  <StateRankRow key={e.name} rank={totalStates} entry={e} isSelected={e.name === selectedState} />
                ))}
              </>
            )}
          </div>
        </div>
      )}

      <p className="metric-attribution">
        Source: <a href="https://www.bls.gov/oes/" target="_blank" rel="noopener noreferrer">BLS OEWS May 2024</a>
        {' '}· State estimates · Employment rounded to nearest 10
      </p>
    </section>
  )
}
