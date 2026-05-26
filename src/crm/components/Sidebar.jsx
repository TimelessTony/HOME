const NAV = [
  { group: 'Workspace', items: [
    { id: 'dashboard', label: 'Dashboard' },
  ]},
  { group: 'CRM', items: [
    { id: 'contacts', label: 'Contacts' },
    { id: 'companies', label: 'Companies' },
    { id: 'deals', label: 'Deals' },
  ]},
  { group: 'Engage', items: [
    { id: 'tasks', label: 'Tasks' },
    { id: 'emails', label: 'Emails' },
    { id: 'marketing', label: 'Marketing' },
  ]},
  { group: 'Admin', items: [
    { id: 'settings', label: 'Settings' },
  ]},
]

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="crm-sidebar">
      <div className="crm-sidebar__brand">
        <div className="crm-sidebar__brand-title">
          Timeless <span className="crm-sidebar__brand-accent">Construction</span>
        </div>
        <div className="crm-sidebar__brand-sub">CRM</div>
      </div>
      {NAV.map(group => (
        <div key={group.group}>
          <div className="crm-sidebar__group-label">{group.group}</div>
          <nav className="crm-sidebar__nav">
            {group.items.map(item => (
              <button
                key={item.id}
                type="button"
                className={`crm-sidebar__item ${active === item.id ? 'is-active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      ))}
      <div className="crm-sidebar__back">
        <a href="#/">← Back to launcher</a>
      </div>
    </aside>
  )
}
