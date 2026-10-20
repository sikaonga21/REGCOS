import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'regcos_admin_session';
const LOGIN_PATH = '/admin/login';

/**
 * First gate in front of the admin panel.
 *
 * This only checks that a session cookie is present, which is enough to bounce
 * signed-out visitors straight to the login screen instead of flashing an empty
 * dashboard. The cookie is *not* trusted here — Proxy runs away from the app and
 * should not query the database, so the authoritative check happens in
 * `app/admin/(panel)/layout.tsx` and in `requireAdmin()` on every API route.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  // Already signed in? Skip the login page.
  if (pathname === LOGIN_PATH) {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!hasSessionCookie) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('next', `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Admin pages only. API routes guard themselves so they can answer 401 as JSON
  // rather than redirecting a fetch() to an HTML page.
  matcher: ['/admin', '/admin/:path*'],
};
