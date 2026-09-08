import { z } from 'zod';
import { parseISO, isValid as isDateValid, format } from 'date-fns';
import postgres from 'postgres';
import { toISODateString } from '@/app/lib/dateSections';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

function timeStrToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function parseCSV(input?: string): string[] {
  return input?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
}

function parseValidDates(input?: string): string[] {
  if (!input) return [];
  return input
    .split(',')
    .map(s => s.trim())
    .filter(dateStr => {
      const d = parseISO(dateStr);
      return isDateValid(d) && dateStr.length === 10;
    });
}

function groupStartTimes(data: any[]) {
  return data.map(group => {
    const groupedTimes: Record<number, Set<string>> = {};

    group.start_times.forEach((t: { start_time: number; court_name: string }) => {
      if (!groupedTimes[t.start_time]) {
        groupedTimes[t.start_time] = new Set();
      }
      groupedTimes[t.start_time].add(t.court_name);
    });

    const simplifiedTimes = Object.entries(groupedTimes).map(([time, courts]) => ({
      time: Number(time),
      availableCourts: Array.from(courts)
    }));

    return {
      ...group,
      start_times: simplifiedTimes
    };
  });
}

const filterSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'invalid time format').optional().default("00:00"),
  duration: z.coerce.number().min(1, { message: 'duration must be more than 0' }).optional().default(60),
  sport: z.string().optional(), // comma-separated sport names e.g. "Tennis,Padel"
  club: z.string().optional(),  // comma-separated club names e.g. "Bondi Tennis Club,Manly Sports"
});

type ParsedFilters = {
  timeMins?: number;
  duration?: number;
  sportNames: string[];
  clubNames: string[];
};

function parseFilters(searchParams: Record<string, unknown>): ParsedFilters {
  const parsed = filterSchema.safeParse(searchParams);
  if (!parsed.success) {
    throw new Error('Invalid search parameters: ' + JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { time, duration, sport, club } = parsed.data;

  return {
    timeMins: time ? timeStrToMinutes(time) : undefined,
    duration,
    sportNames: parseCSV(sport?.toLowerCase()),
    clubNames: parseCSV(club?.toLowerCase()),
  };
}

async function fetchGroupedAvailability(dates: string[], filters: ParsedFilters) {
  const { timeMins, duration, sportNames, clubNames } = filters;

  const query = sql`
    SELECT
      c.id AS club_id,
      c.name AS club_name,
      c.booking_url,
      s.name AS sport_name,
      a.booking_date,
      c.image_path,
      json_agg(
        json_build_object(
          'start_time', a.start_time,
          'duration', a.max_duration_minutes,
          'court_name', co.name
        ) ORDER BY a.start_time
      ) AS start_times
    FROM availability a
    JOIN courts co ON a.court_id = co.id
    JOIN clubs c ON co.club_id = c.id
    JOIN sports s ON co.sport_id = s.id
    WHERE 1 = 1
      AND ${
        dates.length > 0
          ? sql`a.booking_date = ANY(${dates})`
          : sql`TRUE`
      }
      AND ${timeMins !== undefined ? sql`a.start_time >= ${timeMins}` : sql`TRUE`}
      AND ${duration !== undefined ? sql`a.max_duration_minutes = ${duration}` : sql`TRUE`}
      AND ${
        clubNames?.length
          ? sql`LOWER(c.name) = ANY(${clubNames})`
          : sql`TRUE`
      }
      AND ${
        sportNames?.length
          ? sql`LOWER(s.name) = ANY(${sportNames})`
          : sql`TRUE`
      }
    GROUP BY c.id, c.name, c.booking_url, s.name, a.booking_date, c.image_path
    ORDER BY a.booking_date ASC
    LIMIT 1000;
  ` as any;

  const result = await query;
  return groupStartTimes(result);
}

export async function searchGroupedPg(searchParams: Record<string, unknown>) {
  const schema = filterSchema.extend({
    date: z.string().optional().default(format(new Date(), 'yyyy-MM-dd')),
  });

  const parsed = schema.safeParse(searchParams);
  if (!parsed.success) {
    throw new Error('Invalid search parameters: ' + JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { date } = parsed.data;
  const filters = parseFilters(searchParams);

  let dates = parseValidDates(date);

  const hasNoFilters = !searchParams.date && !searchParams.sport && !searchParams.club && !searchParams.duration;
  if (hasNoFilters) {
    dates = [format(new Date(), 'yyyy-MM-dd')]; // default to today
  }

  const records = await fetchGroupedAvailability(dates, filters);

  // Defaults in case q is not used
  const parsedDate: string | null = null;
  const parsedTime: string | null = null;

  return { records, parsedDate, parsedTime };
}

// Fetches grouped availability for an explicit set of dates, honouring the
// same time/duration/sport/club filters as searchGroupedPg but bypassing its
// single "date" query param — used for the multi-day landing page sections.
export async function fetchAvailabilityForDates(searchParams: Record<string, unknown>, dates: string[]) {
  const filters = parseFilters(searchParams);
  return fetchGroupedAvailability(dates, filters);
}

// Finds the next `limit` distinct booking dates after `afterDate` that have
// at least one row matching the current filters. Used as a fallback when the
// default 5-day landing window has no availability at all.
export async function findNextAvailableDates(
  searchParams: Record<string, unknown>,
  afterDate: string,
  limit: number
): Promise<string[]> {
  const { timeMins, duration, sportNames, clubNames } = parseFilters(searchParams);

  const rows = await sql`
    SELECT DISTINCT a.booking_date
    FROM availability a
    JOIN courts co ON a.court_id = co.id
    JOIN clubs c ON co.club_id = c.id
    JOIN sports s ON co.sport_id = s.id
    WHERE a.booking_date > ${afterDate}
      AND ${timeMins !== undefined ? sql`a.start_time >= ${timeMins}` : sql`TRUE`}
      AND ${duration !== undefined ? sql`a.max_duration_minutes = ${duration}` : sql`TRUE`}
      AND ${
        clubNames?.length
          ? sql`LOWER(c.name) = ANY(${clubNames})`
          : sql`TRUE`
      }
      AND ${
        sportNames?.length
          ? sql`LOWER(s.name) = ANY(${sportNames})`
          : sql`TRUE`
      }
    ORDER BY a.booking_date ASC
    LIMIT ${limit};
  ` as any;

  return rows.map((r: any) => toISODateString(r.booking_date));
}
