import Image from "next/image";
import Link from "next/link";
import AvailableTimeTag from "@/app/ui/AvailableTimeTag";

const clubsLinks = [
  { name: 'coogee', link: 'https://www.tennisvenues.com.au/booking/eastern-suburbs-tennis-club' },
  { name: 'Surry Hills', link: 'https://jensenstennis.intrac.com.au/tennis/book.cfm?facility=1' },
  { name: 'Rushcutters', link: 'https://www.rushcuttersbaytennis.com.au/book-a-court/' },
  { name: 'Mutch', link: 'https://www.mutchparksports.com.au/tennis/' },
  { name: 'Primrose', link: 'https://www.tennisvenues.com.au/booking/primrose-park-tc' },
  { name: 'Lyne', link: 'http://www.lptc.com.au/courthire' },
  { name: 'Trumper', link: 'https://www.wentworthtennis.com/court_hire' },
  { name: 'Little Alfred', link: 'https://www.littlealfredtennis.com.au/booknow' },
  { name: 'Langham', link: 'https://langham.intrac.com.au/tennis/book.cfm' },
  { name: 'Alexandria', link: 'https://jensenstennis.intrac.com.au/tennis/book.cfm?facility=2' },
  { name: 'Glebe', link: 'https://jensenstennis.intrac.com.au/tennis/book.cfm?facility=4' },
];

export interface ResultCardProps {
  clubId: number;
  clubName: string;
  sportName: string;
  date: string;
  imgSrc: string;
  count: number;
  availableTimes: { time: number }[];
  requestedStartTime: string | undefined,
}

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}min`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${(minutes / 60).toFixed(1)}h`;
};

const formatDate = (dateString: string) => {
  const inputDate = new Date(dateString);
  const today = new Date();

  // Normalize both dates to ignore time
  const isToday =
    inputDate.getFullYear() === today.getFullYear() &&
    inputDate.getMonth() === today.getMonth() &&
    inputDate.getDate() === today.getDate();

  if (isToday) return "Today";

  return inputDate.toLocaleDateString("en-AU", {
    weekday: "long",  // e.g., "Wednesday"
    month: "short",   // e.g., "Jul"
    day: "numeric",   // e.g., 3
  });
};

function parseTimeStringToMinutes(timeStr: string | undefined): number | null {
  if (!timeStr) return null;

  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm format
  const match = timeStr.match(timePattern);
  if (!match) return null;

  const [_, hours, minutes] = match;
  return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
}

export default function ResultCard({ clubId, clubName, sportName, date, imgSrc, count, availableTimes, requestedStartTime }: ResultCardProps) {
  const matchedClubLink = clubsLinks.find(club =>
    clubName.toLowerCase().includes(club.name.toLowerCase())
  );

  console.log('rendering result card ...');

  return (
    <div className="rounded-lg overflow-hidden shadow hover:shadow-md transition w-full bg-[#f7f7f7]">
      <Image
        src={imgSrc}
        width={640}
        height={360}
        className="w-full h-44 object-cover hidden md:block"
        alt="image"
      />

      <div className="p-2 pb-0 pr-3" title={clubName}>

        <div className="flex justify-between items-start mb-2">
          <div className="flex items-stretch space-x-2">
            <div className="aspect-square min-w-[3rem] bg-gray-100 rounded-md hidden sm:flex items-center justify-center">
              <span className="text-3xl">🎾</span>
            </div>
            <div className="flex flex-col justify-center">

              {matchedClubLink ? (
                <Link
                  href={matchedClubLink.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1 underline hover:text-blue-900"
                >
                  {clubName}
                </Link>
              ) : (
                <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
                  {clubName}
                </h3>
              )}

              <div>
              <span
                className={`inline-block text-xs rounded-[3px] py-1 leading-none whitespace-nowrap ${
                  formatDate(date) === 'Today'
                    ? 'bg-yellow-400 text-gray-900 px-2'
                    : 'text-gray-500'
                }`}
              >
                {formatDate(date)}
              </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm">

          <div className="relative">

            <div className="flex whitespace-nowrap gap-x-2 pt-0 overflow-x-hidden pb-3">
              {availableTimes.map((timeSlot) => (
                <AvailableTimeTag 
                  key={timeSlot.time}
                  clubId={clubId}
                  date={date}
                  time={timeSlot.time}
                  isHighlighted={parseTimeStringToMinutes(requestedStartTime) === timeSlot.time}
                />
              ))}
            </div>

            {/* Fade effect */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-5 bg-gradient-to-l from-[#f7f7f7] to-transparent" />
          </div>
        </div> 

      </div>
    </div>
  );
}
