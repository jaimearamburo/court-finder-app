import { z } from 'zod';
import { isValid as isDateValid, parseISO } from 'date-fns';
import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

type AvailabilityResult = {
  booking_date: string;
  club: string;
  court_name: string;
  sport: string;
  start_time: string;
  end_time: string;
  max_duration_minutes: number;
};

async function listAvailability(date: string, time: string, duration: number, sport?: string, clubName?: string): Promise<AvailabilityResult[]> {
  const data = await sql<AvailabilityResult[]>`
    SELECT
      a.booking_date,
      c.name AS club,
      cs.name AS court_name,
      s.name AS sport,
      a.start_time,
      a.end_time,
      a.max_duration_minutes
    FROM availability a
    JOIN courts cs ON a.court_id = cs.id
    JOIN clubs c ON cs.club_id = c.id
    JOIN sports s ON cs.sport_id = s.id
    WHERE a.booking_date = ${date}
      AND a.start_time >= ${time}
      AND a.max_duration_minutes >= ${duration}
      ${sport ? sql`AND s.name ILIKE ${'%' + sport + '%'}` : sql``}
      ${clubName ? sql`AND c.name ILIKE ${'%' + clubName + '%'}` : sql``}
    ORDER BY a.start_time;
  `;

  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const SearchSchema = z.object({
    date: z.string().refine(val => {return isDateValid(parseISO(val));}, {message: 'invalid date'}),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'invalid time format').optional().default('00:00'), // e.g., 18:00
    duration: z.coerce.number().min(1, { message: 'duration must be more than 0' }).optional().default(30),
    sport: z.string().optional(),
    club: z.string().optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    radius: z.coerce.number().optional()
  });

  const validatedSearchParams = SearchSchema.safeParse(Object.fromEntries(searchParams));

  if (!validatedSearchParams.success) {
    return Response.json(
      { error: validatedSearchParams.error.flatten().fieldErrors }, 
      { status: 400 }
    );
  }

  const {date, time, duration, sport, club} = validatedSearchParams.data;

  try {
    const availability = await listAvailability(date, time, duration, sport, club);
  	return Response.json(availability);
  } catch (error) {
    console.error('DB error in listAvailability():', error);
  	return Response.json(
      { error: 'Internal server error. Please try again later.' }, 
      { status: 500 }
    );
  }
}
