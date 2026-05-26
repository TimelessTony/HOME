import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'timeless-crm-v1'

const DEFAULT_PIPELINE = [
  { id: 'lead', name: 'Lead', probability: 10 },
  { id: 'qualified', name: 'Qualified', probability: 20 },
  { id: 'site_walk', name: 'Site Walk', probability: 35 },
  { id: 'estimating', name: 'Estimating', probability: 50 },
  { id: 'bid_submitted', name: 'Bid Submitted', probability: 65 },
  { id: 'negotiation', name: 'Negotiation', probability: 80 },
  { id: 'awarded', name: 'Awarded', probability: 100, isWon: true },
  { id: 'lost', name: 'Lost', probability: 0, isLost: true },
]

const DEFAULT_PROJECT_TYPES = [
  'Tenant Improvement',
  'Ground-Up Construction',
  'Renovation / Remodel',
  'Adaptive Reuse',
  'Restaurant',
  'Retail',
  'Office',
  'Industrial / Warehouse',
  'Medical / Healthcare',
  'Hospitality',
  'Multi-Family',
  'Other',
]

const DEFAULT_CONTACT_ROLES = [
  'Owner',
  'General Contractor',
  'Architect',
  'Subcontractor',
  'Broker',
  'Property Manager',
  'Developer',
  'Engineer',
  'Vendor',
  'Other',
]

const DEFAULT_OWNERS = [
  { id: 'u1', name: 'Tony J', email: 'tonyj@timelessco.com', role: 'Principal' },
  { id: 'u2', name: 'Sales Rep', email: 'sales@timelessco.com', role: 'Business Development' },
  { id: 'u3', name: 'Estimator', email: 'estimating@timelessco.com', role: 'Estimator' },
]

const DEFAULT_EMAIL_TEMPLATES = [
  {
    id: 't1',
    name: 'Intro — New Prospect',
    category: 'sales',
    subject: 'Introducing Timeless Construction',
    body: 'Hi {{firstName}},\n\nThanks for the connection. Timeless Construction is a commercial GC focused on {{projectType}} projects. Would love to find 15 minutes to learn more about what you have coming up.\n\nBest,\n{{senderName}}',
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    name: 'Post Site-Walk Follow-up',
    category: 'sales',
    subject: 'Following up on our site walk at {{projectAddress}}',
    body: 'Hi {{firstName}},\n\nThanks for the time on site. Quick recap of what we discussed:\n\n- \n- \n- \n\nNext step on our end is to put together a preliminary budget. Expect that back to you by end of week.\n\nThanks,\n{{senderName}}',
    createdAt: new Date().toISOString(),
  },
]

const EMPTY_STATE = {
  schemaVersion: 1,
  owners: DEFAULT_OWNERS,
  pipeline: DEFAULT_PIPELINE,
  projectTypes: DEFAULT_PROJECT_TYPES,
  contactRoles: DEFAULT_CONTACT_ROLES,
  contacts: [],
  companies: [],
  deals: [],
  tasks: [],
  emails: [],
  emailTemplates: DEFAULT_EMAIL_TEMPLATES,
  campaigns: [],
  activities: [],
  settings: {
    brandName: 'Timeless Construction CRM',
    companyName: 'Timeless Construction',
    currentUserId: 'u1',
  },
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(EMPTY_STATE)
    const parsed = JSON.parse(raw)
    return { ...structuredClone(EMPTY_STATE), ...parsed }
  } catch {
    return structuredClone(EMPTY_STATE)
  }
}

function persist(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // localStorage quota or unavailable
  }
}

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4)
}

let state = load()
const listeners = new Set()

function notify() { listeners.forEach(fn => fn()) }
function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }
function getSnapshot() { return state }

function set(updater) {
  state = typeof updater === 'function' ? updater(state) : updater
  persist(state)
  notify()
}

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function getState() { return state }

export function resetAllData() {
  state = structuredClone(EMPTY_STATE)
  persist(state)
  notify()
}

function crud(collection, prefix) {
  return {
    add(data) {
      const id = uid(prefix)
      const now = new Date().toISOString()
      const record = { id, createdAt: now, updatedAt: now, ...data }
      set(s => ({ ...s, [collection]: [record, ...s[collection]] }))
      return id
    },
    update(id, patch) {
      set(s => ({
        ...s,
        [collection]: s[collection].map(r =>
          r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r
        ),
      }))
    },
    remove(id) {
      set(s => ({ ...s, [collection]: s[collection].filter(r => r.id !== id) }))
    },
    bulkAdd(records) {
      const now = new Date().toISOString()
      const stamped = records.map(r => ({
        id: r.id || uid(prefix),
        createdAt: now,
        updatedAt: now,
        ...r,
      }))
      set(s => ({ ...s, [collection]: [...stamped, ...s[collection]] }))
      return stamped.map(r => r.id)
    },
  }
}

export const contacts = crud('contacts', 'ct_')
export const companies = crud('companies', 'co_')
export const deals = crud('deals', 'd_')
export const tasks = crud('tasks', 'tk_')
export const emails = crud('emails', 'em_')
export const emailTemplates = crud('emailTemplates', 'tpl_')
export const campaigns = crud('campaigns', 'cm_')
export const activities = crud('activities', 'a_')

export const settings = {
  update(patch) {
    set(s => ({ ...s, settings: { ...s.settings, ...patch } }))
  },
  setPipeline(pipeline) { set(s => ({ ...s, pipeline })) },
  setProjectTypes(projectTypes) { set(s => ({ ...s, projectTypes })) },
  setContactRoles(contactRoles) { set(s => ({ ...s, contactRoles })) },
  setOwners(owners) { set(s => ({ ...s, owners })) },
}

export function logActivity(entry) {
  return activities.add({
    type: entry.type || 'note',
    body: entry.body || '',
    entityType: entry.entityType,
    entityId: entry.entityId,
    ownerId: entry.ownerId || state.settings.currentUserId,
  })
}

export function markEmailOpened(id) {
  const now = new Date().toISOString()
  set(s => ({
    ...s,
    emails: s.emails.map(e =>
      e.id === id
        ? {
            ...e,
            openedAt: e.openedAt || now,
            openCount: (e.openCount || 0) + 1,
            status: 'opened',
            updatedAt: now,
          }
        : e
    ),
  }))
}

export function sendEmailNow(id) {
  const now = new Date().toISOString()
  set(s => ({
    ...s,
    emails: s.emails.map(e =>
      e.id === id ? { ...e, sentAt: now, status: 'sent', updatedAt: now } : e
    ),
  }))
}

export function processDueScheduledEmails() {
  const now = Date.now()
  let changed = false
  const updated = state.emails.map(e => {
    if (e.status === 'scheduled' && e.scheduledAt && new Date(e.scheduledAt).getTime() <= now) {
      changed = true
      return { ...e, status: 'sent', sentAt: new Date().toISOString() }
    }
    return e
  })
  if (changed) set(s => ({ ...s, emails: updated }))
}
