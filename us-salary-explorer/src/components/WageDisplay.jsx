const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function WageDisplay({ wage, occupation, state, image, imageAlt }) {
  return (
    <div className="wage-card">
      {image && (
        <div className="wage-image-panel">
          <img src={image} alt={imageAlt || occupation} className="wage-image" />
          <div className="wage-image-overlay" />
        </div>
      )}
      <div className="wage-content">
        <div className="wage-badge">Annual Mean Wage</div>
        <div className="wage-amount">
          {wage != null ? fmt.format(wage) : <span className="wage-na">N/A</span>}
        </div>
        <div className="wage-meta">
          {occupation && <span className="wage-occupation">{occupation}</span>}
          {occupation && state && <span className="wage-dot" aria-hidden>·</span>}
          {state && <span className="wage-state">{state}</span>}
        </div>
        {wage != null && (
          <div className="wage-hourly">
            ≈ {fmt.format(Math.round(wage / 2080))} / hr (estimado)
          </div>
        )}
      </div>
    </div>
  )
}

export default WageDisplay
