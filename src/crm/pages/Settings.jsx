import { useState } from 'react'
import { useStore, settings, resetAllData, uid } from '../store'

export default function Settings() {
  const state = useStore()

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-header__title">Settings</h1>
      </div>

      <div className="crm-two-col">
        <BrandCard state={state} />
        <UsersCard state={state} />
      </div>

      <div className="crm-two-col" style={{ marginTop: 16 }}>
        <PipelineCard state={state} />
        <ProjectTypesCard state={state} />
      </div>

      <div className="crm-two-col" style={{ marginTop: 16 }}>
        <RolesCard state={state} />
        <DataCard />
      </div>
    </div>
  )
}

function BrandCard({ state }) {
  const [brandName, setBrandName] = useState(state.settings.brandName)
  const [companyName, setCompanyName] = useState(state.settings.companyName)
  const [currentUserId, setCurrentUserId] = useState(state.settings.currentUserId)

  const save = () => settings.update({ brandName, companyName, currentUserId })

  return (
    <div className="crm-card">
      <div className="crm-card__header"><h3 className="crm-card__title">Brand & profile</h3></div>
      <div className="crm-card__body">
        <div className="crm-field"><label>Brand name</label><input value={brandName} onChange={e => setBrandName(e.target.value)} onBlur={save} /></div>
        <div className="crm-field"><label>Company name</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} onBlur={save} /></div>
        <div className="crm-field">
          <label>You are logged in as</label>
          <select value={currentUserId} onChange={e => { setCurrentUserId(e.target.value); settings.update({ currentUserId: e.target.value }) }}>
            {state.owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}

function UsersCard({ state }) {
  const [list, setList] = useState(state.owners)

  const update = (i, field, value) => {
    const next = list.map((o, idx) => idx === i ? { ...o, [field]: value } : o)
    setList(next)
  }
  const remove = (i) => {
    const next = list.filter((_, idx) => idx !== i)
    setList(next); settings.setOwners(next)
  }
  const add = () => {
    const next = [...list, { id: uid('u_'), name: '', email: '', role: '' }]
    setList(next); settings.setOwners(next)
  }
  const flush = () => settings.setOwners(list)

  return (
    <div className="crm-card">
      <div className="crm-card__header"><h3 className="crm-card__title">Team / owners</h3></div>
      <div className="crm-card__body">
        {list.map((o, i) => (
          <div key={o.id} className="crm-owner-row">
            <input value={o.name} placeholder="Name" onChange={e => update(i, 'name', e.target.value)} onBlur={flush} />
            <input value={o.email} placeholder="Email" onChange={e => update(i, 'email', e.target.value)} onBlur={flush} />
            <input value={o.role || ''} placeholder="Role" onChange={e => update(i, 'role', e.target.value)} onBlur={flush} />
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
        <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={add}>+ Add user</button>
      </div>
    </div>
  )
}

function PipelineCard({ state }) {
  const [list, setList] = useState(state.pipeline)

  const update = (i, field, value) => {
    const next = list.map((s, idx) => idx === i ? { ...s, [field]: value } : s)
    setList(next)
  }
  const remove = (i) => {
    const next = list.filter((_, idx) => idx !== i)
    setList(next); settings.setPipeline(next)
  }
  const add = () => {
    const next = [...list, { id: uid('st_'), name: 'New stage', probability: 50 }]
    setList(next); settings.setPipeline(next)
  }
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= list.length) return
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    setList(next); settings.setPipeline(next)
  }
  const flush = () => settings.setPipeline(list)

  return (
    <div className="crm-card">
      <div className="crm-card__header"><h3 className="crm-card__title">Pipeline stages</h3></div>
      <div className="crm-card__body">
        {list.map((s, i) => (
          <div key={s.id} className="crm-stage-row">
            <input value={s.name} onChange={e => update(i, 'name', e.target.value)} onBlur={flush} />
            <input type="number" value={s.probability ?? 0} onChange={e => update(i, 'probability', parseInt(e.target.value) || 0)} onBlur={flush} style={{ flex: 0, width: 64 }} title="Probability %" />
            <label style={{ fontSize: 11, display: 'flex', gap: 4 }}>
              <input type="checkbox" checked={!!s.isWon} onChange={e => { update(i, 'isWon', e.target.checked); flush() }} /> Won
            </label>
            <label style={{ fontSize: 11, display: 'flex', gap: 4 }}>
              <input type="checkbox" checked={!!s.isLost} onChange={e => { update(i, 'isLost', e.target.checked); flush() }} /> Lost
            </label>
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => move(i, -1)}>↑</button>
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => move(i, 1)}>↓</button>
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
        <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={add}>+ Add stage</button>
      </div>
    </div>
  )
}

function ProjectTypesCard({ state }) {
  return (
    <SimpleListCard
      title="Project types"
      list={state.projectTypes}
      onChange={list => settings.setProjectTypes(list)}
    />
  )
}

function RolesCard({ state }) {
  return (
    <SimpleListCard
      title="Contact roles"
      list={state.contactRoles}
      onChange={list => settings.setContactRoles(list)}
    />
  )
}

function SimpleListCard({ title, list, onChange }) {
  const [local, setLocal] = useState(list)
  const update = (i, value) => { const next = [...local]; next[i] = value; setLocal(next) }
  const flush = () => onChange(local.filter(s => s.trim()))
  const remove = (i) => { const next = local.filter((_, idx) => idx !== i); setLocal(next); onChange(next) }
  const add = () => { const next = [...local, '']; setLocal(next) }

  return (
    <div className="crm-card">
      <div className="crm-card__header"><h3 className="crm-card__title">{title}</h3></div>
      <div className="crm-card__body">
        {local.map((s, i) => (
          <div key={i} className="crm-type-row">
            <input value={s} onChange={e => update(i, e.target.value)} onBlur={flush} />
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
        <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={add}>+ Add</button>
      </div>
    </div>
  )
}

function DataCard() {
  const wipe = () => {
    if (confirm('Wipe all CRM data and restore defaults? This cannot be undone.')) {
      resetAllData()
    }
  }
  return (
    <div className="crm-card">
      <div className="crm-card__header"><h3 className="crm-card__title">Data</h3></div>
      <div className="crm-card__body">
        <p style={{ fontSize: 13, color: 'var(--crm-text-muted)', marginTop: 0 }}>
          All data is stored in this browser's localStorage under the key{' '}
          <code>timeless-crm-v1</code>. Wipe it any time during development.
        </p>
        <button className="crm-btn crm-btn--danger" onClick={wipe}>Wipe all data</button>
      </div>
    </div>
  )
}
