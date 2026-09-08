import { z } from 'zod';
import { parseISO, isValid as isDateValid, format } from 'date-fns';
import postgres from 'postgres';

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

export async function searchGroupedPg(searchParams: Record<string, unknown>) {
  const schema = z.object({
    q: z.string().optional(),
    date: z.string().optional().default(format(new Date(), 'yyyy-MM-dd')),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'invalid time format').optional().default("00:00"),
    duration: z.coerce.number().min(1, { message: 'duration must be more than 0' }).optional().default(60),
    sport: z.string().optional(), // comma-separated sport names e.g. "Tennis,Padel"
    club: z.string().optional(),  // comma-separated club names e.g. "Bondi Tennis Club,Manly Sports"
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    radius: z.coerce.number().optional(),
  });

  const parsed = schema.safeParse(searchParams);
  if (!parsed.success) {
      throw new Error('Invalid search parameters: ' + JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { q, date, time, duration, sport, club } = parsed.data;

  let dates = parseValidDates(date);
  const timeMins = time ? timeStrToMinutes(time) : undefined;
  const sportNames = parseCSV(sport?.toLowerCase());
  const clubNames = parseCSV(club?.toLowerCase());

  console.log('sports:', sportNames);

  const hasNoFilters =
    !date && !sport && !club && !duration;

  if (hasNoFilters) {
    dates = [format(new Date(), 'yyyy-MM-dd')]; // default to today
  }

  // Defaults in case q is not used
  let parsedDate: string | null = null;
  let parsedTime: string | null = null;

  //console.log('dates:', dates);
  
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
        date.length > 0
          ? sql`a.booking_date = ANY(${dates})`
          : sql`TRUE`
      }
      AND ${timeMins !== undefined ? sql`a.start_time >= ${timeMins}` : sql`TRUE`}
      AND ${duration !== undefined ? sql`a.max_duration_minutes = ${duration}` : sql`TRUE`}
      AND ${
        clubNames?.length
          ? sql`LOWER(c.name) = ANY(${clubNames.map(n => n.toLowerCase())}`
          : sql`TRUE`
      }
      AND ${
        sportNames?.length
          ? sql`LOWER(s.name) = ANY(${sportNames.map(n => n.toLowerCase())})`
          : sql`TRUE`
      }
    GROUP BY c.id ,c.name, c.booking_url, s.name, a.booking_date, c.image_path
    ORDER BY a.booking_date ASC
    LIMIT 1000;
  ` as any;

  const result = await query;

  const records = groupStartTimes(result);
  return {records, parsedDate, parsedTime};
}
