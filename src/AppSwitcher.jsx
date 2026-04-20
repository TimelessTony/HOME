import './AppSwitcher.css'

export default function AppSwitcher({ active }) {
  return (
    <nav className="app-switcher" aria-label="App switcher">
      <a href="#/" className={`switcher-brand ${active === 'home' ? 'active' : ''}`}>
        ROM Suite
      </a>
      <div className="switcher-links">
        <a href="#/rom" className={active === 'rom' ? 'active' : ''}>
          Budget
        </a>
        <a href="#/habits" className={active === 'habits' ? 'active' : ''}>
          Habits
        </a>
      </div>
    </nav>
  )
}
