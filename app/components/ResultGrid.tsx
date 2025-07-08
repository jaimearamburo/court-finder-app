import ResultCard from "./ResultCard";
import { ResultCardProps } from "./ResultCard";
import { searchGrouped } from "@/app/lib/search";

export default async function ResultGrid({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>,
}) {
  const { records: data, parsedDate, parsedTime } = await searchGrouped(searchParams);
  const typedData = data as ResultCardProps[];

  const requestedStartTime = parsedTime ?? (typeof searchParams.time === 'string' ? searchParams.time : undefined);
  
  // console.log(parsedDate);
  // console.log(requestedStartTime);

  const records = typedData.map((record: any) => {
    const [clubId, clubName, sportName, date, imgSrc] = record.key.split(':::');
    
    const availableTimes = (record.start_times?.buckets ?? [])
      .map((timeSlot: { key: number; doc_count: number }) => timeSlot.key)
      .sort((a: number, b: number) => a - b);

    return {
      clubId,
      clubName,
      sportName,
      date,
      imgSrc,
      count: record.doc_count,
      availableTimes,
      requestedStartTime,
    };
  })
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // console.log(records);

  return (
    <>
    {records &&
      <>
      <div className="mb-2 md:mb-5 px-1 text-xs text-gray-500">{data.length > 0 ? <span>{data.length} places found.</span> : <span>Nothing found :(</span>}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5">
        {records.map((record, index) => (
          <ResultCard key={`${index}`} {...record} />
        ))}
      </div>
      </>
    }
    </>
  );
}
