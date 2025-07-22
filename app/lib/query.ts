// import { es } from '@/app/lib/es';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// export async function getSraperLog() {
//   try {
//     const response = await es.search({
//       index: 'scraper_logs',
//       size: 20,
//       sort: 'timestamp_utc:desc',
//       query: {
//         match_all: {},
//       },
//     })

//     const logs = response.hits.hits.map((hit: any) => hit._source)
//     return logs;
//   } catch (err) {
//     console.error('❌ ES query failed:', err);
//     throw new Error('Internal server error');
//   } finally{
//   }
// }


export async function getSraperLogPG() {
  const query = sql`
    SELECT log_message, created_at FROM availability_logs
    ORDER BY created_at DESC
    LIMIT 1`;

  const records = await query;

  return records;
}