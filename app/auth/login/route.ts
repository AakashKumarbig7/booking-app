// /app/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const formData = await request.formData();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase?.auth?.signInWithPassword({  
    email,
    password,
  });

  if (error) {
    // Return a structured error response
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Return a successful response
  return NextResponse.json(
    { message: "Login successful" },
    { status: 200 }
  );
}
