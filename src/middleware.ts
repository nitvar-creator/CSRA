import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const REPORTER_ONLY_PAGES = [
  '/dashboard',
  '/reporter-registration',
  '/mother-status',
  '/report-mother-basic',
  '/report-mother-screening',
  '/report-mother-confirmatory',
  '/report-baby-basic',
  '/report-baby-serological',
];

const REPORTER_ONLY_API_PREFIXES = ['/api/dashboard', '/api/user'];

const REPORTER_ONLY_REPORT_PATHS = [
  '/api/reports/maternal-basic',
  '/api/reports/maternal-screening',
  '/api/reports/maternal-confirmatory',
  '/api/reports/baby-basic',
  '/api/reports/baby-serological',
  '/api/reports/reporter-registration',
];

function isReporterOnly(pathname: string): boolean {
  if (REPORTER_ONLY_PAGES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true;
  if (REPORTER_ONLY_API_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (REPORTER_ONLY_REPORT_PATHS.includes(pathname)) return true;
  // Catch-all: any /api/reports/* except the public mother-self-report
  if (
    pathname.startsWith('/api/reports/') &&
    pathname !== '/api/reports/mother-self-report' &&
    !pathname.startsWith('/api/reports/mother-self-report/')
  ) {
    return true;
  }
  return false;
}

function isMotherFlow(pathname: string): boolean {
  return pathname === '/mother' || pathname.startsWith('/mother/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Belt-and-braces guard for static assets / internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  const reporterOnly = isReporterOnly(pathname);
  const motherFlow = isMotherFlow(pathname);

  if (!reporterOnly && !motherFlow) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isApi = pathname.startsWith('/api/');

  if (reporterOnly) {
    if (!user) {
      if (isApi) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 },
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = profile?.role ?? null;

    if (role === 'reporter') return response;

    if (role === 'mother') {
      if (isApi) {
        return NextResponse.json(
          { success: false, message: 'Forbidden' },
          { status: 403 },
        );
      }
      return NextResponse.redirect(new URL('/mother/thank-you', request.url));
    }

    // role missing / null — needs to pick a role
    if (isApi) {
      return NextResponse.json(
        { success: false, message: 'Role not set' },
        { status: 403 },
      );
    }
    return NextResponse.redirect(new URL('/role-selection', request.url));
  }

  if (motherFlow && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (profile?.role === 'reporter') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico|gif|css|js|woff|woff2|ttf)$).*)',
  ],
};
