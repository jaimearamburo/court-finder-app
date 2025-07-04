'use client';

import { use, useState }  from 'react'
import { SearchFiltersContext } from '@/app/store/SearchFiltersContext';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Calendar24Props {
  date?: Date;
  time?: string;
  onSelectDate: (date: Date | undefined) => void;
  onSelectTime: (time: string) => void;
}

export function Calendar24({ date, time, onSelectDate, onSelectTime }: Calendar24Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString("en-AU") : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              className='font-mono'
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                onSelectDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-2">
        <Input onChange={(e) => {onSelectTime(e.target.value)}}
          type="time"
          id="time-picker"
          step="60"
          value={time}
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}

export function SelectDuration({
  duration,
  onSelectDuration,
}: {
  duration: string;
  onSelectDuration: (value: string) => void;
}) {
  return (
    <Select onValueChange={(d) => {onSelectDuration(d)}} value={duration}>
      <SelectTrigger className="w-[80px]">
        <SelectValue placeholder="Duration" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="30">30 min</SelectItem>
          <SelectItem value="60">1 h</SelectItem>
          <SelectItem value="90"> 1.5 h</SelectItem>
          <SelectItem value="120">2 h</SelectItem>
          <SelectItem value="150"> 2.5 h</SelectItem>
          <SelectItem value="180">3 h</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default function FilterBar({ className = '' }) {
  const searchFiltersContext = use(SearchFiltersContext);

  if (!searchFiltersContext) {
    throw new Error("SearchFiltersContext not found — make sure the provider is wrapped.");
  }

  const { searchFilters, setSearchFilters, isSearching, setIsSearching } = searchFiltersContext;
  
  const pathname = usePathname();
  const { replace } = useRouter();

  function randomCharString(l: number) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < l; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function handleSelectDate(date: Date | undefined){
    if (!date) return;
    const yyyyMmDd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    setSearchFilters((prev) => ({
      ...prev,
      date: yyyyMmDd,
    }));
  }

  function handleSelectTime(time: string | undefined){
    if (!time) return;

    setSearchFilters((prev) => ({
      ...prev,
      time,
    }));
  }

  function handleSelectDuration(duration: string | undefined){
    if (!duration || isNaN(Number(duration))) return;

    setSearchFilters((prev) => ({
      ...prev,
      duration,
    }));
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

          <Calendar24
            date={
              searchFilters.date
                ? (() => {
                    const [yyyy, mm, dd] = searchFilters.date.split('-').map(Number);
                    return new Date(yyyy, mm - 1, dd); // Proper local date
                  })()
                : undefined
            }
            time={
              searchFilters.time ?? '00:00'
            }
            onSelectDate={handleSelectDate}
            onSelectTime={handleSelectTime}
          />
          <SelectDuration duration={searchFilters.duration ?? '60'} onSelectDuration={handleSelectDuration} />

          <button
            onClick={handleApplyFilters}
            disabled={isSearching}
            className={`px-5 py-3 md:px-4 md:py-2 rounded-md text-sm text-white cursor-pointer ${
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
