/**
 * useOpenverseImages
 *
 * Fetches up to `count` Creative-Commons-commercial-licensed images from the
 * Openverse API (https://openverse.org) for a given occupation query.
 *
 * Caching strategy: sessionStorage with a 24-hour TTL per query.
 * This keeps the app within the unauthenticated rate limit of 100 req/day
 * because each unique occupation is only fetched once per browser session.
 *
 * License compliance: only `license_type=commercial` results are requested,
 * which covers CC0, CC-BY, CC-BY-SA and similar permissive licenses.
 * Attribution is always surfaced in the UI (see WageDisplay).
 */
import { useState, useEffect } from 'react'

const CACHE_PREFIX = 'ov_'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 h

function cacheRead(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { payload, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return payload
  } catch {
    return null
  }
}

function cacheWrite(key, payload) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ payload, ts: Date.now() })
    )
  } catch {
    // sessionStorage unavailable or quota exceeded — skip caching silently
  }
}

/**
 * @param {string} query  - Occupation title, e.g. "Software Developers"
 * @param {object} opts
 * @param {number} [opts.count=4] - Number of images to fetch (1–10)
 * @returns {{ images: Array, loading: boolean, error: string|null }}
 *
 * Each image object: { id, thumbnail, url, title, creator, creatorUrl, license, licenseUrl }
 */
export function useOpenverseImages(query, { count = 4 } = {}) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query) {
      setImages([])
      return
    }

    const cacheKey = `${query}|${count}`
    const cached = cacheRead(cacheKey)
    if (cached) {
      setImages(cached)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({
      q: query,
      license_type: 'commercial',
      page_size: String(count),
      mature: 'false',
    })

    fetch(`https://api.openverse.org/v1/images/?${params}`, {
      signal: controller.signal,
    })
      .then(res => {
        if (res.status === 429) throw new Error('rate_limit')
        if (!res.ok) throw new Error(`api_${res.status}`)
        return res.json()
      })
      .then(json => {
        const imgs = (json.results || []).map(r => ({
          id: r.id,
          thumbnail: r.thumbnail || r.url,
          url: r.url,
          title: r.title || query,
          creator: r.creator || null,
          creatorUrl: r.creator_url || null,
          license: r.license ? r.license.toUpperCase() : null,
          licenseUrl: r.license_url || null,
        }))
        cacheWrite(cacheKey, imgs)
        setImages(imgs)
        setLoading(false)
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [query, count])

  return { images, loading, error }
}
