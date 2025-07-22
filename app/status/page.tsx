export const dynamic = 'force-dynamic';

import { getSraperLogPG } from '@/app/lib/query'
import { LiveUpdatedMessage } from '@/app/components/LiveUpdatedMessage';

export default async function LogsDisplay() {
  const logs = await getSraperLogPG();

  return (
    <div className="whitespace-pre-wrap font-mono">
      {logs.map((logEntry, i) => (
        <pre key={i}>
          <LiveUpdatedMessage date={new Date(logEntry.created_at)} className='text-2xl rounded-md p-3 m-1 bg-gray-800 text-white' />
          <div>{logEntry.log_message}</div>
        </pre>
      ))}
    </div>
  );
}