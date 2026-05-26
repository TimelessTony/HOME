import { useState, useMemo } from 'react'
import { useStore, emailTemplates, markEmailOpened, sendEmailNow } from '../store'
import EmailComposer from '../components/EmailComposer'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'

export default function Emails() {
  const state = useStore()
  const [tab, setTab] = useState('sent')
  const [showCompose, setShowCompose] = useState(false)
  const [editTemplate, setEditTemplate] = useState(null)
  const [viewEmail, setViewEmail] = useState(null)

  const sent = useMemo(() => state.emails.filter(e => e.status === 'sent' || e.status === 'opened'), [state.emails])
  const scheduled = useMemo(() => state.emails.filter(e => e.status === 'scheduled'), [state.emails])
  const drafts = useMemo(() => state.emails.filter(e => e.status === 'draft'), [state.emails])

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-header__title">Emails</h1>
        <div className="crm-page-header__spacer" />
        <button className="crm-btn" onClick={() => setShowCompose(true)}>+ New email</button>
      </div>

      <div className="crm-tabs">
        <button className={`crm-tab ${tab === 'sent' ? 'is-active' : ''}`} onClick={() => setTab('sent')}>Sent ({sent.length})</button>
        <button className={`crm-tab ${tab === 'scheduled' ? 'is-active' : ''}`} onClick={() => setTab('scheduled')}>Scheduled ({scheduled.length})</button>
        <button className={`crm-tab ${tab === 'drafts' ? 'is-active' : ''}`} onClick={() => setTab('drafts')}>Drafts ({drafts.length})</button>
        <button className={`crm-tab ${tab === 'templates' ? 'is-active' : ''}`} onClick={() => setTab('templates')}>Templates ({state.emailTemplates.length})</button>
      </div>

      {tab !== 'templates' && (
        <div style={{ marginBottom: 8, padding: '8px 12px', background: 'var(--crm-primary-soft)', color: 'var(--crm-primary-dark)', borderRadius: 6, fontSize: 12 }}>
          <strong>Skeleton mode:</strong> emails aren't sent over SMTP yet. Sending records the email locally; the "Simulate open" button lets you test the tracking UI. Replace <code>sendEmailNow</code> in <code>store.js</code> with a real provider call (e.g. SendGrid, Postmark) and add a tracking pixel endpoint when ready.
        </div>
      )}

      {tab === 'sent' && (
        sent.length === 0 ? <EmptyState title="No sent emails" /> :
        <EmailList items={sent} state={state} onView={setViewEmail} onOpen={markEmailOpened} />
      )}
      {tab === 'scheduled' && (
        scheduled.length === 0 ? <EmptyState title="No scheduled emails" /> :
        <ScheduledList items={scheduled} state={state} onView={setViewEmail} />
      )}
      {tab === 'drafts' && (
        drafts.length === 0 ? <EmptyState title="No drafts" /> :
        <EmailList items={drafts} state={state} onView={setViewEmail} />
      )}
      {tab === 'templates' && (
        <TemplatesList
          items={state.emailTemplates}
          onEdit={setEditTemplate}
          onNew={() => setEditTemplate({})}
        />
      )}

      {showCompose && <EmailComposer onClose={() => setShowCompose(false)} />}
      {editTemplate !== null && (
        <TemplateModal template={editTemplate} onClose={() => setEditTemplate(null)} />
      )}
      {viewEmail && <EmailViewModal email={viewEmail} state={state} onClose={() => setViewEmail(null)} />}
    </div>
  )
}

function EmailList({ items, state, onView, onOpen }) {
  return (
    <div className="crm-list">
      {items.map(e => {
        const c = state.contacts.find(x => x.id === e.contactId)
        return (
          <div key={e.id} className="crm-list__item">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="crm-list__item-title">{e.subject || '(no subject)'}</div>
              <div className="crm-list__item-meta">
                To: {e.to} {c && `· ${c.firstName || ''} ${c.lastName || ''}`.trim()}
                {' · '}
                {e.sentAt ? `Sent ${new Date(e.sentAt).toLocaleString()}` : 'Draft'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {e.status === 'opened' || e.openCount > 0 ? (
                <span className="crm-badge crm-badge--success">Opened {e.openCount > 1 ? `(${e.openCount})` : ''}</span>
              ) : e.status === 'sent' ? (
                <span className="crm-badge crm-badge--info">Sent</span>
              ) : (
                <span className="crm-badge">Draft</span>
              )}
              {onOpen && e.status === 'sent' && (
                <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => onOpen(e.id)}>Simulate open</button>
              )}
              <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => onView(e)}>View</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function ScheduledList({ items, state, onView }) {
  return (
    <div className="crm-list">
      {items.map(e => {
        const c = state.contacts.find(x => x.id === e.contactId)
        return (
          <div key={e.id} className="crm-list__item">
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="crm-list__item-title">{e.subject || '(no subject)'}</div>
              <div className="crm-list__item-meta">
                To: {e.to} {c && `· ${c.firstName || ''} ${c.lastName || ''}`.trim()}
                {' · '}
                Scheduled for {new Date(e.scheduledAt).toLocaleString()}
              </div>
            </div>
            <span className="crm-badge crm-badge--warn">Scheduled</span>
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => sendEmailNow(e.id)}>Send now</button>
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => onView(e)}>View</button>
          </div>
        )
      })}
    </div>
  )
}

function TemplatesList({ items, onEdit, onNew }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button className="crm-btn" onClick={onNew}>+ New template</button>
      </div>
      {items.length === 0 ? <EmptyState title="No templates yet" /> : (
        <div className="crm-list">
          {items.map(t => (
            <div key={t.id} className="crm-list__item">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="crm-list__item-title">{t.name}</div>
                <div className="crm-list__item-meta">{t.subject}</div>
              </div>
              <span className="crm-badge">{t.category || 'sales'}</span>
              <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => onEdit(t)}>Edit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TemplateModal({ template, onClose }) {
  const [name, setName] = useState(template.name || '')
  const [category, setCategory] = useState(template.category || 'sales')
  const [subject, setSubject] = useState(template.subject || '')
  const [body, setBody] = useState(template.body || '')

  const save = () => {
    if (!name.trim()) return
    if (template.id) emailTemplates.update(template.id, { name, category, subject, body })
    else emailTemplates.add({ name, category, subject, body })
    onClose()
  }
  const remove = () => {
    if (!template.id) return
    if (confirm('Delete this template?')) { emailTemplates.remove(template.id); onClose() }
  }

  return (
    <Modal
      title={template.id ? 'Edit template' : 'New template'}
      onClose={onClose}
      wide
      footer={
        <>
          {template.id && <button className="crm-btn crm-btn--danger" onClick={remove}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn" onClick={save}>Save</button>
        </>
      }
    >
      <div className="crm-field-row">
        <div className="crm-field"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="crm-field">
          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
      </div>
      <div className="crm-field"><label>Subject</label><input value={subject} onChange={e => setSubject(e.target.value)} /></div>
      <div className="crm-field"><label>Body</label><textarea value={body} onChange={e => setBody(e.target.value)} style={{ minHeight: 200 }} /></div>
      <div style={{ fontSize: 11, color: 'var(--crm-text-muted)' }}>
        Tokens: {'{{firstName}}, {{lastName}}, {{senderName}}, {{projectAddress}}, {{projectType}}'}
      </div>
    </Modal>
  )
}

function EmailViewModal({ email, state, onClose }) {
  const c = state.contacts.find(x => x.id === email.contactId)
  return (
    <Modal title={email.subject || '(no subject)'} onClose={onClose} wide>
      <div style={{ fontSize: 12, color: 'var(--crm-text-muted)', marginBottom: 12 }}>
        <div><strong>To:</strong> {email.to} {c && `(${c.firstName || ''} ${c.lastName || ''})`}</div>
        <div><strong>From:</strong> {email.from || '—'}</div>
        {email.scheduledAt && <div><strong>Scheduled:</strong> {new Date(email.scheduledAt).toLocaleString()}</div>}
        {email.sentAt && <div><strong>Sent:</strong> {new Date(email.sentAt).toLocaleString()}</div>}
        {email.openedAt && <div><strong>First opened:</strong> {new Date(email.openedAt).toLocaleString()} ({email.openCount} opens)</div>}
      </div>
      <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, border: '1px solid var(--crm-border)', borderRadius: 6, padding: 12, background: '#FAFBFC' }}>
        {email.body}
      </div>
    </Modal>
  )
}
