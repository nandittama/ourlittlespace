import { format } from 'date-fns'
import { enUS } from 'date-fns/locale'

const JAKARTA_TZ = 'Asia/Jakarta'

export function getJakartaDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: JAKARTA_TZ }))
}

export function getGreeting(displayName) {
  const hour = getJakartaDate().getHours()
  const name = displayName || 'there'

  if (hour >= 5 && hour < 12) {
    return `Good morning, ${name}`
  }
  if (hour >= 12 && hour < 17) {
    return `Good afternoon, ${name}`
  }
  if (hour >= 17 && hour < 21) {
    return `Good evening, ${name}`
  }
  return `Good night, ${name}`
}

export function formatTodayLong() {
  return format(getJakartaDate(), 'EEEE, d MMMM yyyy', { locale: enUS })
}

export function formatShortDate(dateValue) {
  if (!dateValue) return ''
  return format(new Date(dateValue), 'd MMM yyyy', { locale: enUS })
}

export function formatRelativeTime(dateValue) {
  if (!dateValue) return ''
  const date = new Date(dateValue)
  const now = new Date()
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  return formatShortDate(dateValue)
}

export function getDaysTogether(startDateStr) {
  if (!startDateStr) return 0
  const start = new Date(`${startDateStr}T00:00:00`)
  const now = getJakartaDate()
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.floor((today - startDay) / 86400000)
  return Math.max(0, diff + 1)
}
