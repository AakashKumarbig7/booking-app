
'use server';

import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function confirmReset(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const origin = (await headers()).get('origin');
  const email = formData.get('email') as string;
  console.log('Email:', email);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  if (error) {
    // Redirect if there's an error
    redirect(`/forgot-password?message=${error.message}`)
  } else {
    // Redirect if the password reset link is sent successfully
    redirect('/login?message=Password Reset link has been sent to your email address');
  }
}
