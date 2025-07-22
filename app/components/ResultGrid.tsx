import ResultCard from "./ResultCard";
import { ResultCardProps } from "./ResultCard";
import { searchGrouped } from "@/app/lib/search";
import { searchGroupedPg } from "@/app/lib/queries";
import { DrawerViewer } from "@/app/ui/DrawerViewer";

type CourtBucket = {
  key: string;
  doc_count: number;
};

type TimeSlotBucket = {
  key: number;
  doc_count: number;
  court_names?: {
    buckets: CourtBucket[];
  };
};

export default async function ResultGrid({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>,
}) {
  //const { records: data, parsedDate, parsedTime } = await searchGrouped(searchParams);
  const { records: data, parsedDate, parsedTime } = await searchGroupedPg(searchParams);
  const typedData = data as ResultCardProps[];

  const requestedStartTime = parsedTime ?? (typeof searchParams.time === 'string' ? searchParams.time : undefined);
  
  // console.log(parsedDate);
  // console.log(requestedStartTime);

  const records = typedData.map((record: any) => {
    const {
      club_id: clubId, 
      club_name: clubName, 
      sport_name: sportName, 
      booking_date: date, 
      image_path: imgSrc,
      start_times: availableTimes,
    } = record;
                
    // sort start times
    // const availableTimes = (record.start_times ?? [])
    //   .sort((a: { time: number }, b: { time: number }) => a.time - b.time);

    return {
      clubId,
      clubName,
      sportName,
      date,
      imgSrc,
      count: 0,
      availableTimes,
      requestedStartTime,
    };
  });
  //.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  //console.log(JSON.stringify(records));

  return (
    <>
    {records &&
      <>
      <DrawerViewer dataMap={records} />
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
