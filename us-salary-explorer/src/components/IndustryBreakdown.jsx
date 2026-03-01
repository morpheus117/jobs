/**
 * IndustryBreakdown
 *
 * Metrics 2 & 6: Industry-Specific Wage Comparison + Top Employing Industries
 *
 * Data source: BLS Public Data API v2 (national industry-specific OEWS series)
 * Series format: OEUN000000{NAICS6}{OCC6}{DT}
 *   - DT 01 = Employment
 *   - DT 04 = Mean annual wage
 *
 * Covers 12 broad NAICS sectors queried per occupation.
 *
 * Warnings:
 * - Not all occupations are employed in all industries; many sectors return null.
 * - Small industries (<100 workers) are filtered out to avoid unreliable estimates.
 * - Wages vary significantly by industry for the same occupation (e.g., software
 *   developers in tech vs. healthcare vs. government).
 */

const fmtC = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtN = new Intl.NumberFormat('en-US')

// Color palette for industry bars
const BAR_COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#06b6d4', '#f97316',
  '#84cc16', '#a78bfa', '#fb7185', '#34d399',
]

export default function IndustryBreakdown({ industries, loading, error, occupation }) {
  if (loading) {
    return (
      <section className="card metric-card">
        <div className="metric-header">
          <div>
            <h2>Industry Breakdown</h2>
            <p className="metric-subtitle">Top employing industries · Wage by sector</p>
          </div>
        </div>
        <div className="metric-loading"><div className="spinner sm" /> Fetching industry data…</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="card metric-card">
        <div className="metric-header">
          <div>
            <h2>Industry Breakdown</h2>
            <p className="metric-subtitle">Top employing industries · Wage by sector</p>
          </div>
        </div>
        <div className="metric-fallback">
          <span className="metric-fallback-icon">⚠</span>
          <span>Industry data unavailable: {error}</span>
          <a
            href="https://www.bls.gov/oes/current/oessrci.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="fallback-link"
          >View on BLS ↗</a>
        </div>
      </section>
    )
  }

  if (!industries?.length) {
    return (
      <section className="card metric-card">
        <div className="metric-header">
          <div>
            <h2>Industry Breakdown</h2>
            <p className="metric-subtitle">Top employing industries · Wage by sector</p>
          </div>
        </div>
        <p className="pct-unavailable">No industry data available for this occupation.</p>
      </section>
    )
  }

  const maxEmp = Math.max(...industries.map(d => d.tot_emp ?? 0))
  const maxWage = Math.max(...industries.filter(d => d.a_mean != null).map(d => d.a_mean))
  const minWage = Math.min(...industries.filter(d => d.a_mean != null).map(d => d.a_mean))

  return (
    <section className="card metric-card">
      <div className="metric-header">
        <div>
          <h2>Industry Breakdown</h2>
          <p className="metric-subtitle">Top employing industries · Wage comparison by sector · National</p>
        </div>
      </div>

      {/* Two-metric horizontal bar chart */}
      <div className="ind-table">
        <div className="ind-header-row">
          <span className="ind-col-industry">Industry</span>
          <span className="ind-col-emp">Employment</span>
          <span className="ind-col-wage">Mean Annual Wage</span>
        </div>

        {industries.map((ind, i) => {
          const empPct = maxEmp > 0 ? (ind.tot_emp / maxEmp) * 100 : 0
          // Wage bar: map wage to 20–100% range so differences are visible
          const wagePct = maxWage > minWage && ind.a_mean != null
            ? 20 + ((ind.a_mean - minWage) / (maxWage - minWage)) * 80
            : ind.a_mean != null ? 50 : 0
          const color = BAR_COLORS[i % BAR_COLORS.length]

          return (
            <div className="ind-row" key={ind.naics}>
              <span className="ind-col-industry ind-name">{ind.naics_title}</span>

              <div className="ind-col-emp ind-bar-cell">
                <div className="ind-bar-track">
                  <div
                    className="ind-bar-fill"
                    style={{ width: `${empPct}%`, background: color }}
                  />
                </div>
                <span className="ind-bar-label">{fmtN.format(ind.tot_emp)}</span>
              </div>

              <div className="ind-col-wage ind-bar-cell">
                {ind.a_mean != null ? (
                  <>
                    <div className="ind-bar-track">
                      <div
                        className="ind-bar-fill ind-wage-bar"
                        style={{ width: `${wagePct}%`, background: color }}
                      />
                    </div>
                    <span className="ind-bar-label">{fmtC.format(ind.a_mean)}</span>
                  </>
                ) : (
                  <span className="ind-na">N/A</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="metric-attribution">
        Source: <a href="https://www.bls.gov/oes/" target="_blank" rel="noopener noreferrer">BLS OEWS May 2024</a>
        {' '}· National estimates by major NAICS sector · Industries with &lt;100 workers excluded
      </p>
    </section>
  )
}
