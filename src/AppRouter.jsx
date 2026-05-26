import { useEffect, useState, Suspense, lazy } from 'react'
import Launcher from './Launcher'
import App from './App'

const CrmApp = lazy(() => import('./crm/CrmApp'))

function parseHash() {
  const h = (window.location.hash || '').replace(/^#\/?/, '')
  const top = h.split('/')[0] || ''
  return top
}

export default function AppRouter() {
  const [route, setRoute] = useState(parseHash())

  useEffect(() => {
    const onHash = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route === 'rom') return <App />
  if (route === 'crm') {
    return (
      <Suspense fallback={<div style={{ padding: 40, fontFamily: 'sans-serif' }}>Loading CRM…</div>}>
        <CrmApp />
      </Suspense>
    )
  }
  return <Launcher />
}
