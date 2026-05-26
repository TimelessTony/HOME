import { useState, useMemo } from 'react'
import { useStore, companies } from '../store'
import RecordDrawer from '../components/RecordDrawer'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import ImportCsvDialog from '../components/ImportCsvDialog'
import { toCSV, downloadCSV } from '../csv'

export default function Companies() {
  const state = useStore()
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return state.companies
    return state.companies.filter(c =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.industry || '').toLowerCase().includes(q)
    )
  }, [state.companies, search])

  const exportCsv = () => {
    const rows = state.companies.map(c => ({
      name: c.name || '',
      industry: c.industry || '',
      website: c.website || '',
      phone: c.phone || '',
      address: c.address || '',
      owner: state.owners.find(o => o.id === c.ownerId)?.name || '',
      notes: c.notes || '',
    }))
    downloadCSV('companies.csv', toCSV(rows))
  }

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-header__title">Companies</h1>
        <div className="crm-page-header__spacer" />
        <button className="crm-btn crm-btn--ghost" onClick={exportCsv} disabled={!state.companies.length}>Export</button>
        <button className="crm-btn crm-btn--ghost" onClick={() => setShowImport(true)}>Import CSV</button>
        <button className="crm-btn" onClick={() => setShowNew(true)}>+ New company</button>
      </div>

      <div className="crm-toolbar">
        <input
          className="crm-topbar__search"
          placeholder="Search companies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="crm-toolbar__spacer" />
        <div style={{ fontSize: 12, color: 'var(--crm-text-muted)' }}>
          {filtered.length} of {state.companies.length}
        </div>
      </div>

      {state.companies.length === 0 ? (
        <EmptyState
          title="No companies yet"
          hint="Add a company manually or import via CSV."
          actionLabel="+ Add a company"
          onAction={() => setShowNew(true)}
        />
      ) : (
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Industry</th>
              <th>Website</th>
              <th>Phone</th>
              <th>Contacts</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const contactCount = state.contacts.filter(x => x.companyId === c.id).length
              const owner = state.owners.find(o => o.id === c.ownerId)
              return (
                <tr key={c.id} onClick={() => setOpenId(c.id)}>
                  <td className="crm-table__name">{c.name || '—'}</td>
                  <td>{c.industry || '—'}</td>
                  <td>{c.website || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{contactCount}</td>
                  <td>{owner?.name || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {openId && <RecordDrawer key={openId} entity="companies" id={openId} onClose={() => setOpenId(null)} />}
      {showNew && <NewCompanyModal onClose={() => setShowNew(false)} onCreated={id => { setShowNew(false); setOpenId(id) }} />}
      {showImport && <ImportCsvDialog onClose={() => setShowImport(false)} defaultEntity="companies" />}
    </div>
  )
}

function NewCompanyModal({ onClose, onCreated }) {
  const state = useStore()
  const [name, setName] = useState('')
  const [industry, setIndustry] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')

  const create = () => {
    const id = companies.add({
      name, industry, website, phone,
      ownerId: state.settings.currentUserId,
    })
    onCreated(id)
  }

  return (
    <Modal
      title="New company"
      onClose={onClose}
      footer={
        <>
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn" onClick={create} disabled={!name.trim()}>Create</button>
        </>
      }
    >
      <div className="crm-field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
      <div className="crm-field"><label>Industry</label><input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Hospitality, Retail" /></div>
      <div className="crm-field"><label>Website</label><input value={website} onChange={e => setWebsite(e.target.value)} /></div>
      <div className="crm-field"><label>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} /></div>
    </Modal>
  )
}
