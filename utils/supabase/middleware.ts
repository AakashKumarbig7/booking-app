import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Prepare the NextResponse object for setting cookies
  let supabaseResponse = NextResponse.next({ request });

  // Initialize Supabase client with request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Define public paths and role-based paths
  const publicPaths: string[] = [
    '/login', '/sign-up', '/forgot-password', '/reset-password',
    '/auth/login', '/auth/sign-up', '/auth/forgot-password', 
    '/auth/reset-password', '/auth/callback', '/auth/confirmReset','/404'
  ];

  // Define role-based path access
  const rolePaths = {
    admin: ['/organisation','/staff-management','/sports-management','/profile'],
    user: ['/home','/content', '/feedback','/options','/profile']
  };

  // Get user session
  const { data: session } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    return supabaseResponse;
  }

  // Check user authentication and access level
  if (session?.user) {
    const { data: user } = await supabase
      .from('users')
      .select('status, access')
      .eq('email', session.user.email)
      .single();

    // If user has a valid status, check access level
    if (user?.status) {
      const userRole = user.access as keyof typeof rolePaths;
      const allowedPaths = rolePaths[userRole] || [];

      // Allow access if the user has the required role for the path
      if (allowedPaths.some(path => pathname.startsWith(path))) {
        return supabaseResponse;
      }
    }
  }
  if(!session?.user){
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to login if unauthorized
  return NextResponse.redirect(new URL('/404', request.url));
}
