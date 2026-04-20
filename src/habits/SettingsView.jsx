import { useState } from 'react'
import {
  buildIcs,
  downloadIcs,
  microsoftTodoBulkInstructions,
  microsoftTodoUrl,
} from './reminders'

const STORAGE_KEY = 'rom.habits.v1'

export default function SettingsView({ data }) {
  const { habits, settings, updateSettings, resetAll } = data
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unavailable'
  )
  const [icsPreview, setIcsPreview] = useState(false)

  async function requestNotifications() {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setNotifStatus(result)
    if (result === 'granted') {
      new Notification('ROM Habits', {
        body: 'Reminders enabled. Keep the tab pinned to get pings while open.',
      })
    }
  }

  function setReminderTimeAll(time) {
    updateSettings({ reminderTime: time })
  }

  function exportJson() {
    const blob = new Blob([localStorage.getItem(STORAGE_KEY) || '{}'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rom-habits-backup.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function importJson(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (!parsed.habits) throw new Error('Invalid backup')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
        window.location.reload()
      } catch {
        alert('Could not import: invalid backup file.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="settings-view">
      <h1>Settings</h1>

      <section className="settings-section">
        <h2>7 AM reminders</h2>
        <p>
          Tap <strong>Download reminder calendar</strong> to get a <code>.ics</code> file.
          Open it on your phone or computer — iOS Calendar, Google Calendar, and Outlook
          will add each enabled habit as a recurring reminder at the time you set
          (default 7 AM). These fire even when this app is closed.
        </p>
        <div className="settings-row">
          <button className="btn-primary" onClick={() => downloadIcs(habits)}>
            Download reminder calendar (.ics)
          </button>
          <button className="btn-secondary" onClick={() => setIcsPreview(v => !v)}>
            {icsPreview ? 'Hide preview' : 'Preview'}
          </button>
        </div>
        {icsPreview && (
          <pre className="ics-preview">{buildIcs(habits).slice(0, 2000)}{buildIcs(habits).length > 2000 ? '\n…' : ''}</pre>
        )}
      </section>

      <section className="settings-section">
        <h2>Browser notifications</h2>
        <p>
          For pings while this tab/PWA is open, grant notification permission.
          Permission status: <strong>{notifStatus}</strong>.
        </p>
        <button
          className="btn-secondary"
          onClick={requestNotifications}
          disabled={notifStatus === 'granted' || notifStatus === 'unavailable'}
        >
          {notifStatus === 'granted' ? 'Enabled' : 'Enable notifications'}
        </button>
      </section>

      <section className="settings-section">
        <h2>Microsoft To-Do</h2>
        <p>{microsoftTodoBulkInstructions()}</p>
        <details>
          <summary>Create individual tasks</summary>
          <ul className="todo-links">
            {habits.map(h => (
              <li key={h.id}>
                <a href={microsoftTodoUrl(h)} target="_blank" rel="noreferrer">
                  {h.icon} {h.name} → Outlook / To-Do
                </a>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="settings-section">
        <h2>Default reminder time</h2>
        <div className="settings-row">
          <input
            type="time"
            value={settings?.reminderTime || '07:00'}
            onChange={e => setReminderTimeAll(e.target.value)}
          />
          <span className="field-label">Used as the default for new habits.</span>
        </div>
      </section>

      <section className="settings-section">
        <h2>Backup</h2>
        <div className="settings-row">
          <button className="btn-secondary" onClick={exportJson}>Export JSON</button>
          <label className="btn-secondary file-label">
            Import JSON
            <input type="file" accept="application/json" onChange={importJson} hidden />
          </label>
          <button className="btn-danger" onClick={resetAll}>Reset to defaults</button>
        </div>
      </section>

      <section className="settings-section">
        <h2>Install as app</h2>
        <p>
          On iOS: open Safari → Share → <em>Add to Home Screen</em>.
          On Android: Chrome menu → <em>Install app</em>.
          On desktop Chrome/Edge: the install icon appears in the address bar.
        </p>
      </section>
    </div>
  )
}
