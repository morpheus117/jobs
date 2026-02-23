import { useState, useRef, useEffect } from 'react'

function SearchableSelect({ options, value, onChange, placeholder = 'Search...' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const filtered = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOpen() {
    setIsOpen(true)
    setSearch('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSelect(opt) {
    onChange(opt)
    setIsOpen(false)
    setSearch('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSearch('')
    }
    if (e.key === 'Enter' && filtered.length > 0) {
      handleSelect(filtered[0])
    }
  }

  return (
    <div className="searchable-select" ref={containerRef}>
      <div
        className={`select-display ${isOpen ? 'open' : ''}`}
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && handleOpen()}
      >
        <span className={value ? 'select-value' : 'select-placeholder'}>
          {value || placeholder}
        </span>
        <svg
          className={`chevron ${isOpen ? 'rotated' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && (
        <div className="select-dropdown">
          <div className="select-search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar ocupación..."
              className="select-search"
            />
          </div>
          <ul className="select-options" role="listbox">
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <li
                  key={opt}
                  className={`select-option ${opt === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt)}
                  role="option"
                  aria-selected={opt === value}
                >
                  {opt}
                  {opt === value && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="check-icon">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </li>
              ))
            ) : (
              <li className="select-empty">Sin resultados para &ldquo;{search}&rdquo;</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
