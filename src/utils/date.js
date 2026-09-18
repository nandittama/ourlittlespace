import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { TIMEZONE } from '../config'

export const JAKARTA_TZ = TIMEZONE || 'Asia/Jakarta'

export function getJakartaParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: JAKARTA_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const get = (type) => parts.find((p) => p.type === type)?.value
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour') === '24' ? '0' : get('hour')),
    minute: Number(get('minute')),
  }
}

export function getJakartaDateString(date = new Date()) {
  const { year, month, day } = getJakartaParts(date)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function isJakartaToday(dateValue) {
  if (!dateValue) return false
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue === getJakartaDateString()
  }
  return getJakartaDateString(new Date(dateValue)) === getJakartaDateString()
}

export function parseDateOnly(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

export function daysBetween(startIso, endIso) {
  const a = parseDateOnly(startIso)
  const b = parseDateOnly(endIso)
  if (!a || !b) return 0
  const start = Date.UTC(a.y, a.m - 1, a.d)
  const end = Date.UTC(b.y, b.m - 1, b.d)
  return Math.floor((end - start) / 86400000)
}

export function getDaysTogether(anniversaryIso) {
  const today = getJakartaDateString()
  const diff = daysBetween(anniversaryIso, today)
  return Math.max(0, diff + 1)
}

export function daysUntil(targetIso) {
  const today = getJakartaDateString()
  const diff = daysBetween(today, targetIso)
  return diff
}

/** Next anniversary on/after today (recurring May 30 style) */
export function nextAnniversaryDate(anniversaryIso) {
  const today = getJakartaDateString()
  const { y: ay, m, d } = parseDateOnly(anniversaryIso) || {}
  if (!m || !d) return null
  const { year } = getJakartaParts()
  let candidate = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  if (daysBetween(today, candidate) < 0) {
    candidate = `${year + 1}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  return candidate
}

export function getGreeting(displayName) {
  const { hour } = getJakartaParts()
  const name = displayName || 'there'
  if (hour >= 5 && hour < 12) return `Good morning, ${name} ☀️`
  if (hour >= 12 && hour < 17) return `Hope you're having a lovely day, ${name} 🤍`
  if (hour >= 17 && hour < 21) return `Good evening, ${name} 🌙`
  return `Good night, ${name} 🌙`
}

export function formatTodayShort() {
  const iso = getJakartaDateString()
  const [y, m, d] = iso.split('-').map(Number)
  return format(new Date(y, m - 1, d), 'd MMMM yyyy', { locale: enUS })
}

export function pickDailyQuote(quotes) {
  if (!quotes?.length) return { text: '', author: '' }
  const { year, month, day } = getJakartaParts()
  const start = Date.UTC(year, 0, 0)
  const now = Date.UTC(year, month - 1, day)
  const dayOfYear = Math.floor((now - start) / 86400000)
  const item = quotes[dayOfYear % quotes.length]
  if (typeof item === 'string') return { text: item, author: '' }
  return { text: item.text || '', author: item.author || '' }
}

export function formatTodayLong() {
  const iso = getJakartaDateString()
  const [y, m, d] = iso.split('-').map(Number)
  return format(new Date(y, m - 1, d), 'EEEE, d MMMM yyyy', { locale: enUS })
}

export function formatShortDate(dateValue) {
  if (!dateValue) return ''
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [y, m, d] = dateValue.split('-').map(Number)
    return format(new Date(y, m - 1, d), 'd MMMM yyyy', { locale: enUS })
  }
  return format(new Date(dateValue), 'd MMMM yyyy', { locale: enUS })
}

export function formatMonthYear(dateValue) {
  if (!dateValue) return ''
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [y, m, d] = dateValue.split('-').map(Number)
    return format(new Date(y, m - 1, d), 'MMMM yyyy', { locale: enUS })
  }
  return format(new Date(dateValue), 'MMMM yyyy', { locale: enUS })
}

export function formatTimeShort(dateValue) {
  if (!dateValue) return ''
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: JAKARTA_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(dateValue))
}

export function formatRelativeTime(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  const now = new Date()
  const diffMin = Math.floor((now - date) / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return formatShortDate(dateValue)
}

export function formatNoteWhen(dateValue) {
  const today = getJakartaDateString()
  const noteDay = getJakartaDateString(new Date(dateValue))
  const time = formatTimeShort(dateValue)
  if (noteDay === today) return `Today · ${time}`
  return `${formatShortDate(noteDay)} · ${time}`
}

export function formatAnniversaryLabel(iso) {
  return formatShortDate(iso)
}

export function formatAudioTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
