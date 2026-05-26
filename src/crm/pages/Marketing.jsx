import { useState } from 'react'
import { useStore, campaigns, emails as emailsCrud } from '../store'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

function applyTemplate(text, vars) {
  return (text || '').replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] || `{{${k}}}`)
}

export default function Marketing() {
  const state = useStore()
  const [showNew, setShowNew] = useState(false)
  const [openCampaign, setOpenCampaign] = useState(null)

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-header__title">Marketing campaigns</h1>
        <div className="crm-page-header__spacer" />
        <button className="crm-btn" onClick={() => setShowNew(true)}>+ New campaign</button>
      </div>

      <div style={{ marginBottom: 12, padding: '8px 12px', background: 'var(--crm-primary-soft)', color: 'var(--crm-primary-dark)', borderRadius: 6, fontSize: 12 }}>
        Bulk-send to a filtered list of contacts. In skeleton mode, "send" generates one email record per recipient locally — no real delivery yet.
      </div>

      {state.campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          hint="Send a one-off newsletter or nurture sequence to a segment."
          actionLabel="+ New campaign"
          onAction={() => setShowNew(true)}
        />
      ) : (
        <table className="crm-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Recipients</th>
              <th>Opens</th>
              <th>Scheduled</th>
              <th>Sent</th>
            </tr>
          </thead>
          <tbody>
            {state.campaigns.map(c => (
              <tr key={c.id} onClick={() => setOpenCampaign(c)}>
                <td className="crm-table__name">{c.name}</td>
                <td>{c.subject}</td>
                <td>
                  <span className={`crm-badge ${c.status === 'sent' ? 'crm-badge--success' : c.status === 'scheduled' ? 'crm-badge--warn' : ''}`}>
                    {c.status}
                  </span>
                </td>
                <td>{c.sentCount || 0}</td>
                <td>{c.openCount || 0}</td>
                <td>{c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : '—'}</td>
                <td>{c.sentAt ? new Date(c.sentAt).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showNew && <NewCampaignModal onClose={() => setShowNew(false)} />}
      {openCampaign && <CampaignDetail campaign={openCampaign} onClose={() => setOpenCampaign(null)} />}
    </div>
  )
}

function NewCampaignModal({ onClose }) {
  const state = useStore()
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [scheduleAt, setScheduleAt] = useState('')

  const recipients = state.contacts.filter(c => {
    if (!c.email) return false
    if (roleFilter && c.role !== roleFilter) return false
    return true
  })

  const create = (action) => {
    if (!name.trim()) return
    const currentUser = state.owners.find(o => o.id === state.settings.currentUserId)
    const id = campaigns.add({
      name,
      subject,
      body,
      recipientFilter: { role: roleFilter || null },
      sentCount: 0,
      openCount: 0,
      status: 'draft',
    })

    if (action === 'send' || action === 'schedule') {
      const now = new Date().toISOString()
      const scheduledAtIso = action === 'schedule' && scheduleAt ? new Date(scheduleAt).toISOString() : null
      recipients.forEach(c => {
        emailsCrud.add({
          direction: 'sent',
          to: c.email,
          from: currentUser?.email || '',
          subject: applyTemplate(subject, { firstName: c.firstName, lastName: c.lastName, senderName: currentUser?.name }),
          body: applyTemplate(body, { firstName: c.firstName, lastName: c.lastName, senderName: currentUser?.name }),
          contactId: c.id,
          ownerId: state.settings.currentUserId,
          campaignId: id,
          status: action === 'send' ? 'sent' : 'scheduled',
          sentAt: action === 'send' ? now : null,
          scheduledAt: scheduledAtIso,
          openCount: 0,
        })
      })
      campaigns.update(id, {
        status: action === 'send' ? 'sent' : 'scheduled',
        sentCount: action === 'send' ? recipients.length : 0,
        scheduledAt: scheduledAtIso,
        sentAt: action === 'send' ? now : null,
      })
    }

    onClose()
  }

  return (
    <Modal
      title="New campaign"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn--ghost" onClick={() => create('draft')}>Save draft</button>
          <button className="crm-btn crm-btn--ghost" disabled={!scheduleAt || !name} onClick={() => create('schedule')}>Schedule</button>
          <button className="crm-btn" disabled={!name || !subject || !recipients.length} onClick={() => create('send')}>
            Send to {recipients.length}
          </button>
        </>
      }
    >
      <div className="crm-field"><label>Campaign name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Q3 Newsletter" /></div>
      <div className="crm-field"><label>Subject</label><input value={subject} onChange={e => setSubject(e.target.value)} /></div>
      <div className="crm-field">
        <label>Filter recipients by contact role (optional)</label>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All contacts with email ({state.contacts.filter(c => c.email).length})</option>
          {state.contactRoles.map(r => {
            const count = state.contacts.filter(c => c.email && c.role === r).length
            return <option key={r} value={r}>{r} ({count})</option>
          })}
        </select>
      </div>
      <div className="crm-field"><label>Body</label><textarea value={body} onChange={e => setBody(e.target.value)} style={{ minHeight: 160 }} /></div>
      <div className="crm-field">
        <label>Schedule (optional)</label>
        <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--crm-text-muted)' }}>
        Will create {recipients.length} email records.
      </div>
    </Modal>
  )
}

function CampaignDetail({ campaign, onClose }) {
  const state = useStore()
  const campEmails = state.emails.filter(e => e.campaignId === campaign.id)
  const opens = campEmails.filter(e => e.openCount > 0).length
  return (
    <Modal title={campaign.name} onClose={onClose} wide>
      <div className="crm-kpis" style={{ marginBottom: 16 }}>
        <div className="crm-kpi">
          <div className="crm-kpi__label">Sent</div>
          <div className="crm-kpi__value">{campEmails.filter(e => e.status === 'sent' || e.status === 'opened').length}</div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi__label">Opened</div>
          <div className="crm-kpi__value">{opens}</div>
          <div className="crm-kpi__sub">
            {campEmails.length ? `${Math.round((opens / campEmails.length) * 100)}% open rate` : '—'}
          </div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi__label">Scheduled</div>
          <div className="crm-kpi__value">{campEmails.filter(e => e.status === 'scheduled').length}</div>
        </div>
      </div>
      <div className="crm-field"><label>Subject</label><div style={{ padding: 8 }}>{campaign.subject}</div></div>
      <div className="crm-field"><label>Body</label><div style={{ whiteSpace: 'pre-wrap', padding: 8, border: '1px solid var(--crm-border)', borderRadius: 6 }}>{campaign.body}</div></div>
    </Modal>
  )
}
