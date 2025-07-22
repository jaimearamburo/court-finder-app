'use client';
import { useEffect, useState } from 'react';
import { AutoReload } from './AutoReload';

type LiveUpdatedMessageProps = { date: Date, className?: string };

export function LiveUpdatedMessage({ date, className = '' }: LiveUpdatedMessageProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date()); // set initial now on client only
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    // Render static fallback on server (and during first client render)
    const formattedDate = date.toLocaleString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    return (
      <div className={className}>
        Updated - ago, on {formattedDate}
      </div>
    );
  }

  const diffMs = now.getTime() - date.getTime();
  const diffSecondsTotal = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSecondsTotal / 60);
  const diffSeconds = diffSecondsTotal % 60;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let timeAgo = '';
  if (diffMinutes < 1) {
    // Less than a minute: show only seconds
    timeAgo = `${diffSeconds}s ago`;
  } else if (diffMinutes < 60) {
    // Between 1 minute and 1 hour: show minutes and seconds
    timeAgo = `${diffMinutes} min ${diffSeconds}s ago`;
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} hr ago`;
  } else {
    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  const formattedDate = date.toLocaleString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <>
      <AutoReload minutes={1} />
      <div className={className}>
        Updated {timeAgo}, on {formattedDate}
      </div>
    </>
  );
}
