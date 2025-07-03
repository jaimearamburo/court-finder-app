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
    <div className="w-full bg-white">
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {categories.map((category) => {
          const isSelected = selectedSports.includes(category.name);

          return (
            <div
              key={category.name}
              onClick={() => handleSelectSport(category.name)}
              className="flex flex-col items-center min-w-0 flex-shrink-0 cursor-pointer group bg-"
            >
              <div 
                className={`w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2 ${
                  isSelected ? 'bg-gray-300' : 'bg-gray-100'
                }`}
              >
                <span className="text-2xl group-hover:scale-130 transition-transform">{category.icon}</span>
              </div>
              <span className="text-sm text-gray-800 text-center whitespace-nowrap">
                {category.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}