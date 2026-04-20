import { useMemo, useState } from 'react'
import { COLORS, newHabit } from './defaults'

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export default function CreateHabitView({ data, editId, onDone }) {
  const { habits, addHabit, updateHabit, removeHabit } = data
  const existing = useMemo(
    () => (editId ? habits.find(h => h.id === editId) : null),
    [habits, editId]
  )

  const [draft, setDraft] = useState(() => existing || newHabit())

  const isEditing = Boolean(existing)

  function update(patch) {
    setDraft(d => ({ ...d, ...patch }))
  }

  function toggleWeekday(i) {
    const weekdays = [...(draft.weekdays || [true, true, true, true, true, true, true])]
    weekdays[i] = !weekdays[i]
    update({ weekdays })
  }

  function save() {
    if (!draft.name.trim()) return
    if (isEditing) updateHabit(draft.id, draft)
    else addHabit(draft)
    onDone()
  }

  function remove() {
    if (!isEditing) return
    if (!window.confirm(`Delete "${draft.name}"? This also deletes its history.`)) return
    removeHabit(draft.id)
    onDone()
  }

  return (
    <div className="create-view">
      <div className="create-header">
        <h1>{isEditing ? 'Edit Habit' : 'Create Habit'}</h1>
        <button className="create-close" onClick={onDone} aria-label="Close">×</button>
      </div>

      <div
        className="create-preview"
        style={{ background: `color-mix(in srgb, ${draft.color} 18%, var(--card-bg))` }}
      >
        <div className="create-preview-top">
          <span className="create-preview-name">{draft.name || 'New habit'}</span>
          <span className="create-preview-icon">{draft.icon}</span>
        </div>
      </div>

      <label className="field">
        <span className="field-label">Name</span>
        <input
          type="text"
          value={draft.name}
          onChange={e => update({ name: e.target.value })}
          placeholder="e.g. Meditate"
          maxLength={80}
        />
      </label>

      <label className="field">
        <span className="field-label">Icon (emoji)</span>
        <input
          type="text"
          value={draft.icon}
          onChange={e => update({ icon: e.target.value })}
          maxLength={4}
        />
      </label>

      <div className="field">
        <span className="field-label">Color</span>
        <div className="color-row">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => update({ color: c })}
              className={`color-swatch ${draft.color === c ? 'active' : ''}`}
              style={{ background: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      <label className="field">
        <span className="field-label">Motivation</span>
        <input
          type="text"
          value={draft.motivation || ''}
          onChange={e => update({ motivation: e.target.value })}
          placeholder="Why does this matter?"
          maxLength={120}
        />
      </label>

      <div className="field">
        <span className="field-label">Frequency</span>
        <div className="segmented">
          {['daily', 'weekly', 'monthly'].map(f => (
            <button
              key={f}
              type="button"
              className={draft.frequency === f ? 'active' : ''}
              onClick={() => update({ frequency: f })}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {draft.frequency === 'daily' && (
        <div className="field">
          <span className="field-label">Repeats</span>
          <div className="weekday-row">
            {WEEKDAY_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => toggleWeekday(i)}
                className={`weekday ${draft.weekdays?.[i] ? 'on' : ''}`}
                style={{
                  background: draft.weekdays?.[i]
                    ? `color-mix(in srgb, ${draft.color} 22%, var(--card-bg))`
                    : undefined,
                  color: draft.weekdays?.[i] ? draft.color : undefined,
                  borderColor: draft.weekdays?.[i] ? draft.color : undefined,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {draft.frequency === 'weekly' && (
        <label className="field">
          <span className="field-label">Target per week</span>
          <input
            type="number"
            min="1"
            max="7"
            value={draft.weeklyTarget || 1}
            onChange={e => update({ weeklyTarget: Math.max(1, Number(e.target.value) || 1) })}
          />
        </label>
      )}

      {draft.frequency === 'monthly' && (
        <label className="field">
          <span className="field-label">Target per month</span>
          <input
            type="number"
            min="1"
            max="31"
            value={draft.monthlyTarget || 1}
            onChange={e => update({ monthlyTarget: Math.max(1, Number(e.target.value) || 1) })}
          />
        </label>
      )}

      <div className="field">
        <span className="field-label">Reminder</span>
        <div className="reminder-row">
          <label className="switch">
            <input
              type="checkbox"
              checked={draft.reminder?.enabled ?? true}
              onChange={e => update({ reminder: { ...draft.reminder, enabled: e.target.checked } })}
            />
            <span className="switch-track" />
            <span className="switch-label">{draft.reminder?.enabled ? 'On' : 'Off'}</span>
          </label>
          <input
            type="time"
            value={draft.reminder?.time || '07:00'}
            onChange={e => update({ reminder: { ...draft.reminder, time: e.target.value } })}
            disabled={!(draft.reminder?.enabled ?? true)}
          />
        </div>
      </div>

      <div className="create-actions">
        {isEditing && (
          <button type="button" className="btn-danger" onClick={remove}>Delete</button>
        )}
        <button type="button" className="btn-secondary" onClick={onDone}>Cancel</button>
        <button
          type="button"
          className="btn-primary"
          onClick={save}
          disabled={!draft.name.trim()}
        >
          {isEditing ? 'Save' : 'Create'}
        </button>
      </div>
    </div>
  )
}
