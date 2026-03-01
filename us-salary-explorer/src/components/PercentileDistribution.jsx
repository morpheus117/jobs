/**
 * PercentileDistribution
 *
 * Metrics 1 & 7: Wage Distribution Percentiles + Hourly/Annual Breakdown
 *
 * Data source: BLS OEWS (national via API, state via oews_state.json)
 * Shows a visual range bar scaled from P10 to P90 with labeled markers,
 * plus a toggle between annual and hourly views.
 *
 * Methodology note: Percentile wages represent the boundary below which
 * a given percentage of workers earn. P10 = lowest 10%, P90 = top 10%.
 * The "wage ceiling" in BLS data is $115/hr — values at or above this
 * appear as null and are not plotted.
 */
import { useState } from 'react'

const fmtAnnual = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtHourly = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })

function fmt(val, mode) {
  if (val == null) return 'N/A'
  return mode === 'annual' ? fmtAnnual.format(val) : fmtHourly.format(val) + '/hr'
}

/** Compute position (0–100%) of val within [min, max] */
function pct(val, min, max) {
  if (val == null || min == null || max == null || max === min) return null
  return Math.min(100, Math.max(0, ((val - min) / (max - min)) * 100))
}

function PercentileBar({ data, mode }) {
  const { p10, p25, median, mean, p75, p90, hourly_available } = data

  const isHourly = mode === 'hourly'
  const P10  = isHourly ? data.h_pct10   : data.a_pct10
  const P25  = isHourly ? data.h_pct25   : data.a_pct25
  const MED  = isHourly ? data.h_median  : data.a_median
  const MEAN = isHourly ? data.h_mean    : data.a_mean
  const P75  = isHourly ? data.h_pct75   : data.a_pct75
  const P90  = isHourly ? data.h_pct90   : data.a_pct90

  if (!P10 && !P90) {
    return <p className="pct-unavailable">Percentile data not available for this occupation.</p>
  }

  const minVal = P10
  const maxVal = P90
  const pP25  = pct(P25, minVal, maxVal)
  const pMed  = pct(MED, minVal, maxVal)
  const pMean = pct(MEAN, minVal, maxVal)
  const pP75  = pct(P75, minVal, maxVal)

  const markers = [
    { label: 'P10', val: P10, pos: 0,     key: 'p10' },
    { label: 'P25', val: P25, pos: pP25,  key: 'p25' },
    { label: 'Median', val: MED, pos: pMed, key: 'med', highlight: true },
    { label: 'P75', val: P75, pos: pP75,  key: 'p75' },
    { label: 'P90', val: P90, pos: 100,   key: 'p90' },
  ].filter(m => m.val != null && m.pos != null)

  return (
    <div className="pct-bar-wrap">
      {/* Range bar */}
      <div className="pct-track">
        {/* Shaded IQR zone (P25–P75) */}
        {pP25 != null && pP75 != null && (
          <div
            className="pct-iqr"
            style={{ left: `${pP25}%`, width: `${pP75 - pP25}%` }}
          />
        )}
        {/* Mean marker */}
        {pMean != null && (
          <div className="pct-mean-line" style={{ left: `${pMean}%` }}>
            <span className="pct-mean-label">Mean<br />{fmt(MEAN, mode)}</span>
          </div>
        )}
        {/* Median marker */}
        {pMed != null && (
          <div className="pct-median-line" style={{ left: `${pMed}%` }} />
        )}
      </div>

      {/* Labels row */}
      <div className="pct-labels">
        {markers.map(m => (
          <div
            key={m.key}
            className={`pct-label${m.highlight ? ' pct-label-highlight' : ''}`}
            style={{ left: `${m.pos}%` }}
          >
            <span className="pct-label-name">{m.label}</span>
            <span className="pct-label-val">{fmt(m.val, mode)}</span>
          </div>
        ))}
      </div>

      {!hourly_available && !isHourly && (
        <p className="pct-note">* This occupation reports annual wages only (no hourly data).</p>
      )}
    </div>
  )
}

function WageComparison({ stateData, nationalData, mode, stateName }) {
  if (!stateData && !nationalData) return null
  const isHourly = mode === 'hourly'
  const rows = [
    { label: 'National (estimate)', data: nationalData, key: 'nat' },
    { label: stateName || 'Selected state', data: stateData, key: 'st' },
  ].filter(r => r.data)

  const field = isHourly ? 'h_mean' : 'a_mean'
  return (
    <div className="wage-comparison">
      {rows.map(({ label, data, key }) => (
        <div className="wage-comp-row" key={key}>
          <span className="wage-comp-label">{label}</span>
          <span className="wage-comp-val">{fmt(data[field], mode)}</span>
        </div>
      ))}
    </div>
  )
}

export default function PercentileDistribution({ nationalData, stateData, stateName, occupation, loading, error }) {
  const [mode, setMode] = useState('annual')

  // Use national data if available, fall back to state
  const primaryData = nationalData || stateData
  const hourlyOk = primaryData?.hourly_available !== false && primaryData?.h_pct10 != null

  return (
    <section className="card metric-card">
      <div className="metric-header">
        <div>
          <h2>Wage Distribution</h2>
          <p className="metric-subtitle">Percentiles 10th · 25th · Median · 75th · 90th</p>
        </div>
        <div className="metric-actions">
          <div className="toggle-group" role="group" aria-label="Wage view">
            <button
              className={`toggle-btn${mode === 'annual' ? ' active' : ''}`}
              onClick={() => setMode('annual')}
            >Annual</button>
            <button
              className={`toggle-btn${mode === 'hourly' ? ' active' : ''}`}
              onClick={() => setMode('hourly')}
              disabled={!hourlyOk}
              title={!hourlyOk ? 'Hourly wages not available for this occupation' : undefined}
            >Hourly</button>
          </div>
        </div>
      </div>

      {loading && <div className="metric-loading"><div className="spinner sm" /> Fetching national data…</div>}

      {!loading && error && (
        <div className="metric-fallback">
          <span className="metric-fallback-icon">⚠</span>
          <span>BLS API unavailable — showing state-level data only.</span>
          {error.includes('rate') && <span> (Rate limit reached)</span>}
        </div>
      )}

      {primaryData && (
        <>
          <div className="pct-section">
            <span className="pct-source-badge">
              {nationalData ? 'National · BLS OEWS' : `${stateName} · BLS OEWS`}
            </span>
            <PercentileBar data={primaryData} mode={mode} />
          </div>

          <WageComparison
            nationalData={nationalData}
            stateData={stateData}
            mode={mode}
            stateName={stateName}
          />
        </>
      )}

      {!primaryData && !loading && (
        <p className="pct-unavailable">No percentile data available for this occupation.</p>
      )}

      <p className="metric-attribution">
        Source: <a href="https://www.bls.gov/oes/" target="_blank" rel="noopener noreferrer">BLS OEWS May 2024</a>
        {' '}· Shaded area = interquartile range (P25–P75) · Mean line shown separately
      </p>
    </section>
  )
}
