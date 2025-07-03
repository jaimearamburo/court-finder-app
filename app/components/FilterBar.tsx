'use client';

import { use }  from 'react'
import { SearchFiltersContext } from '@/app/store/SearchFiltersContext';
import { usePathname, useRouter } from 'next/navigation';

const filters = ['Date', 'Start time', 'Duration', 'Sort'];

export default function FilterBar({ className = '' }) {
  const pathname = usePathname();
  const { replace } = useRouter();
  const { searchFilters, setSearchFilters, isSearching, setIsSearching } = use(SearchFiltersContext);

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

    // Add each filter to the URL query string
    Object.entries(searchFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      }
    });

    params.set('v', randomCharString(2));

    setIsSearching(true);
    replace(`${pathname}?${params.toString().toLowerCase()}`);

  };

  return (
    <section className={`w-full ${className}`}>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button key={filter} className="px-4 py-2 rounded-full text-sm bg-gray-100 hover:bg-gray-200">
              {filter}
            </button>
          ))}
          <button
            onClick={handleApplyFilters}
            disabled={isSearching}
            className={`px-4 py-2 rounded-full text-sm text-white cursor-pointer ${
              isSearching
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Search
          </button>
        </div>
    </section>
  );
}
