import { useState, useMemo } from 'react'
import { useStore, contacts } from '../store'
import RecordDrawer from '../components/RecordDrawer'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import ImportCsvDialog from '../components/ImportCsvDialog'
import { toCSV, downloadCSV } from '../csv'

export default function Contacts() {
  const state = useStore()
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return state.contacts
    return state.contacts.filter(c => {
      const name = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase()
      return name.includes(q) || (c.email || '').toLowerCase().includes(q) || (c.title || '').toLowerCase().includes(q)
    })
  }, [state.contacts, search])

  const exportCsv = () => {
    const rows = state.contacts.map(c => ({
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      email: c.email || '',
      phone: c.phone || '',
      title: c.title || '',
      role: c.role || '',
      company: state.companies.find(x => x.id === c.companyId)?.name || '',
      owner: state.owners.find(o => o.id === c.ownerId)?.name || '',
      notes: c.notes || '',
    }))
    downloadCSV('contacts.csv', toCSV(rows))
  }

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-header__title">Contacts</h1>
        <div className="crm-page-header__spacer" />
        <button className="crm-btn crm-btn--ghost" onClick={exportCsv} disabled={!state.contacts.length}>Export</button>
        <button className="crm-btn crm-btn--ghost" onClick={() => setShowImport(true)}>Import CSV</button>
        <button className="crm-btn" onClick={() => setShowNew(true)}>+ New contact</button>
      </div>

      <div className="crm-toolbar">
        <input
          className="crm-topbar__search"
          placeholder="Search contacts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="crm-toolbar__spacer" />
        <div style={{ fontSize: 12, color: 'var(--crm-text-muted)' }}>
          {filtered.length} of {state.contacts.length}
        </div>
      </div>

      {state.contacts.length === 0 ? (
        <EmptyState
          title="No contacts yet"
          hint="Import from CSV or add your first contact."
          actionLabel="+ Add a contact"
          onAction={() => setShowNew(true)}
        />
      ) : (
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Title</th>
              <th>Role</th>
              <th>Company</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const company = state.companies.find(x => x.id === c.companyId)
              const owner = state.owners.find(o => o.id === c.ownerId)
              return (
                <tr key={c.id} onClick={() => setOpenId(c.id)}>
                  <td className="crm-table__name">{`${c.firstName || ''} ${c.lastName || ''}`.trim() || '—'}</td>
                  <td>{c.title || '—'}</td>
                  <td>{c.role ? <span className="crm-badge crm-badge--info">{c.role}</span> : '—'}</td>
                  <td>{company?.name || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{owner?.name || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {openId && <RecordDrawer key={openId} entity="contacts" id={openId} onClose={() => setOpenId(null)} />}
      {showNew && <NewContactModal onClose={() => setShowNew(false)} onCreated={id => { setShowNew(false); setOpenId(id) }} />}
      {showImport && <ImportCsvDialog onClose={() => setShowImport(false)} defaultEntity="contacts" />}
    </div>
  )
}

function NewContactModal({ onClose, onCreated }) {
  const state = useStore()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [companyId, setCompanyId] = useState('')

  const create = () => {
    const id = contacts.add({
      firstName, lastName, email, phone, role,
      companyId: companyId || undefined,
      ownerId: state.settings.currentUserId,
    })
    onCreated(id)
  }

  return (
    <Modal
      title="New contact"
      onClose={onClose}
      footer={
        <>
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn" onClick={create} disabled={!firstName && !lastName && !email}>Create</button>
        </>
      }
    >
      <div className="crm-field-row">
        <div className="crm-field"><label>First name</label><input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
        <div className="crm-field"><label>Last name</label><input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
      </div>
      <div className="crm-field"><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div className="crm-field"><label>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} /></div>
      <div className="crm-field-row">
        <div className="crm-field">
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option value="">—</option>
            {state.contactRoles.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="crm-field">
          <label>Company</label>
          <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
            <option value="">— None —</option>
            {state.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>
    </Modal>
  )
}
