// Build .ics files for calendar subscriptions and Microsoft To-Do deep links.

function pad(n) { return String(n).padStart(2, '0') }

function icsEscape(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function localStamp(date) {
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    '00'
  )
}

function utcStamp(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    '00Z'
  )
}

function rruleForHabit(habit) {
  if (habit.frequency === 'daily') {
    const map = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
    const days = (habit.weekdays || map.map(() => true))
      .map((on, i) => (on ? map[i] : null))
      .filter(Boolean)
    if (days.length === 7) return 'RRULE:FREQ=DAILY'
    return `RRULE:FREQ=WEEKLY;BYDAY=${days.join(',')}`
  }
  if (habit.frequency === 'weekly') return 'RRULE:FREQ=WEEKLY'
  if (habit.frequency === 'monthly') return 'RRULE:FREQ=MONTHLY'
  return 'RRULE:FREQ=DAILY'
}

function nextStartFor(timeStr) {
  const [h, m] = (timeStr || '07:00').split(':').map(Number)
  const start = new Date()
  start.setHours(h, m || 0, 0, 0)
  if (start < new Date()) start.setDate(start.getDate() + 1)
  return start
}

export function buildIcs(habits, { calendarName = 'ROM Habits' } = {}) {
  const enabled = habits.filter(h => h.reminder?.enabled !== false)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ROM Suite//Habit Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${icsEscape(calendarName)}`,
    'X-PUBLISHED-TTL:PT1H',
  ]
  const now = new Date()
  for (const habit of enabled) {
    const start = nextStartFor(habit.reminder?.time || '07:00')
    const end = new Date(start.getTime() + 15 * 60 * 1000)
    lines.push(
      'BEGIN:VEVENT',
      `UID:habit-${habit.id}@rom-suite`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${localStamp(start)}`,
      `DTEND:${localStamp(end)}`,
      rruleForHabit(habit),
      `SUMMARY:${icsEscape(habit.icon + ' ' + habit.name)}`,
      `DESCRIPTION:${icsEscape((habit.motivation || 'Habit reminder') + '\n\nOpen: ' + (typeof window !== 'undefined' ? window.location.origin + '/#/habits' : '#/habits'))}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsEscape(habit.name)}`,
      'TRIGGER:PT0M',
      'END:VALARM',
      'END:VEVENT'
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadIcs(habits) {
  const body = buildIcs(habits)
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rom-habits.ics'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Microsoft To-Do: the app has no universal URL scheme for creating tasks with
// recurrence. The most reliable path is Outlook Web "new task" — it creates a
// task in the user's default list, which Microsoft To-Do mirrors.
export function microsoftTodoUrl(habit) {
  const title = encodeURIComponent(habit.icon + ' ' + habit.name)
  const body = encodeURIComponent(habit.motivation || 'Habit reminder from ROM Habits')
  // Deep link to Outlook Web with pre-filled subject; user taps the bell to set
  // reminder time. Works on desktop and iOS/Android web.
  return `https://to-do.live.com/tasks/new?subject=${title}&body=${body}`
}

export function microsoftTodoBulkInstructions() {
  return (
    'Microsoft To-Do does not accept bulk imports with recurrence from the web. ' +
    'For repeating tasks, either (a) add them in Outlook Web once (Tasks → New) and ' +
    'they will appear in To-Do, or (b) subscribe to the .ics calendar — Outlook ' +
    'reminders will show in Teams and Outlook notifications at 7 AM.'
  )
}
