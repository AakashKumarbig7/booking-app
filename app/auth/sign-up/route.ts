import { NextResponse } from 'next/server';
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  
  const origin =(await headers()).get("origin");
  const { email, password } = await request.json();
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from('users')
    .update({ password: password })
    .eq('email', email)
    .single();

  if (updateError) {
    return NextResponse.json({ error: `You have no access to sign up`}, { status: 400 });
  } else {

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  }
  // Return the redirect URL and message
  return NextResponse.json({
    redirect: "/login",
    message: "Check email to continue sign-in process",
  }, { status: 200 });
}
