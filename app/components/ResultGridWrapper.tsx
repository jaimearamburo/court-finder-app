'use client'

import { use, useEffect } from 'react'
import { SearchFiltersContext } from '@/app/store/SearchFiltersContext';

export default function ResultGridWrapper({ children }: { children: React.ReactNode }) {
  const { setIsSearching } = use(SearchFiltersContext);

  useEffect(() => {
    setIsSearching(false); // Mark loading as complete once mounted
  }, []);

  return <>{children}</>;
}