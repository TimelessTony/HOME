import { useState, useMemo } from 'react'
import Modal from './Modal'
import { useStore, emails, emailTemplates } from '../store'

function applyTemplate(text, vars) {
  return (text || '').replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] || `{{${k}}}`)
}

export default function EmailComposer({ onClose, prefill = {} }) {
  const state = useStore()
  const currentUser = state.owners.find(o => o.id === state.settings.currentUserId)
  const [to, setTo] = useState(prefill.to || '')
  const [contactId, setContactId] = useState(prefill.contactId || '')
  const [subject, setSubject] = useState(prefill.subject || '')
  const [body, setBody] = useState(prefill.body || '')
  const [templateId, setTemplateId] = useState('')
  const [scheduleAt, setScheduleAt] = useState('')
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')

  const contact = useMemo(
    () => state.contacts.find(c => c.id === contactId),
    [state.contacts, contactId]
  )

  const onPickContact = (id) => {
    setContactId(id)
    const c = state.contacts.find(x => x.id === id)
    if (c?.email) setTo(c.email)
  }

  const onPickTemplate = (id) => {
    setTemplateId(id)
    if (!id) return
    const tpl = state.emailTemplates.find(t => t.id === id)
    if (!tpl) return
    const vars = {
      firstName: contact?.firstName || '',
      lastName: contact?.lastName || '',
      senderName: currentUser?.name || '',
      projectAddress: '',
      projectType: '',
    }
    setSubject(applyTemplate(tpl.subject, vars))
    setBody(applyTemplate(tpl.body, vars))
  }

  const persistTemplateIfRequested = () => {
    if (saveAsTemplate && templateName.trim()) {
      emailTemplates.add({
        name: templateName.trim(),
        category: 'sales',
        subject,
        body,
      })
    }
  }

  const sendNow = () => {
    persistTemplateIfRequested()
    emails.add({
      direction: 'sent',
      to,
      from: currentUser?.email || '',
      subject,
      body,
      contactId: contactId || undefined,
      ownerId: state.settings.currentUserId,
      status: 'sent',
      sentAt: new Date().toISOString(),
      openCount: 0,
    })
    onClose()
  }

  const schedule = () => {
    if (!scheduleAt) return
    persistTemplateIfRequested()
    emails.add({
      direction: 'sent',
      to,
      from: currentUser?.email || '',
      subject,
      body,
      contactId: contactId || undefined,
      ownerId: state.settings.currentUserId,
      status: 'scheduled',
      scheduledAt: new Date(scheduleAt).toISOString(),
      openCount: 0,
    })
    onClose()
  }

  const saveDraft = () => {
    persistTemplateIfRequested()
    emails.add({
      direction: 'sent',
      to,
      from: currentUser?.email || '',
      subject,
      body,
      contactId: contactId || undefined,
      ownerId: state.settings.currentUserId,
      status: 'draft',
      openCount: 0,
    })
    onClose()
  }

  return (
    <Modal
      title="New email"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn crm-btn--ghost" onClick={saveDraft}>Save draft</button>
          <button className="crm-btn crm-btn--ghost" onClick={schedule} disabled={!scheduleAt || !to}>
            Schedule
          </button>
          <button className="crm-btn" onClick={sendNow} disabled={!to || !subject}>Send now</button>
        </>
      }
    >
      <div className="crm-field-row">
        <div className="crm-field">
          <label>Contact (optional)</label>
          <select value={contactId} onChange={e => onPickContact(e.target.value)}>
            <option value="">— Direct email —</option>
            {state.contacts.map(c => (
              <option key={c.id} value={c.id}>
                {`${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || '(no name)'}
              </option>
            ))}
          </select>
        </div>
        <div className="crm-field">
          <label>Template (optional)</label>
          <select value={templateId} onChange={e => onPickTemplate(e.target.value)}>
            <option value="">— None —</option>
            {state.emailTemplates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="crm-field">
        <label>To</label>
        <input value={to} onChange={e => setTo(e.target.value)} placeholder="name@example.com" />
      </div>
      <div className="crm-field">
        <label>Subject</label>
        <input value={subject} onChange={e => setSubject(e.target.value)} />
      </div>
      <div className="crm-field">
        <label>Body</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          style={{ minHeight: 160 }}
        />
        <div style={{ fontSize: 11, color: 'var(--crm-text-muted)', marginTop: 4 }}>
          Tokens supported: {'{{firstName}}, {{lastName}}, {{senderName}}, {{projectAddress}}, {{projectType}}'}
        </div>
      </div>
      <div className="crm-field">
        <label>Schedule send (optional)</label>
        <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} />
      </div>
      <div className="crm-field">
        <label>
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={e => setSaveAsTemplate(e.target.checked)}
            style={{ width: 'auto', marginRight: 6 }}
          />
          Save this as a reusable template
        </label>
        {saveAsTemplate && (
          <input
            placeholder="Template name"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            style={{ marginTop: 6 }}
          />
        )}
      </div>
    </Modal>
  )
}
