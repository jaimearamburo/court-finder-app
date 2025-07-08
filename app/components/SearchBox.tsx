'use client'

import { Search } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function SearchBox(){
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const debounceSearch = useDebouncedCallback((term: string) => handleSearch(term), 200);

  function handleSearch(term: string) {
    const params = new URLSearchParams();

    if (term && term.trim().length > 1) {
      params.set('q', term.trim());
    }

    replace(`${pathname}?${params.toString()}`);
  }

  return (
  <>
    <Search className="h-5 w-5 text-gray-400 mr-3" />
    <input
      type="text"
      placeholder="Try: Tennis in Bondi at 6pm tomorrow ..."
      className="bg-transparent text-gray-700 placeholder-gray-500 outline-none flex-1 w-full"
      onChange={(e) => {
          debounceSearch(e.target.value);
        }}
      defaultValue={searchParams.get('q')?.toString()}
      autoFocus
    />
  </>);
}