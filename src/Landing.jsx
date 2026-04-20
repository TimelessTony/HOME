import './Landing.css'

const APPS = [
  {
    href: '#/rom',
    title: 'ROM Budget Calculator',
    description: 'Rough Order of Magnitude estimator with low, expected, and high ranges.',
    emoji: '💰',
    accent: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  },
  {
    href: '#/habits',
    title: 'Habit Tracker',
    description: 'Daily, weekly, and monthly habits with streaks, analytics, and 7 AM reminders.',
    emoji: '☯️',
    accent: 'linear-gradient(135deg, #fb923c 0%, #ef4444 100%)',
  },
]

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-hero">
        <h1>ROM Suite</h1>
        <p>Plan budgets. Build habits. Ship the year.</p>
      </header>
      <main className="landing-apps">
        {APPS.map(app => (
          <a key={app.href} className="landing-card" href={app.href}>
            <div className="landing-card-badge" style={{ background: app.accent }}>
              <span>{app.emoji}</span>
            </div>
            <h2>{app.title}</h2>
            <p>{app.description}</p>
            <span className="landing-card-arrow">Open →</span>
          </a>
        ))}
      </main>
    </div>
  )
}
