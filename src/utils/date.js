import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

export const JAKARTA_TZ = 'Asia/Jakarta'

/** Calendar "now" parts in Asia/Jakarta (for business dates). */
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

/** YYYY-MM-DD in Asia/Jakarta */
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

export function getGreeting(displayName) {
  const { hour } = getJakartaParts()
  const name = displayName || 'there'

  if (hour >= 5 && hour < 12) return `Good morning, ${name}.`
  if (hour >= 12 && hour < 17) return `Good afternoon, ${name}.`
  if (hour >= 17 && hour < 21) return `Good evening, ${name}.`
  return `Good night, ${name}.`
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
    return format(new Date(y, m - 1, d), 'd MMM yyyy', { locale: enUS })
  }
  return format(new Date(dateValue), 'd MMM yyyy', { locale: enUS })
}

export function formatRelativeTime(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return formatShortDate(dateValue)
}

export function formatNoteDay(dateValue) {
  if (isJakartaToday(dateValue)) return 'Today'
  return formatShortDate(dateValue)
}

export function getDaysTogether(startDateStr) {
  if (!startDateStr) return 0
  const today = getJakartaDateString()
  const [ty, tm, td] = today.split('-').map(Number)
  const [sy, sm, sd] = startDateStr.split('-').map(Number)
  const start = Date.UTC(sy, sm - 1, sd)
  const end = Date.UTC(ty, tm - 1, td)
  const diff = Math.floor((end - start) / 86400000)
  return Math.max(0, diff + 1)
}

export function formatAnniversaryLabel(startDateStr) {
  if (!startDateStr) return ''
  const [y, m, d] = startDateStr.split('-').map(Number)
  const label = format(new Date(y, m - 1, d), 'd MMMM yyyy', { locale: enUS })
  return `Anniversary: ${label}`
}
