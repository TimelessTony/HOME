export function parseCSV(text) {
  const rows = []
  let cur = ''
  let row = []
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"') { inQuotes = false }
      else { cur += ch }
    } else {
      if (ch === '"') { inQuotes = true }
      else if (ch === ',') { row.push(cur); cur = '' }
      else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = '' }
      else if (ch === '\r') { /* skip */ }
      else { cur += ch }
    }
  }
  if (cur.length || row.length) { row.push(cur); rows.push(row) }
  if (!rows.length) return { headers: [], records: [] }
  const headers = rows.shift().map(h => h.trim())
  const records = rows
    .filter(r => r.some(c => c && c.trim().length))
    .map(r => {
      const obj = {}
      headers.forEach((h, i) => { obj[h] = (r[i] ?? '').trim() })
      return obj
    })
  return { headers, records }
}

export function toCSV(records, columns) {
  const headers = columns || Object.keys(records[0] || {})
  const esc = v => {
    if (v == null) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [headers.join(',')]
  for (const r of records) lines.push(headers.map(h => esc(r[h])).join(','))
  return lines.join('\n')
}

export function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const CONTACT_ALIASES = {
  firstName: ['firstName', 'first name', 'first_name', 'fname', 'given name'],
  lastName: ['lastName', 'last name', 'last_name', 'lname', 'surname', 'family name'],
  email: ['email', 'email address', 'e-mail'],
  phone: ['phone', 'phone number', 'mobile', 'tel'],
  title: ['title', 'job title', 'position'],
  role: ['role', 'contact role', 'type'],
  companyName: ['company', 'company name', 'organization', 'account'],
  notes: ['notes', 'note', 'comments'],
}

const COMPANY_ALIASES = {
  name: ['name', 'company', 'company name', 'organization'],
  industry: ['industry', 'sector'],
  website: ['website', 'url', 'web'],
  phone: ['phone', 'phone number'],
  address: ['address', 'street address', 'location'],
  notes: ['notes', 'comments'],
}

const DEAL_ALIASES = {
  name: ['name', 'deal name', 'project name', 'opportunity'],
  amount: ['amount', 'value', 'contract value', 'deal amount'],
  stage: ['stage', 'pipeline stage', 'status'],
  projectType: ['project type', 'projecttype', 'type of work'],
  projectAddress: ['project address', 'job site', 'site address', 'address'],
  squareFootage: ['square footage', 'sf', 'sqft', 'size'],
  estStartDate: ['est start', 'start date', 'estimated start'],
  estCompletionDate: ['est completion', 'completion date', 'estimated completion'],
  notes: ['notes', 'description'],
}

function matchField(headers, aliases) {
  const lower = headers.map(h => h.toLowerCase())
  for (const a of aliases) {
    const idx = lower.indexOf(a.toLowerCase())
    if (idx !== -1) return headers[idx]
  }
  return null
}

export function mapRecords(records, headers, schema) {
  const map = {}
  for (const key of Object.keys(schema)) {
    map[key] = matchField(headers, schema[key])
  }
  return records.map(r => {
    const out = {}
    for (const key of Object.keys(map)) {
      if (map[key]) out[key] = r[map[key]]
    }
    return out
  })
}

export const SCHEMAS = {
  contacts: CONTACT_ALIASES,
  companies: COMPANY_ALIASES,
  deals: DEAL_ALIASES,
}
