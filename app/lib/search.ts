import { z } from 'zod';
import { parseISO, isValid as isDateValid, format } from 'date-fns';
import { es } from '@/app/lib/es';
import { performance } from 'perf_hooks';
import { sleep } from './utils';

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

function timeStrToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function buildQuery({
  q,
  date,
  timeMins,
  duration,
  clubNames,
  sportNames
}: {
  q?: string;
  date: string[];
  timeMins?: number;
  duration?: number;
  clubNames?: string[];
  sportNames?: string[];
}) {
  const query: any = {
    bool: {
      must: [],
      filter: []
    }
  };

  // NLP fallback using full-text fields
  if (q && q.trim() !== '') {
    query.bool.must.push({
      multi_match: {
        query: q,
        fields: ['club_name', 'sport_name', 'description'],
        fuzziness: 'AUTO'
      }
    });
  } else {
    // Structured filter queries
    if (date.length === 1) {
      query.bool.filter.push({
        term: { date: date[0] }
      });
    } else if (date.length > 1) {
      query.bool.filter.push({
        terms: { date }
      });
    }

    if (typeof timeMins === 'number') {
      query.bool.filter.push({
        range: { start_time: { gte: timeMins } }
      });
    }

    if (typeof duration === 'number') {
      query.bool.filter.push({
        range: { duration: { gte: duration } }
      });
    }

    if (clubNames?.length) {
      query.bool.filter.push({
        terms: { 'club_name.keyword': clubNames }
      });
    }

    if (sportNames?.length) {
      query.bool.filter.push({
        terms: { 'sport_name.keyword': sportNames }
      });
    }
  }

  return query;
}

export async function search(searchParams: Record<string, unknown>) {
  //await sleep(3000);
  const t0 = performance.now();

  const schema = z.object({
    q: z.string().optional(),
    date: z.string().optional(),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'invalid time format').optional(),
    duration: z.coerce.number().min(1, { message: 'duration must be more than 0' }).optional(),
    sport: z.string().optional(), // comma-separated sport names e.g. "Tennis,Padel"
    club: z.string().optional(),  // comma-separated club names e.g. "Bondi Tennis Club,Manly Sports"
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    radius: z.coerce.number().optional(),
  });

  const parsed = schema.safeParse(searchParams);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { q, date, time, duration, sport, club } = parsed.data;

  let dates = parseValidDates(date);
  const timeMins = time ? timeStrToMinutes(time) : undefined;
  const sportNames = parseCSV(sport?.toLowerCase());
  const clubNames = parseCSV(club?.toLowerCase());

  const hasNoFilters =
    !date && !sport && !club && !duration;

  if (hasNoFilters) {
    dates = [format(new Date(), 'yyyy-MM-dd')]; // default to today
  }

  console.log(`'${q}'`, dates, timeMins, duration, sportNames, clubNames);

  const query = buildQuery({
    q,
    date: dates,
    timeMins,
    duration,
    sportNames,
    clubNames
  });

  console.log('ES query', JSON.stringify(query));

  try {
    const response = await es.search({
      index: 'availability', // this can be an alias
      size: 100,
      query,
      sort: [{ date: 'asc', start_time: 'asc' }]
    });

    const records = response.hits.hits.map(hit => hit._source);
    return records;
  } catch (err) {
    console.error('❌ ES query failed:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally{
    const t1 = performance.now();
    console.log(`🚀 exec time ${(t1 - t0).toFixed(2)} ms`);
  }
}