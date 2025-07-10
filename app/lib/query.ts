import { es } from '@/app/lib/es';

export async function getSraperLog() {

  try {
    const response = await es.search({
      index: 'scraper_logs',
      size: 20,
      sort: 'timestamp_utc:desc',
      query: {
        match_all: {},
      },
    })

    const logs = response.hits.hits.map((hit: any) => hit._source)
    return logs;
  } catch (err) {
    console.error('❌ ES query failed:', err);
    throw new Error('Internal server error');
  } finally{
  }
}