'use client'

import { use }  from 'react'
import { SearchFiltersContext } from '@/app/store/SearchFiltersContext';

const categories = [
  { name: 'Football', icon: '⚽', color: 'bg-yellow-100' },
  { name: 'Tennis', icon: '🎾', color: 'bg-red-100' },
  { name: 'Padel', icon: '🏓', color: 'bg-orange-100' },
  { name: 'Basketball', icon: '🏀', color: 'bg-gray-100' },
  { name: 'Badminton', icon: '🏸', color: 'bg-orange-100' },
  { name: 'Camping', icon: '🏕️', color: 'bg-blue-100' },
  { name: 'Baseball', icon: '⚾️', color: 'bg-yellow-100' },
  { name: 'Yoga', icon: '🧘‍♀️', color: 'bg-gray-100' },
];

export default function AvailabilityCategories() {
  const { searchFilters, setSearchFilters } = use(SearchFiltersContext);

  const selectedSports = (searchFilters.sport || '').split(',').filter(Boolean);
  //console.log('selected sports', selectedSports);

  const handleSelectSport = (sportName: string) => {
    const updated = selectedSports.includes(sportName)
      ? selectedSports.filter((s: string) => s !== sportName) // remove
      : [...selectedSports, sportName]; // add

    setSearchFilters({
      ...searchFilters,
      sport: updated.join(','),
    });
  };

  return (
    <div className="w-full bg-white relative">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const categoryName = category.name.toLowerCase();
          const isSelected = selectedSports.includes(categoryName);

          return (
            <div
              key={categoryName}
              onClick={() => handleSelectSport(categoryName)}
              className="flex flex-col items-center min-w-0 flex-shrink-0 cursor-pointer group bg-"
            >
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-gray-800' : 'bg-gray-100'
                }`}
              >
                <span className="text-2xl group-hover:scale-130 transition-transform">{category.icon}</span>
              </div>
              <span className="text-sm text-gray-800 text-center whitespace-nowrap capitalize">
                {categoryName}
              </span>
            </div>
          );
        })}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-white to-transparent z-10" />
    </div>
  );
}