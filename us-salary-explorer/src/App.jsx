import { useState, useEffect } from 'react'
import SearchableSelect from './components/SearchableSelect'
import WageDisplay from './components/WageDisplay'
import SalaryBarChart from './components/SalaryBarChart'
import jobImages from './data/jobImages'
import './App.css'

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

  useEffect(() => {
    fetch('/salaries.json')
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
  }, [])

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
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-text">
            <h1>US Salary Explorer (OEWS)</h1>
            <p>Explora salarios ocupacionales por estado · Bureau of Labor Statistics</p>
          </div>
          <div className="header-badge">BLS · OEWS</div>
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

        {/* Wage display */}
        <WageDisplay
          wage={currentWage}
          occupation={selectedOccupation}
          state={selectedState}
          image={selectedOccupation && jobImages[selectedOccupation]
            ? `/images/jobs/${jobImages[selectedOccupation].file}`
            : null}
          imageAlt={selectedOccupation && jobImages[selectedOccupation]
            ? jobImages[selectedOccupation].alt
            : null}
        />

        {/* Chart */}
        <section className="card chart-card">
          <div className="chart-header">
            <div>
              <h2>Top 10 estados por salario anual</h2>
              <p className="chart-subtitle">{selectedOccupation}</p>
            </div>
            <span className="chart-count">
              {chartData.length} estados
            </span>
          </div>
          <SalaryBarChart data={chartData} selectedState={selectedState} />
        </section>
      </main>

      <footer className="footer">
        <p>
          Fuente: Bureau of Labor Statistics,{' '}
          <strong>Occupational Employment and Wage Statistics (OEWS)</strong>.
          Datos de muestra con fines ilustrativos.
        </p>
      </footer>
    </div>
  )
}

export default App
