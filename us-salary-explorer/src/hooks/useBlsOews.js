/**
 * useBlsOews
 *
 * Fetches national-level OEWS data from the BLS Public Data API v2.
 * Called on-demand when a user selects an occupation; results are cached
 * in sessionStorage to stay within the 25-requests/day unauthenticated limit.
 *
 * API: https://api.bls.gov/publicAPI/v2/timeseries/data/ (POST, no key required)
 * Rate limit: 25 requests/day, 25 series per request (unauthenticated)
 * Data vintage: most recent annual OES survey (May 2024 as of March 2025)
 *
 * Per occupation, this hook makes up to 2 API requests:
 *   1. National cross-industry: employment + percentiles + mean wages (13 series)
 *   2. Industry breakdown: top 10 NAICS sectors × 2 datatypes = 20 series
 *
 * Returned data powers:
 *   Metric 1 – Wage percentiles (10th, 25th, 75th, 90th)
 *   Metric 2 – Industry-specific wages (by NAICS sector)
 *   Metric 3 – National employment level
 *   Metric 6 – Top employing industries
 *   Metric 7 – Hourly vs annual wage breakdown
 */
import { useState, useEffect } from 'react'

const BLS_API = 'https://api.bls.gov/publicAPI/v2/timeseries/data/'
const CACHE_PREFIX = 'bls_oews_'
const CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours

// National area: N + 0000000 = 8 chars, all-industry: 000000 = 6 chars
// Series prefix for national, cross-industry: "OEUN" + "0000000" + "000000" = 17 chars
const NAT_PREFIX = 'OEUN0000000000000'

// Datatype codes
const DT = {
  employment:  '01',
  h_mean:      '03',
  a_mean:      '04',
  h_pct10:     '06',
  h_pct25:     '07',
  h_median:    '08',
  h_pct75:     '09',
  h_pct90:     '10',
  a_pct10:     '11',
  a_pct25:     '12',
  a_median:    '13',
  a_pct75:     '14',
  a_pct90:     '15',
}

// Top NAICS sectors to query for industry breakdown
// Format in series ID: 6-char code (e.g., sector 54 → "540000")
const NAICS_SECTORS = [
  { code: '110000', title: 'Agriculture, Forestry, Fishing' },
  { code: '230000', title: 'Construction' },
  { code: '320000', title: 'Manufacturing' },
  { code: '420000', title: 'Wholesale Trade' },
  { code: '440000', title: 'Retail Trade' },
  { code: '510000', title: 'Information' },
  { code: '520000', title: 'Finance and Insurance' },
  { code: '540000', title: 'Professional & Technical Services' },
  { code: '610000', title: 'Educational Services' },
  { code: '620000', title: 'Health Care & Social Assistance' },
  { code: '720000', title: 'Accommodation & Food Services' },
  { code: '920000', title: 'Government' },
]

function cacheRead(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(CACHE_PREFIX + key); return null }
    return data
  } catch { return null }
}

function cacheWrite(key, data) {
  try { sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

/** Convert SOC code "15-1252" → 6-char occupation string "151252" */
function socToOcc(soc) { return soc.replace('-', '') }

/** Build a single national, cross-industry series ID */
function natSeries(soc, dt) { return NAT_PREFIX + socToOcc(soc) + dt }

/** Build a national, industry-specific series ID */
function indSeries(soc, naics6, dt) {
  // Format: "OEUN" + "0000000" + naics6 + occ6 + dt = 25 chars
  return 'OEUN0000000' + naics6 + socToOcc(soc) + dt
}

/** Extract the most recent annual value from a BLS series data array */
function latestValue(dataArr) {
  if (!dataArr?.length) return null
  const annual = dataArr.filter(d => d.period === 'A01').sort((a, b) => b.year - a.year)
  const entry = annual[0]
  if (!entry) return null
  const v = parseFloat(entry.value)
  return isNaN(v) ? null : v
}

/** POST request to BLS API; returns parsed Results.series array or throws */
async function blsFetch(seriesIds) {
  const res = await fetch(BLS_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seriesid: seriesIds, startyear: '2024', endyear: '2024' }),
  })
  if (!res.ok) throw new Error(`BLS API HTTP ${res.status}`)
  const json = await res.json()
  if (json.status !== 'REQUEST_SUCCEEDED') throw new Error(json.message?.[0] || 'BLS API error')
  return json.Results?.series ?? []
}

/** Build an index from seriesID → latest value */
function indexSeries(seriesArr) {
  const idx = {}
  for (const s of seriesArr) idx[s.seriesID] = latestValue(s.data)
  return idx
}

export function useBlsOews(occCode) {
  const [national, setNational] = useState(null)
  const [industries, setIndustries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!occCode) return
    const cacheKey = occCode
    const cached = cacheRead(cacheKey)
    if (cached) { setNational(cached.national); setIndustries(cached.industries); return }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchAll() {
      // ── Request 1: national cross-industry data ──────────────────────────
      const natSeriesIds = Object.entries(DT).map(([, dt]) => natSeries(occCode, dt))
      const natRaw = await blsFetch(natSeriesIds)
      const natIdx = indexSeries(natRaw)

      const national = {
        tot_emp:   natIdx[natSeries(occCode, DT.employment)],
        h_mean:    natIdx[natSeries(occCode, DT.h_mean)],
        a_mean:    natIdx[natSeries(occCode, DT.a_mean)],
        h_pct10:   natIdx[natSeries(occCode, DT.h_pct10)],
        h_pct25:   natIdx[natSeries(occCode, DT.h_pct25)],
        h_median:  natIdx[natSeries(occCode, DT.h_median)],
        h_pct75:   natIdx[natSeries(occCode, DT.h_pct75)],
        h_pct90:   natIdx[natSeries(occCode, DT.h_pct90)],
        a_pct10:   natIdx[natSeries(occCode, DT.a_pct10)],
        a_pct25:   natIdx[natSeries(occCode, DT.a_pct25)],
        a_median:  natIdx[natSeries(occCode, DT.a_median)],
        a_pct75:   natIdx[natSeries(occCode, DT.a_pct75)],
        a_pct90:   natIdx[natSeries(occCode, DT.a_pct90)],
      }

      // ── Industry breakdown ────────────────────────────────────────────────
      // NOTE: National × industry × occupation series do not exist in the BLS
      // public API v2 (all return "Series does not exist"). Industry breakdown
      // data must be sourced from the offline national flat file (oewsnat.xlsx)
      // processed into oews_national.json. Until that data is available, the
      // industry breakdown section shows the "no data" empty state.
      const industries = []

      return { national, industries }
    }

    fetchAll()
      .then(({ national, industries }) => {
        if (cancelled) return
        cacheWrite(cacheKey, { national, industries })
        setNational(national)
        setIndustries(industries)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [occCode])

  return { national, industries, loading, error }
}
