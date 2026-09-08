import ResultCard, { ResultCardProps } from "./ResultCard";
import RelativeDayLabel from "./RelativeDayLabel";
import { formatDayHeading, daysBetween } from "@/app/lib/dateSections";

export default function DaySection({
  date,
  today,
  records,
}: {
  date: string;
  today: string;
  records: ResultCardProps[];
}) {
  const offset = daysBetween(today, date);
  const heading = formatDayHeading(date, today);

  return (
    <section>
      <h3 className="flex items-center gap-2 mb-2 px-1">
        <span className="inline-block bg-gray-900 text-white text-xs font-semibold rounded-[3px] px-2 py-1 leading-none">
          {heading}
        </span>
        <RelativeDayLabel days={offset} />
      </h3>

      {records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5">
          {records.map((record, index) => (
            <ResultCard key={`${date}-${index}`} {...record} />
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-400 px-1">Nothing found for this day.</p>
      )}
    </section>
  );
}
