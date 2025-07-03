import ResultCard from "./ResultCard";
import { ResultCardProps } from "./ResultCard";
import { search } from "@/app/lib/search";

export default async function ResultGrid({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>,
}) {

  const data = (await search(searchParams)) as ResultCardProps[];

  return (
    <>
    {data &&
      <>
      <div className="pb-5 px-1">{data.length > 0 ? <span>{data.length} places found.</span> : <span>Nothing found :(</span>}</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((place, index) => (
          <ResultCard key={`${index}`} {...place} />
        ))}
      </div>
      </>
    }
    </>
  );
}
