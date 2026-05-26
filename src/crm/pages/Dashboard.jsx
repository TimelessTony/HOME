import { useStore } from '../store'

function money(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
}

function isOpen(stage, pipeline) {
  const s = pipeline.find(p => p.id === stage)
  return s && !s.isWon && !s.isLost
}

export default function Dashboard({ onNavigate }) {
  const state = useStore()
  const openDeals = state.deals.filter(d => isOpen(d.stage, state.pipeline))
  const wonDeals = state.deals.filter(d => state.pipeline.find(p => p.id === d.stage)?.isWon)
  const pipelineValue = openDeals.reduce((s, d) => s + (d.amount || 0), 0)
  const wonValue = wonDeals.reduce((s, d) => s + (d.amount || 0), 0)
  const todayStr = new Date().toISOString().slice(0, 10)
  const tasksDueToday = state.tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate.slice(0, 10) === todayStr)
  const tasksOverdue = state.tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate.slice(0, 10) < todayStr)

  const stageCounts = state.pipeline.map(p => ({
    ...p,
    count: state.deals.filter(d => d.stage === p.id).length,
    value: state.deals.filter(d => d.stage === p.id).reduce((s, d) => s + (d.amount || 0), 0),
  }))

  const recentContacts = [...state.contacts].slice(0, 5)

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-header__title">Dashboard</h1>
        <div className="crm-page-header__spacer" />
      </div>

      <div className="crm-kpis">
        <div className="crm-kpi">
          <div className="crm-kpi__label">Open Pipeline</div>
          <div className="crm-kpi__value">{money(pipelineValue)}</div>
          <div className="crm-kpi__sub">{openDeals.length} open deals</div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi__label">Awarded YTD</div>
          <div className="crm-kpi__value">{money(wonValue)}</div>
          <div className="crm-kpi__sub">{wonDeals.length} won deals</div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi__label">Contacts</div>
          <div className="crm-kpi__value">{state.contacts.length}</div>
          <div className="crm-kpi__sub">{state.companies.length} companies</div>
        </div>
        <div className="crm-kpi">
          <div className="crm-kpi__label">Tasks Due Today</div>
          <div className="crm-kpi__value">{tasksDueToday.length}</div>
          <div className="crm-kpi__sub">
            <span style={{ color: tasksOverdue.length ? 'var(--crm-danger)' : 'inherit' }}>
              {tasksOverdue.length} overdue
            </span>
          </div>
        </div>
      </div>

      <div className="crm-two-col">
        <div className="crm-card">
          <div className="crm-card__header">
            <h3 className="crm-card__title">Pipeline by stage</h3>
            <div className="crm-page-header__spacer" />
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => onNavigate('deals')}>View deals</button>
          </div>
          <div className="crm-card__body">
            {stageCounts.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 130, fontSize: 13 }}>{s.name}</div>
                <div style={{ flex: 1, background: '#F0F2F4', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{
                    width: pipelineValue ? `${Math.min(100, (s.value / Math.max(pipelineValue, 1)) * 100)}%` : '0%',
                    background: s.isWon ? 'var(--crm-success)' : s.isLost ? 'var(--crm-danger)' : 'var(--crm-primary)',
                    height: '100%',
                  }} />
                </div>
                <div style={{ width: 90, textAlign: 'right', fontSize: 12, color: 'var(--crm-text-muted)' }}>{money(s.value)}</div>
                <div style={{ width: 30, textAlign: 'right', fontSize: 12 }}>{s.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="crm-card">
          <div className="crm-card__header">
            <h3 className="crm-card__title">Tasks today</h3>
            <div className="crm-page-header__spacer" />
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => onNavigate('tasks')}>All tasks</button>
          </div>
          <div className="crm-card__body" style={{ padding: 0 }}>
            {tasksDueToday.length === 0 && tasksOverdue.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--crm-text-muted)', fontSize: 13 }}>
                Nothing due. Go close a deal.
              </div>
            )}
            {[...tasksOverdue, ...tasksDueToday].slice(0, 8).map(t => (
              <div key={t.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--crm-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: 'var(--crm-text-muted)' }}>
                  Due {t.dueDate?.slice(0, 10)} {tasksOverdue.includes(t) && <span className="crm-badge crm-badge--danger">Overdue</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="crm-two-col" style={{ marginTop: 16 }}>
        <div className="crm-card">
          <div className="crm-card__header">
            <h3 className="crm-card__title">Recent contacts</h3>
            <div className="crm-page-header__spacer" />
            <button className="crm-btn crm-btn--ghost crm-btn--sm" onClick={() => onNavigate('contacts')}>All contacts</button>
          </div>
          <div className="crm-card__body" style={{ padding: 0 }}>
            {recentContacts.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--crm-text-muted)', fontSize: 13 }}>
                No contacts yet.
              </div>
            ) : recentContacts.map(c => (
              <div key={c.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--crm-border)' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {`${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email || '(unnamed)'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--crm-text-muted)' }}>
                  {c.title || c.role || ''} {c.email && `· ${c.email}`}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="crm-card">
          <div className="crm-card__header">
            <h3 className="crm-card__title">Recent activity</h3>
          </div>
          <div className="crm-card__body" style={{ padding: 0 }}>
            {state.activities.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--crm-text-muted)', fontSize: 13 }}>
                No activity logged.
              </div>
            ) : state.activities.slice(0, 8).map(a => (
              <div key={a.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--crm-border)' }}>
                <div style={{ fontSize: 11, color: 'var(--crm-text-muted)' }}>
                  {new Date(a.createdAt).toLocaleString()} · {a.type}
                </div>
                <div style={{ fontSize: 13 }}>{a.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
