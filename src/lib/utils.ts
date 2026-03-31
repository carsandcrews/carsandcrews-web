import { EVENT_TYPE_LABELS, type EventType } from './constants'

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export function formatEventDate(date: string, endDate: string | null): string {
  const start = new Date(date + 'T00:00:00')
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' })
  const startDay = start.getDate()
  const startYear = start.getFullYear()

  if (!endDate) {
    return `${startMonth} ${startDay}, ${startYear}`
  }

  const end = new Date(endDate + 'T00:00:00')
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' })
  const endDay = end.getDate()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${startYear}`
  }

  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${startYear}`
}

export function formatEventType(type: string): string {
  return EVENT_TYPE_LABELS[type as EventType] || type
}
