export default function RelativeDayLabel({ days }: { days: number }) {
  // return null for < 2 days, (today & tomorrow don't show days remaining note)
  if (days < 2) return null;

  return <span className="text-gray-400 font-normal">{` (in ${days} days)`}</span>;
}
