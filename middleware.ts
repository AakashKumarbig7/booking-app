import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";



export async function middleware(request: NextRequest) {
  // Update session
  const response = await updateSession(request);
  const supabase = createClient();
  const {data:user}= await supabase?.auth?.getUser();

  const {data}= await supabase
  .from('users')
  .select('access')
  .eq('email', user.user?.email)
  .single();

  // Redirect to the dashboard if the path is root
  if (request.nextUrl.pathname === "/") {
    if (data?.access == "admin")
      return NextResponse.redirect(new URL("/organisation", request.url));
    else if (data?.access == "user")
      return NextResponse.redirect(new URL("/home", request.url));
    else
    return NextResponse.redirect(new URL("/dashboard-sa", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
