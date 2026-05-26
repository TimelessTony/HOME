import { useState } from 'react'
import { useStore, contacts, companies, deals, logActivity } from '../store'

function fmtDate(s) {
  if (!s) return ''
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString()
}

export default function RecordDrawer({ entity, id, onClose }) {
  const state = useStore()
  const list = state[entity] || []
  const record = list.find(r => r.id === id)
  const [tab, setTab] = useState('details')
  const [note, setNote] = useState('')
  const [draft, setDraft] = useState(record || {})

  if (!record) return null

  const opActions = { contacts, companies, deals }[entity]

  const save = () => {
    opActions.update(id, draft)
  }
  const remove = () => {
    if (confirm('Delete this record? This cannot be undone.')) {
      opActions.remove(id)
      onClose()
    }
  }
  const addNote = () => {
    if (!note.trim()) return
    logActivity({ type: 'note', body: note.trim(), entityType: entity, entityId: id })
    setNote('')
  }

  const recordActivities = state.activities.filter(a => a.entityType === entity && a.entityId === id)

  return (
    <>
      <div className="crm-drawer-backdrop" onClick={onClose} />
      <div className="crm-drawer">
        <div className="crm-drawer__header">
          <h3 className="crm-drawer__title">
            {entity === 'contacts'
              ? `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'Contact'
              : record.name || 'Untitled'}
          </h3>
          <button type="button" className="crm-btn crm-btn--ghost crm-btn--sm" onClick={remove}>Delete</button>
          <button type="button" className="crm-btn crm-btn--ghost crm-btn--sm" onClick={onClose} style={{ marginLeft: 8 }}>Close</button>
        </div>
        <div style={{ padding: '0 20px' }}>
          <div className="crm-tabs">
            <button className={`crm-tab ${tab === 'details' ? 'is-active' : ''}`} onClick={() => setTab('details')}>Details</button>
            <button className={`crm-tab ${tab === 'activity' ? 'is-active' : ''}`} onClick={() => setTab('activity')}>Activity</button>
          </div>
        </div>
        <div className="crm-drawer__body">
          {tab === 'details' && (
            <DetailFields
              entity={entity}
              draft={draft}
              setDraft={setDraft}
              state={state}
              onSave={save}
            />
          )}
          {tab === 'activity' && (
            <>
              <div className="crm-drawer__section">
                <div className="crm-drawer__section-title">Add a note</div>
                <textarea
                  className=""
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Log a call, meeting, or note..."
                  style={{ width: '100%', minHeight: 60, border: '1px solid var(--crm-border)', borderRadius: 6, padding: 8, fontSize: 13, fontFamily: 'inherit' }}
                />
                <div style={{ marginTop: 6, textAlign: 'right' }}>
                  <button className="crm-btn crm-btn--sm" onClick={addNote}>Log</button>
                </div>
              </div>
              <div className="crm-drawer__section">
                <div className="crm-drawer__section-title">History</div>
                {recordActivities.length === 0 && (
                  <div style={{ color: 'var(--crm-text-muted)', fontSize: 12 }}>No activity yet.</div>
                )}
                {recordActivities.map(a => (
                  <div key={a.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--crm-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--crm-text-muted)' }}>
                      {fmtDate(a.createdAt)} · {a.type}
                    </div>
                    <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{a.body}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function DetailFields({ entity, draft, setDraft, state, onSave }) {
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v }))
  const ownerOptions = state.owners
  const blur = () => onSave()

  if (entity === 'contacts') {
    return (
      <>
        <div className="crm-field-row">
          <Field label="First name" value={draft.firstName} onChange={v => set('firstName', v)} onBlur={blur} />
          <Field label="Last name" value={draft.lastName} onChange={v => set('lastName', v)} onBlur={blur} />
        </div>
        <Field label="Email" value={draft.email} onChange={v => set('email', v)} onBlur={blur} />
        <Field label="Phone" value={draft.phone} onChange={v => set('phone', v)} onBlur={blur} />
        <Field label="Title" value={draft.title} onChange={v => set('title', v)} onBlur={blur} />
        <SelectField label="Role" value={draft.role} onChange={v => set('role', v)} options={['', ...state.contactRoles]} onBlur={blur} />
        <SelectField
          label="Company"
          value={draft.companyId || ''}
          onChange={v => set('companyId', v || undefined)}
          options={[{ value: '', label: '— None —' }, ...state.companies.map(c => ({ value: c.id, label: c.name }))]}
          onBlur={blur}
        />
        <SelectField
          label="Owner"
          value={draft.ownerId || ''}
          onChange={v => set('ownerId', v)}
          options={ownerOptions.map(o => ({ value: o.id, label: o.name }))}
          onBlur={blur}
        />
        <TextArea label="Notes" value={draft.notes} onChange={v => set('notes', v)} onBlur={blur} />
      </>
    )
  }

  if (entity === 'companies') {
    return (
      <>
        <Field label="Name" value={draft.name} onChange={v => set('name', v)} onBlur={blur} />
        <Field label="Industry" value={draft.industry} onChange={v => set('industry', v)} onBlur={blur} />
        <Field label="Website" value={draft.website} onChange={v => set('website', v)} onBlur={blur} />
        <Field label="Phone" value={draft.phone} onChange={v => set('phone', v)} onBlur={blur} />
        <Field label="Address" value={draft.address} onChange={v => set('address', v)} onBlur={blur} />
        <SelectField
          label="Owner"
          value={draft.ownerId || ''}
          onChange={v => set('ownerId', v)}
          options={ownerOptions.map(o => ({ value: o.id, label: o.name }))}
          onBlur={blur}
        />
        <TextArea label="Notes" value={draft.notes} onChange={v => set('notes', v)} onBlur={blur} />
      </>
    )
  }

  if (entity === 'deals') {
    return (
      <>
        <Field label="Deal name" value={draft.name} onChange={v => set('name', v)} onBlur={blur} />
        <div className="crm-field-row">
          <Field label="Amount ($)" value={draft.amount} onChange={v => set('amount', parseFloat(v) || 0)} onBlur={blur} type="number" />
          <SelectField
            label="Stage"
            value={draft.stage}
            onChange={v => set('stage', v)}
            options={state.pipeline.map(p => ({ value: p.id, label: p.name }))}
            onBlur={blur}
          />
        </div>
        <SelectField
          label="Project Type"
          value={draft.projectType || ''}
          onChange={v => set('projectType', v)}
          options={['', ...state.projectTypes]}
          onBlur={blur}
        />
        <Field label="Project address" value={draft.projectAddress} onChange={v => set('projectAddress', v)} onBlur={blur} />
        <Field label="Square footage" value={draft.squareFootage} onChange={v => set('squareFootage', v)} onBlur={blur} />
        <div className="crm-field-row">
          <Field label="Est. start" type="date" value={draft.estStartDate} onChange={v => set('estStartDate', v)} onBlur={blur} />
          <Field label="Est. completion" type="date" value={draft.estCompletionDate} onChange={v => set('estCompletionDate', v)} onBlur={blur} />
        </div>
        <SelectField
          label="Company"
          value={draft.companyId || ''}
          onChange={v => set('companyId', v || undefined)}
          options={[{ value: '', label: '— None —' }, ...state.companies.map(c => ({ value: c.id, label: c.name }))]}
          onBlur={blur}
        />
        <SelectField
          label="Primary contact"
          value={draft.primaryContactId || ''}
          onChange={v => set('primaryContactId', v || undefined)}
          options={[
            { value: '', label: '— None —' },
            ...state.contacts.map(c => ({ value: c.id, label: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email })),
          ]}
          onBlur={blur}
        />
        <SelectField
          label="Owner"
          value={draft.ownerId || ''}
          onChange={v => set('ownerId', v)}
          options={ownerOptions.map(o => ({ value: o.id, label: o.name }))}
          onBlur={blur}
        />
        <Field label="Close date" type="date" value={draft.closeDate} onChange={v => set('closeDate', v)} onBlur={blur} />
        <TextArea label="Notes" value={draft.notes} onChange={v => set('notes', v)} onBlur={blur} />
      </>
    )
  }

  return null
}

function Field({ label, value, onChange, onBlur, type = 'text' }) {
  return (
    <div className="crm-field">
      <label>{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} onBlur={onBlur} />
    </div>
  )
}
function TextArea({ label, value, onChange, onBlur }) {
  return (
    <div className="crm-field">
      <label>{label}</label>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} onBlur={onBlur} />
    </div>
  )
}
function SelectField({ label, value, onChange, options, onBlur }) {
  const normalized = options.map(o => typeof o === 'string' ? { value: o, label: o || '—' } : o)
  return (
    <div className="crm-field">
      <label>{label}</label>
      <select value={value || ''} onChange={e => onChange(e.target.value)} onBlur={onBlur}>
        {normalized.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
