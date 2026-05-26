import './Launcher.css'

const APPS = [
  {
    id: 'rom',
    title: 'ROM Budget Calculator',
    description: 'Rough Order of Magnitude estimator with low / expected / high ranges.',
    href: '#/rom',
    accent: '#2563EB',
  },
  {
    id: 'crm',
    title: 'Timeless Construction CRM',
    description: 'Contacts, companies, deals, tasks, and email tracking — built for a commercial GC sales motion.',
    href: '#/crm',
    accent: '#FF6B1A',
  },
]

export default function Launcher() {
  return (
    <div className="launcher">
      <header className="launcher__header">
        <h1>Timeless Construction</h1>
        <p>Internal tools</p>
      </header>
      <div className="launcher__grid">
        {APPS.map(app => (
          <a key={app.id} className="launcher__card" href={app.href} style={{ '--accent': app.accent }}>
            <div className="launcher__card-title">{app.title}</div>
            <div className="launcher__card-desc">{app.description}</div>
            <div className="launcher__card-cta">Open →</div>
          </a>
        ))}
      </div>
    </div>
  )
}
