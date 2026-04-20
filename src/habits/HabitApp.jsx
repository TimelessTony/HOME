import useHabits, { useToday } from './useHabits'
import HomeView from './HomeView'
import AnalyticsView from './AnalyticsView'
import CreateHabitView from './CreateHabitView'
import SettingsView from './SettingsView'
import './habits.css'

function parseSubpath(subpath) {
  const raw = (subpath || '').replace(/^\/+/, '')
  if (!raw || raw === '') return { view: 'home' }
  const [view, param] = raw.split('/')
  if (view === 'analytics') return { view: 'analytics' }
  if (view === 'create') return { view: 'create' }
  if (view === 'edit') return { view: 'edit', id: param }
  if (view === 'settings') return { view: 'settings' }
  return { view: 'home' }
}

function navigate(to) {
  window.location.hash = `#/habits${to}`
}

export default function HabitApp({ subpath }) {
  const data = useHabits()
  const today = useToday()
  const { view, id } = parseSubpath(subpath)

  return (
    <div className="habit-app">
      <div className="habit-shell">
        {view === 'home' && <HomeView data={data} today={today} />}
        {view === 'analytics' && <AnalyticsView data={data} today={today} />}
        {view === 'create' && (
          <CreateHabitView
            key="new"
            data={data}
            onDone={() => navigate('')}
          />
        )}
        {view === 'edit' && (
          <CreateHabitView
            key={id}
            data={data}
            editId={id}
            onDone={() => navigate('')}
          />
        )}
        {view === 'settings' && <SettingsView data={data} />}
      </div>

      <nav className="habit-nav" aria-label="Habit navigation">
        <NavButton active={view === 'settings'} label="Settings" onClick={() => navigate('/settings')}>
          <SvgGear />
        </NavButton>
        <NavButton active={view === 'analytics'} label="Analytics" onClick={() => navigate('/analytics')}>
          <SvgChart />
        </NavButton>
        <NavButton active={view === 'home'} label="Home" onClick={() => navigate('')}>
          <SvgHome />
        </NavButton>
        <NavButton active={view === 'create'} label="Add habit" onClick={() => navigate('/create')}>
          <SvgPlus />
        </NavButton>
      </nav>
    </div>
  )
}

function NavButton({ active, label, onClick, children }) {
  return (
    <button
      type="button"
      className={`habit-nav-btn ${active ? 'active' : ''}`}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </button>
  )
}

function SvgHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  )
}
function SvgGear() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  )
}
function SvgChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17 9 11l4 4 8-9" />
      <path d="M17 6h4v4" />
    </svg>
  )
}
function SvgPlus() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}
