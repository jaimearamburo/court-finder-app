import * as chrono from 'chrono-node'
import { toZonedTime, format } from 'date-fns-tz'

// Change this to your app's timezone
const APP_TIMEZONE = 'Australia/Sydney'

export function extractDateTime(input: string): {
  date: string | null
  timeRange: string[]
} {
  const now = new Date()

  // Force chrono to prefer future dates
  const results = chrono.parse(input, now, { forwardDate: true })
  if (results.length === 0) return { date: null, timeRange: [] }

  const parsedDate = results[0].start.date()

  // Convert chrono-parsed date to app timezone (e.g., Sydney)
  const zonedDate = toZonedTime(parsedDate, APP_TIMEZONE)

  // Extract date as YYYY-MM-DD
  const date = format(zonedDate, 'yyyy-MM-dd', { timeZone: APP_TIMEZONE })

  // Extract time as HH:mm:ss
  const time = format(zonedDate, 'HH:mm', { timeZone: APP_TIMEZONE })

  // If time is exactly midnight, treat as "no time specified"
  const timeRange = time !== '00:00:00' ? [time, '23:59:59'] : []

  return { date, timeRange }
}
