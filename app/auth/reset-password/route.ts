  import { createClient } from '@/utils/supabase/server';
  import { NextResponse } from 'next/server';

  export async function POST(request: Request) {
    try {
      const { password, email } = await request.json();
      const supabase = await createClient();

      if (!password || !email) {
        return NextResponse.json({ error: 'Missing code or password or email' }, { status: 400 });
      }

      // const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      // if (exchangeError) {
      //   return NextResponse.json({ error: 'Failed to exchange code' }, { status: 400 });
      // }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      const { error: updateTableEmailError } = await supabase
      .from('users')
      .update({ client_password: password })
      .eq('email', email)
      .single();
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update password' }, { status: 400 });
      }
      else if(updateTableEmailError) {
        return NextResponse.json({ error: 'Failed to update password in table' }, { status: 400 });
      }
      return NextResponse.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Server error:', error);
      return NextResponse.json({ error: 'Internal Server Error, Please try again' }, { status: 500 });
    }
  }
