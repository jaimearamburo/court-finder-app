import { z } from 'zod';
import { parseISO, isValid as isDateValid, format } from 'date-fns';
import { es } from '@/app/lib/es';
// import { performance } from 'perf_hooks';
//import { sleep } from './utils';
import { extractDateTime } from './dateparse';

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
}): {
  query: any;
  parsedDate: string | null;
  parsedTime: string | null;
} {
  const query: any = {
    bool: {
      must: [],
      filter: []
    }
  };

  // Defaults in case q is not used
  let parsedDate: string | null = null;
  let parsedTime: string | null = null;

  // fallback using full-text fields and fuzzy search
  if (q && q.trim() !== '') {
    const normalizedQ = q.trim().replace(/\s+/g, ' ').toLowerCase();
    const { date: extractedDate, timeRange } = extractDateTime(q);

    parsedDate = extractedDate || null;

    query.bool.must.push({
        match: {
          description: {
            query: normalizedQ,
            fuzziness: 'AUTO',
            //operator: 'and'
          }
        }
    });

    if (parsedDate) {
      query.bool.filter.push({ term: { date: parsedDate } });
      query.bool.filter.push({ range: { duration: { gte: 60 } }});
    }

    if (timeRange.length) {
      const startTimeStr = timeRange[0]; // "18:00:00"
      const hhmm = startTimeStr.slice(0, 5);
      parsedTime = hhmm;

      const startTimeMins = timeStrToMinutes(hhmm);

      if (!isNaN(startTimeMins)) {
        query.bool.filter.push({
          range: {
            start_time: { gte: startTimeMins }
          }
        });
      }
    }

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

  return {
    query,
    parsedDate,
    parsedTime
  };
}

export async function searchGrouped(searchParams: Record<string, unknown>) {
  //await sleep(3000);
  // const t0 = performance.now();

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

  const hasNoFilters =
    !date && !sport && !club && !duration;

  if (hasNoFilters) {
    dates = [format(new Date(), 'yyyy-MM-dd')]; // default to today
  }

  //console.log(`'${q}'`, dates, timeMins, duration, sportNames, clubNames);

  const {query, parsedDate, parsedTime} = buildQuery({
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
      index: 'availability', // availability alias, points to the latest availability snapshot
      query,
      size: 0,
      sort: [{ date: 'asc' }],
      aggs: {
        "agg_club_sport_date": {
          "terms": {
            "field": "agg_club_sport_date",
            "size": 1000
          },
        "aggs": {
          "start_times": {
            "terms": {
              "field": "start_time",
              "size": 100
            },
            "aggs": {
              "court_names": {
                "terms": {
                  "field": 'court_name.keyword',
                  "size": 100
                }
              }
            }
          }
        }
        }
      }
    });

    //const records = response.hits.hits.map(hit => hit._source);
    const records = (response.aggregations?.agg_club_sport_date as any)?.buckets || [];
    //console.log(JSON.stringify(records));
    return {records, parsedDate, parsedTime};
  } catch (err) {
    console.error('❌ ES query failed:', err);
    throw new Error('Internal server error');
  } finally{
    // const t1 = performance.now();
    // console.log(`🚀 exec time ${(t1 - t0).toFixed(2)} ms`);
  }
}