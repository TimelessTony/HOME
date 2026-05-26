import { useState, useMemo } from 'react'
import { useStore, tasks } from '../store'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'

export default function Tasks() {
  const state = useStore()
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('open')

  const todayStr = new Date().toISOString().slice(0, 10)

  const list = useMemo(() => {
    let l = [...state.tasks]
    if (filter === 'open') l = l.filter(t => t.status !== 'done')
    if (filter === 'done') l = l.filter(t => t.status === 'done')
    if (filter === 'overdue') l = l.filter(t => t.status !== 'done' && t.dueDate && t.dueDate.slice(0, 10) < todayStr)
    if (filter === 'today') l = l.filter(t => t.status !== 'done' && t.dueDate && t.dueDate.slice(0, 10) === todayStr)
    return l.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
  }, [state.tasks, filter, todayStr])

  const toggle = (t) => {
    tasks.update(t.id, {
      status: t.status === 'done' ? 'todo' : 'done',
      completedAt: t.status === 'done' ? null : new Date().toISOString(),
    })
  }
  const remove = (id) => {
    if (confirm('Delete task?')) tasks.remove(id)
  }

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-header__title">Tasks</h1>
        <div className="crm-page-header__spacer" />
        <button className="crm-btn" onClick={() => setShowNew(true)}>+ New task</button>
      </div>

      <div className="crm-tabs">
        {['open', 'today', 'overdue', 'done', 'all'].map(f => (
          <button key={f} className={`crm-tab ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
            {f === 'overdue' && state.tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate.slice(0,10) < todayStr).length > 0 && (
              <span className="crm-badge crm-badge--danger" style={{ marginLeft: 6 }}>
                {state.tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate.slice(0,10) < todayStr).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No tasks here"
          hint="Create tasks for follow-ups, site walks, bid deadlines, etc."
          actionLabel="+ New task"
          onAction={() => setShowNew(true)}
        />
      ) : (
        <div className="crm-list">
          {list.map(t => {
            const owner = state.owners.find(o => o.id === t.assigneeId)
            const overdue = t.status !== 'done' && t.dueDate && t.dueDate.slice(0, 10) < todayStr
            return (
              <div key={t.id} className={`crm-list__item ${t.status === 'done' ? 'is-done' : ''}`}>
                <input
                  type="checkbox"
                  checked={t.status === 'done'}
                  onChange={() => toggle(t)}
                  style={{ width: 18, height: 18 }}
                />
                <div>
                  <div className="crm-list__item-title">{t.title}</div>
                  <div className="crm-list__item-meta">
                    {t.dueDate && <>Due {t.dueDate.slice(0, 10)} </>}
                    {owner && <>· {owner.name} </>}
                    {t.priority && <>· <span className={`crm-badge ${t.priority === 'high' ? 'crm-badge--danger' : t.priority === 'med' ? 'crm-badge--warn' : ''}`}>{t.priority}</span> </>}
                    {overdue && <span className="crm-badge crm-badge--danger" style={{ marginLeft: 4 }}>Overdue</span>}
                  </div>
                </div>
                <div className="crm-list__item-spacer" />
                <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => remove(t.id)}>Delete</button>
              </div>
            )
          })}
        </div>
      )}

      {showNew && <NewTaskModal onClose={() => setShowNew(false)} />}
    </div>
  )
}

function NewTaskModal({ onClose }) {
  const state = useStore()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('med')
  const [assigneeId, setAssigneeId] = useState(state.settings.currentUserId)
  const [description, setDescription] = useState('')

  const create = () => {
    if (!title.trim()) return
    tasks.add({ title: title.trim(), dueDate, priority, assigneeId, description, status: 'todo' })
    onClose()
  }

  return (
    <Modal
      title="New task"
      onClose={onClose}
      footer={
        <>
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn" onClick={create} disabled={!title.trim()}>Create</button>
        </>
      }
    >
      <div className="crm-field"><label>Title</label><input value={title} onChange={e => setTitle(e.target.value)} autoFocus /></div>
      <div className="crm-field-row">
        <div className="crm-field"><label>Due date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
        <div className="crm-field">
          <label>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="med">Med</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="crm-field">
        <label>Assignee</label>
        <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
          {state.owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <div className="crm-field"><label>Notes</label><textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
    </Modal>
  )
}
