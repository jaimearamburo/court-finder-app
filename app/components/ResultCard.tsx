import Image from "next/image";
import { Suspense } from "react";

export interface ResultCardProps {
  club_id: number;
  court_id: number;
  club_name: string;
  sport_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  idx: number;
}

export default function ResultCard({ club_name, sport_name, date, start_time, end_time, duration }: ResultCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      weekday: "long", // e.g., "Wed"
      month: "short",   // e.g., "Jul"
      day: "numeric",   // e.g., 9
    }); // Output: "Wed, Jul 9"
  };

  const formatTime = (minutes: number)  => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const isPM = hours >= 12;
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const suffix = isPM ? 'pm' : 'am';

    return `${displayHour}${mins !== 0 ? `:${String(mins).padStart(2, '0')}` : ''}${suffix}`;
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    if (minutes % 60 === 0) return `${minutes / 60}h`;
    return `${(minutes / 60).toFixed(1)}h`;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-md transition w-full">
      <Image
        src="/mutch-park-tennis.jpg"
        width={640}
        height={360}
        className="w-full h-44 object-cover"
        alt="image"
      />

      <div className="p-2">

        <div className="flex justify-between items-start mb-2">
          <div className="flex items-stretch space-x-2">
            <div className="aspect-square min-w-[3rem] bg-gray-100 rounded-md flex items-center justify-center">
              <span className="text-3xl">🎾</span>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="font-semibold text-gray-900 text-sm leading-snug">
                {club_name}
              </h3>
              <span className="text-sm text-gray-500 rounded-sm py-1 leading-none">
                3 courts available
              </span>
            </div>
          </div>
        </div>

        <div className="h-[2px] w-full bg-gray-100 my-3" />

        <div className="text-sm">
          <div className="flex items-center justify-between mb-0">
            <div className="text-sm">
              <span className="font-medium text-gray-600">
                {formatDate(date)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-medium text-gray-500">
                <span>@ </span>{formatTime(Number(start_time))} - {formatTime(Number(end_time))}
              </span>
            </div>
            <div className="bg-gray-900 text-secondary-foreground px-2 py-1 rounded-md text-sm font-medium text-white">
              {formatDuration(duration)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
