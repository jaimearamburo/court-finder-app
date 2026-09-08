'use client'

import { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { isValidQ } from '../lib/utils';
import { useDebounce } from 'use-debounce';
import { usePathname, useRouter } from 'next/navigation';

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
  setDateFilter: (date: string) => void;
  isSearching: boolean;
  setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
  query: string;
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
  setDateFilter: () => {},
  isSearching: false,
  setIsSearching: () => {},
  query: '',
});

export function SearchFiltersContextProvider({ children }: { children: ReactNode }) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [query, setQuery] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  // Tracks whether the user has explicitly picked a date via the filter bar.
  // Until then, `date` is kept out of the URL so the landing page shows a
  // default multi-day view instead of a single-date grid line before.
  const [dateFilterActive, setDateFilterActive] = useState(false);

  const pathname = usePathname();
  const { replace } = useRouter();

  // Debounce the filters for 200ms
  const [debouncedFilters] = useDebounce(searchFilters, 250);
  const firstRun = useRef(true);

  useEffect(() => {
    if (!isHydrated) return;           // Wait for hydration to complete
    if (firstRun.current) {            // Also skip first run *after* hydration
      firstRun.current = false;
      return;
    }

    //console.log('debounced filters', debouncedFilters);
    handleApplyFilters();
  }, [debouncedFilters]);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const q = searchParams.get('q');

    if (isValidQ(q)) {
      setQuery(q!.trim()); // Set the query string
      setSearchFilters({
        sport: undefined,
        date: undefined,
        time: undefined,
        duration: undefined,
      });
      return;
    }

    // Hydrate structured filters if q is not present or invalid
    const hydratedFilters: SearchFilters = {
      sport: searchParams.get('sport') || DEFAULT_SEARCH_FILTERS.sport,
      date: searchParams.get('date') || DEFAULT_SEARCH_FILTERS.date,
      time: searchParams.get('time') || DEFAULT_SEARCH_FILTERS.time,
      duration: searchParams.get('duration') || DEFAULT_SEARCH_FILTERS.duration,
    };

    setSearchFilters(hydratedFilters);
    setDateFilterActive(Boolean(searchParams.get('date')));
    setIsHydrated(true);

    //console.log('hydrating filters from url', searchFilters);
  }, []);

  function randomCharString(l: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < l; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const handleApplyFilters = () => {
    const params = new URLSearchParams();

    // Add each filter to the URL query string. `date` is only included once
    // the user has explicitly picked one, until then it stays out of the
    // URL so the landing page renders the multi-day view.
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (key === 'date' && !dateFilterActive) return;
      if (value) {
        params.set(key, String(value));
      }
    });

    params.set('v', randomCharString(2));

    setIsSearching(true);
    replace(`${pathname}?${params.toString().toLowerCase()}`,{ scroll: false });
  };

  const setDateFilter = (date: string) => {
    setDateFilterActive(true);
    setSearchFilters((prev) => ({ ...prev, date }));
  };

  const contextValue = {
    searchFilters,
    setSearchFilters,
    setDateFilter,
    isSearching,
    setIsSearching,
    query,
  };

  return (
  <SearchFiltersContext value={contextValue}>
      {children}
  </SearchFiltersContext>
  );
}