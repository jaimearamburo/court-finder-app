import ResultCard, { ResultCardProps } from "./ResultCard";
import DaySection from "./DaySection";
import {
  searchGroupedPg,
  fetchAvailabilityForDates,
  findNextAvailableDates,
} from "@/app/lib/queries";
import { DrawerViewer } from "@/app/ui/DrawerViewer";
import { getTodayDateString, addDaysToDateString, toISODateString } from "@/app/lib/dateSections";

const LANDING_WINDOW_DAYS = 5;
const FALLBACK_DAYS_TO_FIND = 2;

function toCardRecords(data: any[], requestedStartTime: string | undefined): ResultCardProps[] {
  return data.map((record: any) => {
    const {
      club_id: clubId,
      club_name: clubName,
      booking_url: bookingUrl,
      sport_name: sportName,
      booking_date: date,
      image_path: imgSrc,
      start_times: availableTimes,
    } = record;

    return {
      clubId,
      clubName,
      bookingUrl,
      sportName,
      date,
      imgSrc,
      count: 0,
      availableTimes,
      requestedStartTime,
    };
  });
}

function bucketByDate(records: ResultCardProps[], dates: string[]) {
  return dates.map((date) => ({
    date,
    records: records.filter((r) => toISODateString(r.date) === date),
  }));
}

export default async function ResultGrid({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>,
}) {
  const requestedStartTime = typeof searchParams.time === 'string' ? searchParams.time : undefined;

  // Default landing state (no date explicitly picked yet): show a rolling
  // window of the next few days, each as its own section.
  if (!searchParams.date) {
    const today = getTodayDateString();
    const windowDates = Array.from({ length: LANDING_WINDOW_DAYS }, (_, i) => addDaysToDateString(today, i));

    const windowData = await fetchAvailabilityForDates(searchParams, windowDates);
    let records = toCardRecords(windowData, requestedStartTime);
    const buckets = bucketByDate(records, windowDates);

    let fallbackBuckets: { date: string; records: ResultCardProps[] }[] = [];

    if (!buckets.some((b) => b.records.length > 0)) {
      const nextDates = await findNextAvailableDates(
        searchParams,
        windowDates[windowDates.length - 1],
        FALLBACK_DAYS_TO_FIND
      );

      if (nextDates.length > 0) {
        const fallbackData = await fetchAvailabilityForDates(searchParams, nextDates);
        const fallbackRecords = toCardRecords(fallbackData, requestedStartTime);
        fallbackBuckets = bucketByDate(fallbackRecords, nextDates);
        records = [...records, ...fallbackRecords];
      }
    }

    return (
      <>
        <DrawerViewer dataMap={records} />

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">Next 5 days availability</h2>
          <div className="space-y-6">
            {buckets.map((bucket) => (
              <DaySection key={bucket.date} date={bucket.date} today={today} records={bucket.records} />
            ))}
          </div>
        </div>

        {fallbackBuckets.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">Next available days</h2>
            <div className="space-y-6">
              {fallbackBuckets.map((bucket) => (
                <DaySection key={bucket.date} date={bucket.date} today={today} records={bucket.records} />
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // A specific date has been picked in the filter bar: single flat grid of
  // results for that date. If it comes back empty, look ahead for the next
  // days that do match the same filters, same as the landing page does.
  const { records: data, parsedTime } = await searchGroupedPg(searchParams);
  const primaryRecords = toCardRecords(data, parsedTime ?? requestedStartTime);

  let allRecords = primaryRecords;
  let fallbackBuckets: { date: string; records: ResultCardProps[] }[] = [];

  if (data.length === 0) {
    const nextDates = await findNextAvailableDates(searchParams, searchParams.date, FALLBACK_DAYS_TO_FIND);

    if (nextDates.length > 0) {
      const fallbackData = await fetchAvailabilityForDates(searchParams, nextDates);
      const fallbackRecords = toCardRecords(fallbackData, requestedStartTime);
      fallbackBuckets = bucketByDate(fallbackRecords, nextDates);
      allRecords = [...primaryRecords, ...fallbackRecords];
    }
  }

  const today = getTodayDateString();

  return (
    <>
      <DrawerViewer dataMap={allRecords} />
      <div className="mb-2 md:mb-5 px-1 text-xs text-gray-500">{data.length > 0 ? <span>{data.length} places found.</span> : <span>Nothing found :(</span>}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5">
        {primaryRecords.map((record, index) => (
          <ResultCard key={`${index}`} {...record} />
        ))}
      </div>

      {fallbackBuckets.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 px-1">Next available days</h2>
          <div className="space-y-6">
            {fallbackBuckets.map((bucket) => (
              <DaySection key={bucket.date} date={bucket.date} today={today} records={bucket.records} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
