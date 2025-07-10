export const dynamic = 'force-dynamic';

import { getSraperLog } from '@/app/lib/query'

export default async function LogsDisplay() {
  const logs = await getSraperLog();

  return (
    <div className="whitespace-pre-wrap font-mono">
      {logs.map((logEntry, i) => (
        <pre key={i}>
          {logEntry.log}
        </pre>
      ))}
    </div>
  );
}