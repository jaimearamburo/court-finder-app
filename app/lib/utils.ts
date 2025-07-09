export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isValidQ(q: string | null): boolean {
  return !!q && q.trim().length > 1;
}

export const formatTime = (minutes: number)  => {
  if(!minutes) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const isPM = hours >= 12;
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = isPM ? 'pm' : 'am';

  return `${displayHour}${mins !== 0 ? `:${String(mins).padStart(2, '0')}` : ''}${suffix}`;
}