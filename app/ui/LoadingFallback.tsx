'use client'

import { use } from "react";
import { SearchFiltersContext } from "@/app/store/SearchFiltersContext";

type LoadingFallbackProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

function DefaultSpinner() {
  return <div>Loading...</div>;
}

export default function LoadingFallback({ children, fallback = <DefaultSpinner /> }: LoadingFallbackProps) {
  const { isSearching } = use(SearchFiltersContext);

  return (
    <>
      {isSearching && fallback}
      <div className={`${isSearching ? 'hidden' : ''}`}>
        {children}
      </div>
    </>
  );
}