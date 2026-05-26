import { useState, useEffect } from 'react'
import './crm.css'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import Companies from './pages/Companies'
import Deals from './pages/Deals'
import Tasks from './pages/Tasks'
import Emails from './pages/Emails'
import Marketing from './pages/Marketing'
import Settings from './pages/Settings'
import { useStore, processDueScheduledEmails } from './store'

const PAGES = {
  dashboard: { title: 'Dashboard', Component: Dashboard },
  contacts: { title: 'Contacts', Component: Contacts },
  companies: { title: 'Companies', Component: Companies },
  deals: { title: 'Deals', Component: Deals },
  tasks: { title: 'Tasks', Component: Tasks },
  emails: { title: 'Emails', Component: Emails },
  marketing: { title: 'Marketing', Component: Marketing },
  settings: { title: 'Settings', Component: Settings },
}

function parseHash() {
  const h = (window.location.hash || '').replace(/^#\/?/, '')
  const segs = h.split('/').filter(Boolean)
  return segs[1] || 'dashboard'
}

export default function CrmApp() {
  const state = useStore()
  const [active, setActive] = useState(parseHash())

  useEffect(() => {
    const onHash = () => setActive(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    processDueScheduledEmails()
    const t = setInterval(processDueScheduledEmails, 30000)
    return () => clearInterval(t)
  }, [])

  const navigate = (id) => {
    window.location.hash = `#/crm/${id}`
    setActive(id)
  }

  const page = PAGES[active] || PAGES.dashboard
  const PageComponent = page.Component
  const currentUser = state.owners.find(o => o.id === state.settings.currentUserId)

  return (
    <div className="crm">
      <Sidebar active={active} onNavigate={navigate} />
      <div className="crm-main">
        <div className="crm-topbar">
          <h2 className="crm-topbar__title">{page.title}</h2>
          <div className="crm-topbar__spacer" />
          <span className="crm-topbar__user">
            {state.settings.companyName} · {currentUser?.name}
          </span>
        </div>
        <div className="crm-page">
          <PageComponent onNavigate={navigate} />
        </div>
      </div>
    </div>
  )
}
