import { NextRequest, NextResponse } from 'next/server';

// This function runs before rendering any matching route
export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const q = nextUrl.searchParams.get('q');

  // A simple check for whether 'q' is non-empty and useful
  const isValidQ = q && q.trim().length > 1;

  // If 'q' is valid and there are other query params present, redirect to only ?q=...
  if (isValidQ && nextUrl.searchParams.size > 1) {
    const newUrl = nextUrl.clone();
    newUrl.search = `?q=${encodeURIComponent(q!)}`;
    return NextResponse.redirect(newUrl);
  }

  // Otherwise, proceed normally
  return NextResponse.next();
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};