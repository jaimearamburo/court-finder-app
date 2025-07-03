'use client'

const shimmer =
  'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent';

export function ResultCardSkeleton(){
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow w-full animate-pulse">
      <div className="w-full h-44 bg-gray-200" />

      <div className="p-2">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-stretch space-x-2">
            <div className="aspect-square min-w-[3rem] bg-gray-200 rounded-md" />
            <div className="flex flex-col justify-center space-y-1">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>

        <div className="h-[2px] w-full bg-gray-100 my-3" />

        <div className="text-sm space-y-1">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-6 w-8 bg-gray-300 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultGridSkeleton() {
  return (
    <>
    <div className={`animate-pulse relative mb-4 h-8 w-36 overflow-hidden rounded-md bg-gray-100 text-gray-200`}></div>

    <div className={`animate-pulse grid grid-cols-2 lg:grid-cols-4 gap-6`}>
      <ResultCardSkeleton />
      <ResultCardSkeleton />
      <ResultCardSkeleton />
      <ResultCardSkeleton />
    </div>
    </>
  );
}