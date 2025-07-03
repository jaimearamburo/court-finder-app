// import Image from "next/image";
// import Link from 'next/link';
import Header from "./components/Header";
import AvailabilityCategories from "./components/AvailabilityCategories";
import FilterBar from "./components/FilterBar";
import ResultGrid from "./components/ResultGrid";
import Hero from "./components/Hero";
import { Suspense } from "react";
import { ResultGridSkeleton } from "./ui/skeletons";
import { SearchFiltersContextProvider } from "./store/SearchFiltersContext";
import ResultGridWrapper from "./components/ResultGridWrapper";
import LoadingFallback from "./ui/LoadingFallback";

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const resolvedParams = await searchParams ?? {};

  const resultsSuspenseKey = Object.entries(resolvedParams)
    .filter(([, v]) => v != null)                    // skip undefined/null
    .sort(([a], [b]) => a.localeCompare(b))          // sort keys alphabetically
    .map(([k, v]) => `${k}=${v}`)                     // keep full key=value
    .join('&');

  return (
   <div className="min-h-screen bg-white">
      <Header />

      <main className="px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <SearchFiltersContextProvider>
            {/* Selectable filters */ }
            <section className="bg-white px-0 py-3">
              <AvailabilityCategories />
            </section>
            <section className="bg-white px-0 py-3 mb-2">
              <FilterBar />
            </section>
            
            {/* Hero Section */ }
            <Hero />

            <LoadingFallback fallback={<ResultGridSkeleton />}>
              <Suspense key={resultsSuspenseKey} fallback={null}>
                <ResultGridWrapper>
                  <ResultGrid searchParams={resolvedParams} />
                </ResultGridWrapper>
              </Suspense>
            </LoadingFallback>
          </SearchFiltersContextProvider>
        </div>
      </main>
    </div>
  );
}
