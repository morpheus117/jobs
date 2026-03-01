import { useState, useEffect, useMemo } from 'react'
import { version } from '../package.json'

/**
 * USA Flag — inline SVG with 13 stripes and a star-field canton.
 * Rendered at display size via width/height props; viewBox is 190×100
 * matching the official 19:10 aspect ratio.
 */
function USAFlag({ width = 76, height = 40 }) {
  const stripes = 13
  const sh = 100 / stripes          // stripe height in viewBox units
  const cw = 76                     // canton width  (~40% of 190)
  const ch = sh * 7                 // canton covers first 7 stripes

  // 5-column × 5-row star grid, evenly spaced within the canton
  const cols = [cw / 6, cw * 2 / 6, cw * 3 / 6, cw * 4 / 6, cw * 5 / 6]
  const rows = [ch / 6, ch * 2 / 6, ch * 3 / 6, ch * 4 / 6, ch * 5 / 6]
  const r = 2.6   // star circle radius

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 190 100"
      width={width}
      height={height}
      role="img"
      aria-label="United States flag"
    >
      {/* 13 alternating red/white stripes */}
      {Array.from({ length: stripes }, (_, i) => (
        <rect
          key={i}
          x={0}
          y={i * sh}
          width={190}
          height={sh}
          fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'}
        />
      ))}
      {/* Blue canton */}
      <rect x={0} y={0} width={cw} height={ch} fill="#3C3B6E" />
      {/* Stars (white circles) */}
      {rows.map((sy, ri) =>
        cols.map((sx, ci) => (
          <circle key={`${ri}-${ci}`} cx={sx} cy={sy} r={r} fill="#FFFFFF" />
        ))
      )}
    </svg>
  )
}
import SearchableSelect from './components/SearchableSelect'
import WageDisplay from './components/WageDisplay'
import SalaryBarChart from './components/SalaryBarChart'
import PercentileDistribution from './components/PercentileDistribution'
import EmploymentStats from './components/EmploymentStats'
import IndustryBreakdown from './components/IndustryBreakdown'
import jobImages from './data/jobImages'
import { useOpenverseImages } from './hooks/useOpenverseImages'
import { useOewsState } from './hooks/useOewsState'
import { useBlsOews } from './hooks/useBlsOews'
import './App.css'

// Update OEWS_YEAR each annual BLS release (e.g. 2024 data → '24')
const OEWS_YEAR = '24'
const BLS_EXCEL_URL = `https://www.bls.gov/oes/special.requests/oesm${OEWS_YEAR}nat.xlsx`
const BLS_TABLES_URL = 'https://www.bls.gov/oes/tables.htm'

function App() {
  const [data, setData] = useState([])
  const [occupations, setOccupations] = useState([])
  const [states, setStates] = useState([])
  const [selectedOccupation, setSelectedOccupation] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [currentWage, setCurrentWage] = useState(null)
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Incrementing this re-triggers the salary data fetch (refresh button)
  const [refreshKey, setRefreshKey] = useState(0)

  const { images: ovImages, loading: ovLoading } = useOpenverseImages(selectedOccupation)

  // Derive SOC code from selected occupation title
  const selectedOccCode = useMemo(
    () => data.find(d => d.occ_title === selectedOccupation)?.occ_code ?? null,
    [data, selectedOccupation]
  )

  // OEWS state-level data (percentiles, LQ, employment) — from static JSON
  const {
    stateRankings,
    nonmetroEntries,
    derivedNational,
    getStateData,
  } = useOewsState(selectedOccCode)

  const oewsStateData = getStateData(selectedState)

  // National OEWS data (percentiles, employment, industry breakdown) — from BLS API
  const {
    national: blsNational,
    industries: blsIndustries,
    loading: blsLoading,
    error: blsError,
  } = useBlsOews(selectedOccCode)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${import.meta.env.BASE_URL}salaries.json`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo cargar salaries.json')
        return res.json()
      })
      .then(json => {
        setData(json)
        const uniqueOccs = [...new Set(json.map(d => d.occ_title))].sort()
        const uniqueStates = [...new Set(json.map(d => d.state))].sort()
        setOccupations(uniqueOccs)
        setStates(uniqueStates)
        if (uniqueOccs.length > 0) setSelectedOccupation(uniqueOccs[0])
        if (uniqueStates.length > 0) setSelectedState(uniqueStates[0])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [refreshKey])

  useEffect(() => {
    if (!selectedOccupation || !selectedState || data.length === 0) return

    const entry = data.find(
      d => d.occ_title === selectedOccupation && d.state === selectedState
    )
    setCurrentWage(entry ? entry.a_mean : null)

    const top10 = data
      .filter(d => d.occ_title === selectedOccupation && d.a_mean > 0)
      .sort((a, b) => b.a_mean - a.a_mean)
      .slice(0, 10)
    setChartData(top10)
  }, [selectedOccupation, selectedState, data])

  // Static fallback image — path uses BASE_URL so it works on GitHub Pages (/jobs/)
  const staticImage =
    selectedOccupation && jobImages[selectedOccupation]
      ? `${import.meta.env.BASE_URL}images/jobs/${jobImages[selectedOccupation].file}`
      : null
  const staticImageAlt =
    selectedOccupation && jobImages[selectedOccupation]
      ? jobImages[selectedOccupation].alt
      : null

  if (loading) {
    return (
      <div className="state-screen">
        <div className="spinner" />
        <p>Cargando datos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="state-screen error">
        <p>Error: {error}</p>
        <small>Asegúrate de que <code>public/salaries.json</code> existe.</small>
        <button className="retry-btn" onClick={() => setRefreshKey(k => k + 1)}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <div className="header-flag-wrap">
              <USAFlag width={76} height={40} />
            </div>
            <div className="header-text">
              <h1>US Salary Explorer</h1>
              <p>Occupational wages by state · Bureau of Labor Statistics · OEWS</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="header-badge">BLS · OEWS · v{version}</div>
            <button
              className={`refresh-btn${loading ? ' spinning' : ''}`}
              onClick={() => setRefreshKey(k => k + 1)}
              disabled={loading}
              title="Actualizar datos de salarios"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {/* Controls */}
        <section className="card controls-card">
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label" htmlFor="occupation-select">
                Ocupación
              </label>
              <SearchableSelect
                options={occupations}
                value={selectedOccupation}
                onChange={setSelectedOccupation}
                placeholder="Buscar ocupación..."
              />
            </div>
            <div className="control-group">
              <label className="control-label" htmlFor="state-select">
                Estado
              </label>
              <select
                id="state-select"
                className="native-select"
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
              >
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Wage display with Openverse image carousel */}
        <WageDisplay
          wage={currentWage}
          occupation={selectedOccupation}
          state={selectedState}
          images={ovImages}
          imageLoading={ovLoading}
          staticImage={staticImage}
          staticImageAlt={staticImageAlt}
        />

        {/* Chart */}
        <section className="card chart-card">
          <div className="chart-header">
            <div>
              <h2>Top 10 estados por salario anual</h2>
              <p className="chart-subtitle">{selectedOccupation}</p>
            </div>
            <div className="chart-header-right">
              <span className="chart-count">{chartData.length} estados</span>
              {/* Direct download of the BLS OEWS national Excel file */}
              <a
                href={BLS_EXCEL_URL}
                className="download-btn"
                download
                title="Descargar datos OEWS 2024 (Excel nacional)"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Excel OEWS
              </a>
            </div>
          </div>
          <SalaryBarChart data={chartData} selectedState={selectedState} />
        </section>

        {/* ── Labor Market Insights ──────────────────────────────────────── */}
        <div className="insights-grid">
          {/* Metrics 1 & 7: Wage percentiles + hourly/annual breakdown */}
          <PercentileDistribution
            nationalData={blsNational}
            stateData={oewsStateData}
            stateName={selectedState}
            occupation={selectedOccupation}
            loading={blsLoading}
            error={blsError}
          />

          {/* Metrics 3, 4, 5, 8: Employment, LQ, metro context, state rankings */}
          <EmploymentStats
            stateData={oewsStateData}
            stateRankings={stateRankings}
            nonmetroEntries={nonmetroEntries}
            derivedNational={derivedNational}
            nationalEmp={blsNational?.tot_emp ?? null}
            selectedState={selectedState}
            occupation={selectedOccupation}
          />
        </div>

        {/* Metrics 2 & 6: Industry wages + top employing industries */}
        <IndustryBreakdown
          industries={blsIndustries}
          loading={blsLoading}
          error={blsError}
          occupation={selectedOccupation}
        />
      </main>

      <footer className="footer">
        <p>
          Fuente: Bureau of Labor Statistics,{' '}
          <strong>Occupational Employment and Wage Statistics (OEWS)</strong>.
          Datos de muestra con fines ilustrativos.{' '}
          <a href={BLS_TABLES_URL} target="_blank" rel="noopener noreferrer">
            Ver todos los datos ↗
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
