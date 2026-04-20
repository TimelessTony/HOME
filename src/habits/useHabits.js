import { useCallback, useEffect, useMemo, useState } from 'react'
import { buildDefaultHabits } from './defaults'
import {
  addDays,
  fromKey,
  monthKey,
  startOfMonth,
  startOfWeek,
  toKey,
  weekdayIndex,
} from './dates'

const STORAGE_KEY = 'rom.habits.v1'

function loadState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore quota errors
  }
}

function initialState() {
  const stored = loadState()
  if (stored) return stored
  return {
    habits: buildDefaultHabits(),
    completions: {},
    settings: { reminderTime: '07:00', weekStartsOn: 'mon' },
  }
}

export default function useHabits() {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const addHabit = useCallback((habit) => {
    setState(s => ({ ...s, habits: [...s.habits, habit] }))
  }, [])

  const updateHabit = useCallback((id, updates) => {
    setState(s => ({
      ...s,
      habits: s.habits.map(h => (h.id === id ? { ...h, ...updates } : h)),
    }))
  }, [])

  const removeHabit = useCallback((id) => {
    setState(s => {
      const { [id]: _discard, ...rest } = s.completions
      return {
        ...s,
        habits: s.habits.filter(h => h.id !== id),
        completions: rest,
      }
    })
  }, [])

  const toggleCompletion = useCallback((habitId, dateKey) => {
    setState(s => {
      const existing = s.completions[habitId] || {}
      const next = { ...existing }
      if (next[dateKey]) delete next[dateKey]
      else next[dateKey] = true
      return { ...s, completions: { ...s.completions, [habitId]: next } }
    })
  }, [])

  const updateSettings = useCallback((updates) => {
    setState(s => ({ ...s, settings: { ...s.settings, ...updates } }))
  }, [])

  const resetAll = useCallback(() => {
    if (!window.confirm('Reset all habits and completions to defaults?')) return
    setState({
      habits: buildDefaultHabits(),
      completions: {},
      settings: { reminderTime: '07:00', weekStartsOn: 'mon' },
    })
  }, [])

  return {
    ...state,
    addHabit,
    updateHabit,
    removeHabit,
    toggleCompletion,
    updateSettings,
    resetAll,
  }
}

// --- Pure helpers for derived data ----

export function isActiveOn(habit, date) {
  if (habit.frequency === 'daily') {
    const idx = weekdayIndex(date)
    const weekdays = habit.weekdays || [true, true, true, true, true, true, true]
    return weekdays[idx] !== false
  }
  return true
}

export function isCompletedOn(completions, habitId, date) {
  return Boolean(completions?.[habitId]?.[toKey(date)])
}

export function countInRange(completions, habitId, startDate, endDate) {
  const entries = completions?.[habitId]
  if (!entries) return 0
  let count = 0
  for (const key of Object.keys(entries)) {
    const d = fromKey(key)
    if (d >= startDate && d <= endDate) count++
  }
  return count
}

export function currentStreak(habit, completions, today = new Date()) {
  const entries = completions?.[habit.id]
  if (!entries) return 0

  if (habit.frequency === 'daily') {
    let streak = 0
    let cursor = new Date(today)
    cursor.setHours(0, 0, 0, 0)
    // Skip today if not yet completed
    if (!entries[toKey(cursor)]) cursor = addDays(cursor, -1)
    while (true) {
      if (!isActiveOn(habit, cursor)) {
        cursor = addDays(cursor, -1)
        continue
      }
      if (entries[toKey(cursor)]) {
        streak++
        cursor = addDays(cursor, -1)
      } else {
        break
      }
      if (streak > 3650) break
    }
    return streak
  }

  if (habit.frequency === 'weekly') {
    const target = habit.weeklyTarget || 1
    let streak = 0
    let weekStart = startOfWeek(today)
    while (true) {
      const weekEnd = addDays(weekStart, 6)
      const count = countInRange(completions, habit.id, weekStart, weekEnd)
      const isCurrent = weekStart.getTime() === startOfWeek(today).getTime()
      if (count >= target) {
        streak++
      } else if (isCurrent) {
        // in-progress week doesn't break streak
      } else {
        break
      }
      weekStart = addDays(weekStart, -7)
      if (streak > 520) break
    }
    return streak
  }

  if (habit.frequency === 'monthly') {
    const target = habit.monthlyTarget || 1
    let streak = 0
    let cursor = startOfMonth(today)
    while (true) {
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
      const count = countInRange(completions, habit.id, cursor, monthEnd)
      const isCurrent = monthKey(cursor) === monthKey(today)
      if (count >= target) {
        streak++
      } else if (isCurrent) {
        // ignore
      } else {
        break
      }
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
      if (streak > 240) break
    }
    return streak
  }

  return 0
}

export function bestStreak(habit, completions) {
  const entries = completions?.[habit.id]
  if (!entries) return 0
  const keys = Object.keys(entries).sort()
  if (keys.length === 0) return 0

  if (habit.frequency === 'daily') {
    let best = 0
    let current = 0
    let prev = null
    for (const key of keys) {
      const d = fromKey(key)
      if (!prev) {
        current = 1
      } else {
        const gap = Math.round((d - prev) / (1000 * 60 * 60 * 24))
        if (gap === 1) current++
        else current = 1
      }
      if (current > best) best = current
      prev = d
    }
    return best
  }
  // Weekly/monthly: approximate via counts vs target — just return current
  return currentStreak(habit, completions)
}

export function totalReps(completions, habitId) {
  return Object.keys(completions?.[habitId] || {}).length
}

export function useToday() {
  const [today, setToday] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      if (toKey(now) !== toKey(today)) setToday(now)
    }, 60 * 1000)
    return () => clearInterval(id)
  }, [today])
  return today
}

export function useMemoizedHabits(habits) {
  return useMemo(() => habits, [habits])
}
