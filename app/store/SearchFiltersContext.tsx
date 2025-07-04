'use client'

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

export interface SearchFilters {
  sport?: string;     // sport: csv list of sports
  date?: string;     // format: 'YYYY-MM-DD'
  time?: string;     // format: 'HH:mm'
  duration?: string; // keep as string for use in <Select>
  // add more filters as needed
}

type ContextType = {
  searchFilters: SearchFilters;
  setSearchFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
};

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  date: getTodayDateString(),
  time: '00:00',
  duration: '60',
  sport: '',
};

export const SearchFiltersContext = createContext<ContextType>({
  searchFilters: {},
  setSearchFilters: () => {},
  isSearching: false,
  setIsSearching: () => {},
});

export function SearchFiltersContextProvider({ children }: { children: ReactNode }) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [isSearching, setIsSearching] = useState<boolean>(true);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const hydratedFilters: SearchFilters = {
      sport: searchParams.get('sport') || DEFAULT_SEARCH_FILTERS.sport,
      date: searchParams.get('date') || DEFAULT_SEARCH_FILTERS.date,
      time: searchParams.get('time') || DEFAULT_SEARCH_FILTERS.time,
      duration: searchParams.get('duration') || DEFAULT_SEARCH_FILTERS.duration,
    };

    console.log('hydrating filters', hydratedFilters);

    setSearchFilters(hydratedFilters);
  }, []); // re-run when the URL query string changes

  const contextValue = {
    searchFilters,
    setSearchFilters,
    isSearching,
    setIsSearching
  };

  return (
  <SearchFiltersContext value={contextValue}>
      {children}
  </SearchFiltersContext>
  );
}