import { toZonedTime, format as formatTz } from 'date-fns-tz';

const APP_TIMEZONE = 'Australia/Sydney';

// Postgres `date` columns come back from the driver either as a UTC-midnight
// Date instance or as a 'yyyy-MM-dd' string depending on the query shape.
// Normalize to a plain date string so downstream comparisons never depend
// on the server or client's local timezone.
export function toISODateString(value: string | Date): string {
  return typeof value === 'string' ? value.slice(0, 10) : value.toISOString().slice(0, 10);
}

export function getTodayDateString(): string {
  const zonedNow = toZonedTime(new Date(), APP_TIMEZONE);
  return formatTz(zonedNow, 'yyyy-MM-dd', { timeZone: APP_TIMEZONE });
}

function toLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const d = toLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function daysBetween(fromStr: string, toStr: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((toLocalDate(toStr).getTime() - toLocalDate(fromStr).getTime()) / msPerDay);
}

function ordinalSuffix(day: number): string {
  const rem100 = day % 100;
  if (rem100 >= 11 && rem100 <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// "Today" / "Tomorrow" for the first two days, otherwise "Wednesday 21st".
// The "(in N days)" relative badge is rendered separately by RelativeDayLabel.
export function formatDayHeading(dateStr: string, todayStr: string): string {
  const offset = daysBetween(todayStr, dateStr);
  if (offset === 0) return 'Today';
  if (offset === 1) return 'Tomorrow';

  const d = toLocalDate(dateStr);
  const weekday = d.toLocaleDateString('en-AU', { weekday: 'long' });
  const day = d.getDate();
  return `${weekday} ${day}${ordinalSuffix(day)}`;
}
