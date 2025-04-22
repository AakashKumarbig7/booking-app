"use server";

import { createClient } from "@/utils/supabase/server";

// Fetch user data
export async function getLoggedInUserData() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data?.user) {
    return data.user;
  } else {
    return null;
  }
}