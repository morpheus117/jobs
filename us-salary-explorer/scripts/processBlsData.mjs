/**
 * processBlsData.mjs
 *
 * Pre-processes BLS OEWS May 2024 flat Excel files into compact JSON files
 * consumed by the React app. Run once after updating Excel source files:
 *
 *   node scripts/processBlsData.mjs
 *
 * Input files (repo root, two levels up from this script):
 *   ../../state_M2024_dl.xlsx  – BLS state + nonmetro estimates (required)
 *
 * Outputs (written to ../public/):
 *   oews_state.json  – State-level + nonmetro: percentiles, LQ, employment, wages
 *
 * National data (percentiles, industry breakdown) is fetched at runtime via
 * the BLS Public Data API v2 and cached in sessionStorage.
 *
 * Data vintage: May 2024 (BLS OEWS release March 2025)
 * AREA_TYPE codes: 2 = State, 3 = Nonmetropolitan balance area
 * Source: https://www.bls.gov/oes/tables.htm
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import XLSX from 'xlsx'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT    = resolve(__dir, '../..')       // repo root (where Excel files live)
const PUBLIC  = resolve(__dir, '../public')  // React public dir

// The 15 occupations currently tracked in the app (2018 SOC codes)
const TARGET_OCC_CODES = new Set([
  '11-1021', // General and Operations Managers
  '11-2021', // Marketing Managers
  '13-2011', // Accountants and Auditors
  '13-2051', // Financial Analysts
  '15-1252', // Software Developers
  '17-2141', // Mechanical Engineers
  '23-1011', // Lawyers
  '25-2021', // Elementary School Teachers
  '29-1141', // Registered Nurses
  '29-1299', // Physicians and Surgeons, All Other
  '41-2031', // Retail Salespersons
  '43-4051', // Customer Service Representatives
  '47-2061', // Construction Laborers
  '47-2111', // Electricians
  '53-3032', // Heavy and Tractor-Trailer Truck Drivers
])

/** Parse a BLS wage/employment value; returns null for suppressed/ceiling markers */
function parseVal(v) {
  if (v === undefined || v === null || v === '' || v === '*' || v === '#') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''))
  return isNaN(n) ? null : n
}

/** Extract a clean numeric/null state abbreviation (PRIM_STATE column) */
function extractRow(row) {
  return {
    state_abbr:       String(row.PRIM_STATE || '').trim().substring(0, 2).toUpperCase(),
    tot_emp:          parseVal(row.TOT_EMP),
    jobs_1000:        parseVal(row.JOBS_1000),
    loc_quotient:     parseVal(row.LOC_QUOTIENT),
    h_mean:           parseVal(row.H_MEAN),
    a_mean:           parseVal(row.A_MEAN),
    h_pct10:          parseVal(row.H_PCT10),
    h_pct25:          parseVal(row.H_PCT25),
    h_median:         parseVal(row.H_MEDIAN),
    h_pct75:          parseVal(row.H_PCT75),
    h_pct90:          parseVal(row.H_PCT90),
    a_pct10:          parseVal(row.A_PCT10),
    a_pct25:          parseVal(row.A_PCT25),
    a_median:         parseVal(row.A_MEDIAN),
    a_pct75:          parseVal(row.A_PCT75),
    a_pct90:          parseVal(row.A_PCT90),
    annual_only:      row.ANNUAL === 1 || row.ANNUAL === '1',
    hourly_available: !(row.ANNUAL === 1 || row.ANNUAL === '1'),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Process state_M2024_dl.xlsx → oews_state.json
// ─────────────────────────────────────────────────────────────────────────────
const stateFile = resolve(ROOT, 'state_M2024_dl.xlsx')
if (!existsSync(stateFile)) {
  console.error(`ERROR: ${stateFile} not found.`)
  console.error('Download from: https://www.bls.gov/oes/tables.htm → State estimates')
  process.exit(1)
}

console.log(`Reading ${stateFile}…`)
const wb = XLSX.readFile(stateFile, { raw: true })
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
console.log(`→ ${rows.length.toLocaleString()} total rows`)

// Structure: { [occ_code]: { occ_title, states: { [stateName]: {...} }, nonmetro: { [stateName]: {...} } } }
const result = {}

for (const row of rows) {
  const occCode = String(row.OCC_CODE || '').trim()
  if (!TARGET_OCC_CODES.has(occCode)) continue

  // Only cross-industry (NAICS=000000) and detailed occupation rows
  if (row.NAICS !== '000000') continue
  if (row.O_GROUP !== 'detailed') continue

  // AREA_TYPE: "2" = State, "3" = Nonmetropolitan balance area
  const areaType = String(row.AREA_TYPE).trim()
  if (areaType !== '2' && areaType !== '3') continue

  const areaTitle = String(row.AREA_TITLE || '').trim()
  if (!areaTitle) continue

  if (!result[occCode]) {
    result[occCode] = {
      occ_title: String(row.OCC_TITLE || '').trim(),
      states: {},
      nonmetro: {},
    }
  }

  const data = extractRow(row)

  if (areaType === '2') {
    // State-level data — key by full state name
    result[occCode].states[areaTitle] = data
  } else {
    // Nonmetropolitan balance area — key by state abbreviation for easy lookup
    // AREA_TITLE for nonmetro areas is like "Alabama nonmetropolitan area"
    const stateAbbr = data.state_abbr || areaTitle.split(' ')[0].substring(0, 2).toUpperCase()
    result[occCode].nonmetro[areaTitle] = data
  }
}

const out = {
  vintage: 'May 2024',
  generated: new Date().toISOString().substring(0, 10),
  source: 'Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS)',
  note: 'State-level cross-industry estimates. National and industry data fetched via BLS API.',
  occupations: result,
}

const outPath = resolve(PUBLIC, 'oews_state.json')
writeFileSync(outPath, JSON.stringify(out, null, 0))

const occCount = Object.keys(result).length
const stateRows = Object.values(result).reduce((s, o) => s + Object.keys(o.states).length, 0)
const nonmetroRows = Object.values(result).reduce((s, o) => s + Object.keys(o.nonmetro).length, 0)

console.log(`✓ oews_state.json written:`)
console.log(`  ${occCount} occupations`)
console.log(`  ${stateRows} state rows`)
console.log(`  ${nonmetroRows} nonmetro rows`)
console.log(`  File: ${outPath}`)
