import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function SalaryBarChart({ data, selectedState }) {
  if (!data || data.length === 0) {
    return (
      <div className="chart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-4 4 4 4-8" />
        </svg>
        <p>No hay datos disponibles</p>
      </div>
    )
  }

  const labels = data.map(d => d.state_abbr || d.state.slice(0, 2).toUpperCase())
  const wages = data.map(d => d.a_mean)
  const isSelected = data.map(d => d.state === selectedState)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Annual Mean Wage',
        data: wages,
        backgroundColor: isSelected.map(sel =>
          sel ? 'rgba(245, 158, 11, 0.9)' : 'rgba(59, 130, 246, 0.8)'
        ),
        borderColor: isSelected.map(sel =>
          sel ? 'rgba(217, 119, 6, 1)' : 'rgba(37, 99, 235, 1)'
        ),
        borderWidth: isSelected.map(sel => (sel ? 2 : 0)),
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: isSelected.map(sel =>
          sel ? 'rgba(245, 158, 11, 1)' : 'rgba(37, 99, 235, 0.9)'
        ),
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        titleColor: '#e2e8f0',
        bodyColor: '#f8fafc',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: ctx => data[ctx[0].dataIndex].state,
          label: ctx => '  ' + fmt.format(ctx.parsed.y) + ' / año',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        border: { dash: [4, 4], color: 'transparent' },
        ticks: {
          color: '#64748b',
          font: { size: 12 },
          callback: val => '$' + (val / 1000).toFixed(0) + 'k',
        },
      },
      x: {
        grid: { display: false },
        border: { color: 'rgba(148, 163, 184, 0.3)' },
        ticks: {
          color: ctx => (isSelected[ctx.index] ? '#d97706' : '#475569'),
          font: ctx => ({
            size: 12,
            weight: isSelected[ctx.index] ? '700' : '500',
          }),
        },
      },
    },
  }

  const hasSelectedInTop = data.some(d => d.state === selectedState)

  return (
    <>
      <div className="chart-legend">
        <span className="legend-item">
          <span className="legend-dot blue" />
          Otros estados
        </span>
        <span className="legend-item">
          <span className="legend-dot amber" />
          Estado seleccionado{!hasSelectedInTop && ' (no está en top 10)'}
        </span>
      </div>
      <div className="chart-container">
        <Bar data={chartData} options={options} />
      </div>
    </>
  )
}

export default SalaryBarChart
