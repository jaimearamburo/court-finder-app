'use client'

import { createContext, useState, useCallback, ReactNode } from 'react';

type SearchFilters = Record<string, any>;

type ContextType = {
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
};

export const SearchFiltersContext = createContext<ContextType>({
  searchFilters: {},
  setSearchFilters: () => {},
  isSearching: false,
  setIsSearching: () => {},
});

export function SearchFiltersContextProvider({ children }: { children: ReactNode }) {
  const [searchFilters, setSearchFilters] = useState({});
  const [isSearching, setIsSearching] = useState(true);

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