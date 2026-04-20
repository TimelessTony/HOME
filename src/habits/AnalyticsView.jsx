import { useMemo, useState } from 'react'
import { startOfMonth, toKey, weekdayIndex } from './dates'
import { bestStreak, currentStreak, totalReps } from './useHabits'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

function CalendarGrid({ month, year, color, completions, habitId }) {
  const monthStart = new Date(year, month, 1)
  const leadingEmpty = weekdayIndex(monthStart)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((leadingEmpty + daysInMonth) / 7) * 7
  const cells = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - leadingEmpty + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ empty: true, key: `e-${i}` })
      continue
    }
    const d = new Date(year, month, dayNum)
    const key = toKey(d)
    const done = Boolean(completions?.[habitId]?.[key])
    cells.push({ dayNum, done, key })
  }
  return (
    <div className="cal-grid">
      {WEEKDAYS_SHORT.map(d => <div key={d} className="cal-head">{d}</div>)}
      {cells.map(cell => (
        <div
          key={cell.key}
          className={`cal-cell ${cell.done ? 'done' : ''} ${cell.empty ? 'empty' : ''}`}
          style={cell.done ? { background: color, color: 'white' } : undefined}
        >
          {!cell.empty && cell.dayNum}
        </div>
      ))}
    </div>
  )
}

function YearInPixels({ color, completions, habitId, year }) {
  const months = []
  for (let m = 0; m < 12; m++) {
    const daysInMonth = new Date(year, m + 1, 0).getDate()
    const days = []
    for (let d = 1; d <= 31; d++) {
      if (d > daysInMonth) {
        days.push({ empty: true, key: `${m}-${d}` })
      } else {
        const key = toKey(new Date(year, m, d))
        days.push({ done: Boolean(completions?.[habitId]?.[key]), key })
      }
    }
    months.push(days)
  }
  return (
    <div className="year-pixels">
      <div className="year-pixels-row header">
        {months.map((_, i) => (
          <div key={i} className="year-pixels-label">{MONTHS[i][0]}</div>
        ))}
      </div>
      <div className="year-pixels-body">
        {Array.from({ length: 31 }).map((_, dayIdx) => (
          <div key={dayIdx} className="year-pixels-row">
            {months.map((days, monthIdx) => {
              const cell = days[dayIdx]
              if (cell.empty) {
                return <div key={monthIdx} className="year-pixel empty" />
              }
              return (
                <div
                  key={monthIdx}
                  className="year-pixel"
                  style={{ background: cell.done ? color : undefined }}
                  title={cell.key}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsView({ data, today }) {
  const { habits, completions } = data
  const [selectedId, setSelectedId] = useState(habits[0]?.id || null)

  const habit = useMemo(
    () => habits.find(h => h.id === selectedId) || habits[0],
    [habits, selectedId]
  )

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today))

  if (!habit) {
    return (
      <div className="analytics-view">
        <h1>Analytics</h1>
        <p className="home-empty">Create a habit to see analytics.</p>
      </div>
    )
  }

  const reps = totalReps(completions, habit.id)
  const streak = currentStreak(habit, completions, today)
  const best = bestStreak(habit, completions)

  const year = today.getFullYear()

  function shiftMonth(delta) {
    setViewMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  return (
    <div className="analytics-view">
      <h1>Analytics</h1>

      <div className="analytics-pills">
        {habits.map(h => (
          <button
            key={h.id}
            type="button"
            onClick={() => setSelectedId(h.id)}
            className={`analytics-pill ${h.id === habit.id ? 'active' : ''}`}
            style={{
              color: h.color,
              borderColor: h.id === habit.id ? h.color : 'transparent',
              background: h.id === habit.id
                ? `color-mix(in srgb, ${h.color} 15%, var(--card-bg))`
                : `color-mix(in srgb, ${h.color} 8%, var(--card-bg))`,
            }}
          >
            {h.name}
          </button>
        ))}
      </div>

      <div className="analytics-stats">
        <Stat value={reps} label="Repetitions" color={habit.color} />
        <Stat value={streak} label="Streak" color={habit.color} />
        <Stat value={best} label="Best Streak" color={habit.color} />
      </div>

      <div className="analytics-calendar">
        <div className="analytics-cal-head">
          <button className="cal-nav" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
          <h3>{MONTHS[viewMonth.getMonth()].toUpperCase()} {viewMonth.getFullYear()}</h3>
          <button className="cal-nav" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
        </div>
        <CalendarGrid
          month={viewMonth.getMonth()}
          year={viewMonth.getFullYear()}
          color={habit.color}
          completions={completions}
          habitId={habit.id}
        />
      </div>

      <div className="analytics-year">
        <h3>{year} IN PIXELS</h3>
        <YearInPixels
          color={habit.color}
          completions={completions}
          habitId={habit.id}
          year={year}
        />
      </div>
    </div>
  )
}

function Stat({ value, label, color }) {
  return (
    <div className="stat" style={{ background: `color-mix(in srgb, ${color} 12%, var(--card-bg))` }}>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
