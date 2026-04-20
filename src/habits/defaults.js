export const COLORS = [
  '#fb923c', // orange
  '#f59e0b', // amber
  '#22c55e', // green
  '#14b8a6', // teal
  '#38bdf8', // sky
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#a855f7', // purple
  '#ec4899', // pink
  '#ef4444', // red
]

export const ALL_WEEKDAYS = [true, true, true, true, true, true, true]

function id() {
  return Math.random().toString(36).slice(2, 10)
}

export function buildDefaultHabits() {
  const now = new Date().toISOString()
  return [
    // Daily
    { id: id(), name: 'Gym / Yoga', icon: '🏋️', color: '#ef4444', motivation: 'Move every day', frequency: 'daily', weekdays: ALL_WEEKDAYS, reminder: { enabled: true, time: '07:00' }, createdAt: now },
    { id: id(), name: 'Affirmations', icon: '🗣️', color: '#f59e0b', motivation: 'Set the tone', frequency: 'daily', weekdays: ALL_WEEKDAYS, reminder: { enabled: true, time: '07:00' }, createdAt: now },
    { id: id(), name: 'Meditation', icon: '🧘', color: '#22c55e', motivation: 'Quiet the mind', frequency: 'daily', weekdays: ALL_WEEKDAYS, reminder: { enabled: true, time: '07:00' }, createdAt: now },
    { id: id(), name: '3 Priorities / ID / Compound', icon: '🎯', color: '#14b8a6', motivation: 'Top 3 before noon', frequency: 'daily', weekdays: ALL_WEEKDAYS, reminder: { enabled: true, time: '07:00' }, createdAt: now },
    { id: id(), name: 'Sauna', icon: '🔥', color: '#fb923c', motivation: 'Heat for recovery', frequency: 'daily', weekdays: ALL_WEEKDAYS, reminder: { enabled: true, time: '07:00' }, createdAt: now },
    { id: id(), name: 'Cold Plunge', icon: '🧊', color: '#38bdf8', motivation: 'Cold for clarity', frequency: 'daily', weekdays: ALL_WEEKDAYS, reminder: { enabled: true, time: '07:00' }, createdAt: now },
    // Weekly
    { id: id(), name: 'Call Parents', icon: '📞', color: '#a855f7', motivation: 'Stay connected', frequency: 'weekly', weeklyTarget: 1, reminder: { enabled: true, time: '10:00' }, createdAt: now },
    { id: id(), name: 'Score Card Updated', icon: '📊', color: '#3b82f6', motivation: 'Know the numbers', frequency: 'weekly', weeklyTarget: 1, reminder: { enabled: true, time: '09:00' }, createdAt: now },
    { id: id(), name: 'One Sheet Reviewed', icon: '📄', color: '#6366f1', motivation: 'Keep strategy sharp', frequency: 'weekly', weeklyTarget: 1, reminder: { enabled: true, time: '09:00' }, createdAt: now },
    { id: id(), name: 'Updates Received from Team', icon: '📝', color: '#14b8a6', motivation: 'Stay aligned', frequency: 'weekly', weeklyTarget: 1, reminder: { enabled: false, time: '09:00' }, createdAt: now },
    { id: id(), name: 'Hold Team Accountable', icon: '🤝', color: '#22c55e', motivation: 'Lead with standards', frequency: 'weekly', weeklyTarget: 1, reminder: { enabled: false, time: '09:00' }, createdAt: now },
    { id: id(), name: 'Intranet', icon: '🌐', color: '#ec4899', motivation: 'Publish updates', frequency: 'weekly', weeklyTarget: 1, reminder: { enabled: false, time: '09:00' }, createdAt: now },
    // Monthly
    { id: id(), name: 'Date with Connie', icon: '❤️', color: '#ef4444', motivation: 'Protect the relationship', frequency: 'monthly', monthlyTarget: 1, reminder: { enabled: true, time: '09:00' }, createdAt: now },
    { id: id(), name: 'Contracts Closed', icon: '📑', color: '#f59e0b', motivation: 'Win the month', frequency: 'monthly', monthlyTarget: 1, reminder: { enabled: false, time: '09:00' }, createdAt: now },
    { id: id(), name: 'Read 2 Books', icon: '📚', color: '#6366f1', motivation: 'A lifelong learner', frequency: 'monthly', monthlyTarget: 2, reminder: { enabled: false, time: '09:00' }, createdAt: now },
  ]
}

export function newHabit(overrides = {}) {
  return {
    id: id(),
    name: '',
    icon: '✅',
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    motivation: '',
    frequency: 'daily',
    weekdays: ALL_WEEKDAYS,
    weeklyTarget: 1,
    monthlyTarget: 1,
    reminder: { enabled: true, time: '07:00' },
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}
