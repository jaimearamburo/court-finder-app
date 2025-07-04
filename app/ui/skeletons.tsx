'use client'

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function ResultCardSkeleton(){
  return (
    <div className="rounded-lg overflow-hidden shadow w-full bg-gray-50 animate-pulse select-none">
      {/* Image placeholder, matches md:block */}
      <div className="hidden md:block w-full h-44 bg-gray-200" />

      <div className="p-2 pb-3 pr-3">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-stretch space-x-2">
            {/* Icon square placeholder */}
            <div className="aspect-square min-w-[3rem] bg-gray-200 rounded-md hidden sm:flex items-center justify-center" />
            
            <div className="flex flex-col justify-center flex-1">
              {/* ClubName skeleton */}
              <div className="h-5 w-40 bg-gray-200 rounded mb-1" />
              {/* Date skeleton */}
              <div className="mt-[3px] md:mt-[2px] h-4 md:pb-0 md:h-5 w-24 bg-gray-200 rounded md:mb-0" />
            </div>
          </div>
        </div>

        <div className="text-sm relative">
          <div className="flex overflow-x-hidden whitespace-nowrap gap-x-1 pt-0">
            {/* Approximate number of time tags placeholders (6), same size as your span */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="inline-block h-5 w-12 rounded-[3px] bg-gray-200 font-mono"
              />
            ))}
          </div>
          {/* Fade effect placeholder */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-5 bg-gradient-to-l from-gray-50 to-transparent" />
        </div>
      </div>
    </div>
  );
}

export function ResultGridSkeleton() {
  return (
    <>
    <div className={`animate-pulse relative mb-2 md:mb-5 px-1 h-4 w-28 overflow-hidden rounded-sm bg-gray-100 text-gray-200`}></div>

    <div className={`animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-5`}>
      <ResultCardSkeleton />
      <ResultCardSkeleton />
      <ResultCardSkeleton />
    </div>
    </>
  );
}