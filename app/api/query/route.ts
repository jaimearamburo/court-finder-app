import { extractDateTime } from '@/app/lib/dateparse'
import { performance } from 'perf_hooks';

export async function GET(request: Request) {
  const t0 = performance.now();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q') ?? '';

  if (!q.trim()) {
    return Response.json({ error: 'Query parameter "q" is required.' }, { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Step 2: Extract structured time info
  const { date, timeRange } = extractDateTime(q)

  const t1 = performance.now();
  console.log(`🚀 exec time ${(t1 - t0).toFixed(2)} ms`);

  return Response.json({
    date,
    timeRange
  })
}
