import { useMemo } from 'react'
import {
  addDays,
  formatDayName,
  formatLongDate,
  startOfMonth,
  startOfWeek,
  toKey,
} from './dates'
import {
  countInRange,
  currentStreak,
  isActiveOn,
  isCompletedOn,
} from './useHabits'

function DotGrid({ color, completions, habit, days = 140 }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cells = []
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i)
    const key = toKey(d)
    const done = Boolean(completions?.[habit.id]?.[key])
    const active = isActiveOn(habit, d)
    cells.push({ key, done, active })
  }
  return (
    <div className="dot-grid">
      {cells.map(cell => (
        <span
          key={cell.key}
          className={`dot ${cell.done ? 'filled' : ''} ${!cell.active ? 'inactive' : ''}`}
          style={{ background: cell.done ? color : undefined }}
          title={cell.key}
        />
      ))}
    </div>
  )
}

function HabitCard({ habit, completions, today, onToggle, onEdit, progressLabel }) {
  const streak = currentStreak(habit, { [habit.id]: completions[habit.id] }, today)
  const todayKey = toKey(today)
  const doneToday = habit.frequency === 'daily'
    ? isCompletedOn(completions, habit.id, today)
    : false
  const periodDone = habit.frequency !== 'daily' && progressLabel?.met

  return (
    <article
      className="habit-card"
      style={{
        background: `color-mix(in srgb, ${habit.color} 18%, var(--card-bg))`,
      }}
    >
      <div className="habit-card-top">
        <button
          type="button"
          className="habit-card-title"
          onClick={() => onEdit(habit.id)}
          aria-label={`Edit ${habit.name}`}
        >
          <span className="habit-card-name">{habit.name}</span>
          {streak > 0 && (
            <span className="habit-card-streak">
              <span aria-hidden="true">🔥</span> {streak}
            </span>
          )}
        </button>
        <div className="habit-card-right">
          <span className="habit-card-icon" aria-hidden="true">{habit.icon}</span>
          <button
            type="button"
            className={`habit-check ${doneToday || periodDone ? 'done' : ''}`}
            style={{
              borderColor: habit.color,
              background: doneToday || periodDone ? habit.color : 'transparent',
            }}
            onClick={() => onToggle(habit.id, todayKey)}
            aria-label={doneToday || periodDone ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
            aria-pressed={doneToday || periodDone}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </button>
        </div>
      </div>

      {progressLabel?.text && (
        <p className="habit-card-progress">{progressLabel.text}</p>
      )}

      <DotGrid color={habit.color} completions={completions} habit={habit} />
    </article>
  )
}

export default function HomeView({ data, today }) {
  const { habits, completions, toggleCompletion } = data

  const { daily, weekly, monthly } = useMemo(() => {
    return {
      daily: habits.filter(h => h.frequency === 'daily'),
      weekly: habits.filter(h => h.frequency === 'weekly'),
      monthly: habits.filter(h => h.frequency === 'monthly'),
    }
  }, [habits])

  const weekStart = startOfWeek(today)
  const weekEnd = addDays(weekStart, 6)
  const monthStart = startOfMonth(today)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  function onEdit(id) {
    window.location.hash = `#/habits/edit/${id}`
  }

  function progressForWeekly(h) {
    const count = countInRange(completions, h.id, weekStart, weekEnd)
    const target = h.weeklyTarget || 1
    return { text: `${count} / ${target} this week`, met: count >= target }
  }
  function progressForMonthly(h) {
    const count = countInRange(completions, h.id, monthStart, monthEnd)
    const target = h.monthlyTarget || 1
    return { text: `${count} / ${target} this month`, met: count >= target }
  }

  return (
    <div className="home-view">
      <header className="home-header">
        <h1>{formatDayName(today)}</h1>
        <p>{formatLongDate(today)}</p>
      </header>

      {daily.length > 0 && (
        <Section title="Daily">
          {daily.map(h => (
            <HabitCard
              key={h.id}
              habit={h}
              completions={completions}
              today={today}
              onToggle={toggleCompletion}
              onEdit={onEdit}
            />
          ))}
        </Section>
      )}

      {weekly.length > 0 && (
        <Section title="Weekly">
          {weekly.map(h => (
            <HabitCard
              key={h.id}
              habit={h}
              completions={completions}
              today={today}
              onToggle={toggleCompletion}
              onEdit={onEdit}
              progressLabel={progressForWeekly(h)}
            />
          ))}
        </Section>
      )}

      {monthly.length > 0 && (
        <Section title="Monthly">
          {monthly.map(h => (
            <HabitCard
              key={h.id}
              habit={h}
              completions={completions}
              today={today}
              onToggle={toggleCompletion}
              onEdit={onEdit}
              progressLabel={progressForMonthly(h)}
            />
          ))}
        </Section>
      )}

      {habits.length === 0 && (
        <div className="home-empty">
          <p>No habits yet.</p>
          <a className="btn-primary" href="#/habits/create">Create your first habit</a>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="habit-section">
      <h2 className="habit-section-title">{title}</h2>
      <div className="habit-section-list">{children}</div>
    </section>
  )
}
