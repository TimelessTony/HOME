import { useState } from 'react'
import Modal from './Modal'
import { parseCSV, mapRecords, SCHEMAS } from '../csv'
import { contacts, companies, deals, useStore } from '../store'

const ENTITY_LABELS = {
  contacts: 'Contacts',
  companies: 'Companies',
  deals: 'Deals',
}

export default function ImportCsvDialog({ onClose, defaultEntity = 'contacts' }) {
  const state = useStore()
  const [entity, setEntity] = useState(defaultEntity)
  const [rawText, setRawText] = useState('')
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setRawText(text)
    runParse(text, entity)
  }

  const runParse = (text, ent) => {
    setError('')
    try {
      const { headers, records } = parseCSV(text)
      if (!records.length) {
        setError('No data rows found.')
        setPreview(null)
        return
      }
      const mapped = mapRecords(records, headers, SCHEMAS[ent])
      setPreview({ headers, mapped, count: records.length })
    } catch (e) {
      setError(String(e.message || e))
      setPreview(null)
    }
  }

  const onEntityChange = (ent) => {
    setEntity(ent)
    if (rawText) runParse(rawText, ent)
  }

  const doImport = () => {
    if (!preview?.mapped?.length) return
    if (entity === 'contacts') {
      const records = preview.mapped.map(r => {
        let companyId
        if (r.companyName) {
          const existing = state.companies.find(
            c => c.name.toLowerCase() === r.companyName.toLowerCase()
          )
          companyId = existing
            ? existing.id
            : companies.add({ name: r.companyName, ownerId: state.settings.currentUserId })
        }
        return {
          firstName: r.firstName || '',
          lastName: r.lastName || '',
          email: r.email || '',
          phone: r.phone || '',
          title: r.title || '',
          role: r.role || '',
          companyId,
          notes: r.notes || '',
          ownerId: state.settings.currentUserId,
        }
      })
      contacts.bulkAdd(records)
    } else if (entity === 'companies') {
      companies.bulkAdd(
        preview.mapped.map(r => ({
          name: r.name || '',
          industry: r.industry || '',
          website: r.website || '',
          phone: r.phone || '',
          address: r.address || '',
          notes: r.notes || '',
          ownerId: state.settings.currentUserId,
        }))
      )
    } else if (entity === 'deals') {
      deals.bulkAdd(
        preview.mapped.map(r => ({
          name: r.name || 'Untitled Deal',
          amount: parseFloat(r.amount) || 0,
          stage: r.stage || state.pipeline[0].id,
          projectType: r.projectType || '',
          projectAddress: r.projectAddress || '',
          squareFootage: r.squareFootage || '',
          estStartDate: r.estStartDate || '',
          estCompletionDate: r.estCompletionDate || '',
          notes: r.notes || '',
          ownerId: state.settings.currentUserId,
        }))
      )
    }
    onClose()
  }

  return (
    <Modal
      title="Import CSV"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn" disabled={!preview?.mapped?.length} onClick={doImport}>
            Import {preview?.mapped?.length || 0} records
          </button>
        </>
      }
    >
      <div className="crm-field">
        <label>Importing as</label>
        <select value={entity} onChange={e => onEntityChange(e.target.value)}>
          {Object.entries(ENTITY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <div className="crm-field">
        <label>CSV file</label>
        <input type="file" accept=".csv,text/csv" onChange={handleFile} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--crm-text-muted)', marginBottom: 12 }}>
        Headers are auto-matched. Supported columns for{' '}
        <strong>{ENTITY_LABELS[entity]}</strong>:{' '}
        {Object.keys(SCHEMAS[entity]).join(', ')}.
      </div>
      {error && (
        <div style={{ color: 'var(--crm-danger)', marginBottom: 12 }}>{error}</div>
      )}
      {preview && (
        <div style={{ border: '1px solid var(--crm-border)', borderRadius: 6, padding: 12, background: '#FAFBFC', fontSize: 12 }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            Preview ({preview.count} rows detected, first 5 mapped):
          </div>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
            {JSON.stringify(preview.mapped.slice(0, 5), null, 2)}
          </pre>
        </div>
      )}
    </Modal>
  )
}
