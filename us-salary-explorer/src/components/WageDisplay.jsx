import { useState, useEffect, useRef } from 'react'

const fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const AUTO_ADVANCE_MS = 5000
const RESUME_AFTER_MS = 10000

/**
 * Builds a unified list of slide objects from Openverse images (preferred)
 * or a single static fallback image.
 */
function buildSlides(images, staticImage, staticImageAlt, occupation) {
  if (images.length > 0) {
    return images.map(img => ({
      src: img.thumbnail,
      alt: img.title || occupation,
      creator: img.creator || null,
      creatorUrl: img.creatorUrl || null,
      license: img.license || null,
      licenseUrl: img.licenseUrl || null,
    }))
  }
  if (staticImage) {
    return [{ src: staticImage, alt: staticImageAlt || occupation }]
  }
  return []
}

function WageDisplay({
  wage,
  occupation,
  state,
  images = [],
  imageLoading = false,
  staticImage = null,
  staticImageAlt = null,
}) {
  const [current, setCurrent] = useState(0)
  const autoRef = useRef(null)
  const resumeRef = useRef(null)

  const slides = buildSlides(images, staticImage, staticImageAlt, occupation)
  const count = slides.length

  // Reset to first slide whenever the occupation changes
  useEffect(() => {
    setCurrent(0)
  }, [occupation])

  // Auto-advance carousel
  useEffect(() => {
    if (count <= 1) return
    autoRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % count)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(autoRef.current)
  }, [count, occupation])

  /** Navigate manually; pauses auto-advance and resumes after RESUME_AFTER_MS. */
  function goTo(index) {
    clearInterval(autoRef.current)
    clearTimeout(resumeRef.current)
    setCurrent(index)
    if (count > 1) {
      resumeRef.current = setTimeout(() => {
        autoRef.current = setInterval(() => {
          setCurrent(c => (c + 1) % count)
        }, AUTO_ADVANCE_MS)
      }, RESUME_AFTER_MS)
    }
  }

  function prev() { goTo((current - 1 + count) % count) }
  function next() { goTo((current + 1) % count) }

  const showPanel = count > 0 || imageLoading
  const slide = slides[current]

  return (
    <div className="wage-card">
      {showPanel && (
        <div className="wage-image-panel">
          {imageLoading && count === 0 ? (
            <div className="wage-image-skeleton" />
          ) : (
            <>
              {/* All slides rendered; only the active one is visible via CSS opacity */}
              {slides.map((s, i) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt={s.alt}
                  className={`wage-image${i === current ? ' visible' : ''}`}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              ))}

              <div className="wage-image-overlay" />

              {count > 1 && (
                <>
                  <button
                    className="carousel-btn carousel-prev"
                    onClick={prev}
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                  <button
                    className="carousel-btn carousel-next"
                    onClick={next}
                    aria-label="Imagen siguiente"
                  >
                    ›
                  </button>
                  <div className="carousel-dots" role="tablist" aria-label="Imágenes">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        className={`carousel-dot${i === current ? ' active' : ''}`}
                        onClick={() => goTo(i)}
                        role="tab"
                        aria-selected={i === current}
                        aria-label={`Imagen ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* License attribution — always shown when creator info is available */}
              {slide?.creator && (
                <div className="image-attribution">
                  {'Foto: '}
                  {slide.creatorUrl ? (
                    <a href={slide.creatorUrl} target="_blank" rel="noopener noreferrer">
                      {slide.creator}
                    </a>
                  ) : (
                    slide.creator
                  )}
                  {slide.license && (
                    <>
                      {' · '}
                      {slide.licenseUrl ? (
                        <a href={slide.licenseUrl} target="_blank" rel="noopener noreferrer">
                          {slide.license}
                        </a>
                      ) : (
                        slide.license
                      )}
                    </>
                  )}
                  {' · Openverse'}
                </div>
              )}
            </>
          )}
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
