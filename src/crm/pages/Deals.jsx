import { useState } from 'react'
import { useStore, deals } from '../store'
import RecordDrawer from '../components/RecordDrawer'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import ImportCsvDialog from '../components/ImportCsvDialog'
import { toCSV, downloadCSV } from '../csv'

function money(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0)
}

export default function Deals() {
  const state = useStore()
  const [view, setView] = useState('kanban')
  const [openId, setOpenId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [dropTarget, setDropTarget] = useState(null)

  const onDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }
  const onDragOver = (e, stageId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dropTarget !== stageId) setDropTarget(stageId)
  }
  const onDrop = (e, stageId) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) deals.update(id, { stage: stageId })
    setDropTarget(null)
  }

  const exportCsv = () => {
    const rows = state.deals.map(d => ({
      name: d.name,
      amount: d.amount || 0,
      stage: state.pipeline.find(p => p.id === d.stage)?.name || d.stage,
      projectType: d.projectType || '',
      projectAddress: d.projectAddress || '',
      squareFootage: d.squareFootage || '',
      estStartDate: d.estStartDate || '',
      estCompletionDate: d.estCompletionDate || '',
      company: state.companies.find(c => c.id === d.companyId)?.name || '',
      owner: state.owners.find(o => o.id === d.ownerId)?.name || '',
      notes: d.notes || '',
    }))
    downloadCSV('deals.csv', toCSV(rows))
  }

  return (
    <div>
      <div className="crm-page-header">
        <h1 className="crm-page-header__title">Deals</h1>
        <div className="crm-page-header__spacer" />
        <div className="crm-tabs" style={{ borderBottom: 'none', margin: 0 }}>
          <button className={`crm-tab ${view === 'kanban' ? 'is-active' : ''}`} onClick={() => setView('kanban')}>Board</button>
          <button className={`crm-tab ${view === 'list' ? 'is-active' : ''}`} onClick={() => setView('list')}>List</button>
        </div>
        <button className="crm-btn crm-btn--ghost" onClick={exportCsv} disabled={!state.deals.length}>Export</button>
        <button className="crm-btn crm-btn--ghost" onClick={() => setShowImport(true)}>Import CSV</button>
        <button className="crm-btn" onClick={() => setShowNew(true)}>+ New deal</button>
      </div>

      {state.deals.length === 0 ? (
        <EmptyState
          title="No deals yet"
          hint="Track every bid, negotiated job, and lead from here."
          actionLabel="+ Add a deal"
          onAction={() => setShowNew(true)}
        />
      ) : view === 'kanban' ? (
        <div className="crm-kanban">
          {state.pipeline.map(stage => {
            const stageDeals = state.deals.filter(d => d.stage === stage.id)
            const stageValue = stageDeals.reduce((s, d) => s + (d.amount || 0), 0)
            return (
              <div className="crm-kanban__col" key={stage.id}>
                <div className="crm-kanban__col-header">
                  <span>{stage.name}</span>
                  <span className="crm-kanban__col-count">{stageDeals.length}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, fontWeight: 400 }}>{money(stageValue)}</span>
                </div>
                <div
                  className={`crm-kanban__col-body ${dropTarget === stage.id ? 'is-drop-target' : ''}`}
                  onDragOver={e => onDragOver(e, stage.id)}
                  onDragLeave={() => setDropTarget(null)}
                  onDrop={e => onDrop(e, stage.id)}
                >
                  {stageDeals.map(d => {
                    const company = state.companies.find(c => c.id === d.companyId)
                    return (
                      <div
                        key={d.id}
                        className="crm-kanban__card"
                        draggable
                        onDragStart={e => onDragStart(e, d.id)}
                        onClick={() => setOpenId(d.id)}
                      >
                        <div className="crm-kanban__card-name">{d.name}</div>
                        <div className="crm-kanban__card-meta">
                          {money(d.amount)} {d.projectType && `· ${d.projectType}`}
                        </div>
                        {company && (
                          <div className="crm-kanban__card-meta" style={{ marginTop: 2 }}>
                            {company.name}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <table className="crm-table">
          <thead>
            <tr>
              <th>Deal</th>
              <th>Amount</th>
              <th>Stage</th>
              <th>Project type</th>
              <th>Site</th>
              <th>Company</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {state.deals.map(d => {
              const company = state.companies.find(c => c.id === d.companyId)
              const owner = state.owners.find(o => o.id === d.ownerId)
              const stage = state.pipeline.find(p => p.id === d.stage)
              return (
                <tr key={d.id} onClick={() => setOpenId(d.id)}>
                  <td className="crm-table__name">{d.name}</td>
                  <td>{money(d.amount)}</td>
                  <td>
                    <span className={`crm-badge ${stage?.isWon ? 'crm-badge--success' : stage?.isLost ? 'crm-badge--danger' : 'crm-badge--primary'}`}>
                      {stage?.name || d.stage}
                    </span>
                  </td>
                  <td>{d.projectType || '—'}</td>
                  <td>{d.projectAddress || '—'}</td>
                  <td>{company?.name || '—'}</td>
                  <td>{owner?.name || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {openId && <RecordDrawer key={openId} entity="deals" id={openId} onClose={() => setOpenId(null)} />}
      {showNew && <NewDealModal onClose={() => setShowNew(false)} onCreated={id => { setShowNew(false); setOpenId(id) }} />}
      {showImport && <ImportCsvDialog onClose={() => setShowImport(false)} defaultEntity="deals" />}
    </div>
  )
}

function NewDealModal({ onClose, onCreated }) {
  const state = useStore()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [stage, setStage] = useState(state.pipeline[0].id)
  const [projectType, setProjectType] = useState('')
  const [companyId, setCompanyId] = useState('')

  const create = () => {
    const id = deals.add({
      name: name.trim() || 'Untitled deal',
      amount: parseFloat(amount) || 0,
      stage,
      projectType,
      companyId: companyId || undefined,
      ownerId: state.settings.currentUserId,
    })
    onCreated(id)
  }

  return (
    <Modal
      title="New deal"
      onClose={onClose}
      footer={
        <>
          <button className="crm-btn crm-btn--ghost" onClick={onClose}>Cancel</button>
          <button className="crm-btn" onClick={create} disabled={!name.trim()}>Create</button>
        </>
      }
    >
      <div className="crm-field"><label>Deal name</label><input value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="e.g. Main St TI for ACME" /></div>
      <div className="crm-field-row">
        <div className="crm-field"><label>Amount ($)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
        <div className="crm-field">
          <label>Stage</label>
          <select value={stage} onChange={e => setStage(e.target.value)}>
            {state.pipeline.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>
      <div className="crm-field">
        <label>Project type</label>
        <select value={projectType} onChange={e => setProjectType(e.target.value)}>
          <option value="">—</option>
          {state.projectTypes.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="crm-field">
        <label>Company</label>
        <select value={companyId} onChange={e => setCompanyId(e.target.value)}>
          <option value="">— None —</option>
          {state.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    </Modal>
  )
}
