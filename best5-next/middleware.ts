import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLang, isLang } from './lib/i18n';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLang}`, request.url), 308);
  }

  const segment = pathname.split('/')[1];
  if (!isLang(segment)) {
    return NextResponse.redirect(new URL(`/${defaultLang}`, request.url), 308);
  }

  const headers = new Headers(request.headers);
  headers.set('x-pathname', pathname);

  return NextResponse.next({
    request: {
      headers
    }
  });
}

export const config = {
  matcher: ['/((?!favicon.ico).*)']
};
