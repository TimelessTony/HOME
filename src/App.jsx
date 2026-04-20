import { useEffect, useState } from 'react'
import RomApp from './rom/RomApp'
import HabitApp from './habits/HabitApp'
import Landing from './Landing'
import AppSwitcher from './AppSwitcher'
import './App.css'

function getRoute() {
  const hash = window.location.hash.replace(/^#/, '')
  if (hash.startsWith('/rom')) return { app: 'rom', rest: hash.slice(4) }
  if (hash.startsWith('/habits')) return { app: 'habits', rest: hash.slice(7) }
  return { app: 'home', rest: '' }
}

export default function App() {
  const [route, setRoute] = useState(getRoute())

  useEffect(() => {
    const onHash = () => setRoute(getRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      <AppSwitcher active={route.app} />
      {route.app === 'home' && <Landing />}
      {route.app === 'rom' && <RomApp />}
      {route.app === 'habits' && <HabitApp subpath={route.rest} />}
    </>
  )
}
