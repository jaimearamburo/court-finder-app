import { z } from 'zod';
import { parseISO, isValid as isDateValid, format } from 'date-fns';
import { es } from '@/app/lib/es';
// import { performance } from 'perf_hooks';
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

function buildGrouping(){
  const aggs = {
    group_by_fields: {
      composite: {
        size: 500, // number of unique groups per page
        sources: [
          { club: { terms: { field: 'club_name.keyword' } } },
          { sport: { terms: { field: 'sport_name.keyword' } } },
          { date: { terms: { field: 'date' } } }
        ] as const
      }
    }
  }

  return aggs;
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

export async function searchSlots(searchParams: Record<string, unknown>) {

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
    //return Response.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
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

  const query = buildQuery({
    q,
    date: dates,
    timeMins,
    duration,
    sportNames,
    clubNames
  });

  const aggs = buildGrouping();
  //console.log(aggs);

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
            }
          }
        }
        }
      }
    });

    //const records = response.hits.hits.map(hit => hit._source);
    const records = (response.aggregations?.agg_club_sport_date as any)?.buckets || [];
    //console.log(JSON.stringify(records));
    return records;
  } catch (err) {
    console.error('❌ ES query failed:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally{
    // const t1 = performance.now();
    // console.log(`🚀 exec time ${(t1 - t0).toFixed(2)} ms`);
  }
}