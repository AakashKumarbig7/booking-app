'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { confirmReset } from '@/app/auth/confirmReset';
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function ForgotPassword({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const [email, setEmail] = useState<string>('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const fetchLogo = async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('logo')
      .single();
  
    if (error) {
      return null;
    }
    return data?.logo || null;
  };

  useEffect(() => {
    const fetchLogoUrl = async () => {
      const logoUrl = await fetchLogo();
      setLogoUrl(logoUrl);
    };
    fetchLogoUrl();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('email', email);
    await confirmReset(formData); // Call the server function
  };

  return (
    <div>
    <div className="w-full h-full overflow-hidden hidden md:flex">
      <div className="absolute top-0 left-0 p-4">
      <Link href="/dashboard">
        <Image
              src = {logoUrl || '/images/logo.png'}
              width={106}
              height={40}
              alt="logo"
              className="rounded  py-[1px] bg-white"
            />        </Link>
      </div>

      <div className="w-1/2 flex items-center justify-center p-6">
        <form
          className="animate-in flex flex-col justify-center gap text-foreground w-[600px]"
          onSubmit={handleSubmit}
        >
          <div className="my-5">
            <h1 className="text-[24px] font-bold text-primary-text_primary">Forgot Password</h1>
            <p className="text-sm text-[#A1A1AA]">Enter your email to reset your password</p>
          </div>
          <label className="text-sm text-primary-text_primary font-semibold" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-[6px] border-[#D4D4D8] px-4 py-2 bg-inherit border mt-2 mb-6 text-sm"
            name="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="bg-[#1A80F4] text-[white] text-sm px-4 py-2 border border-[#1A80F4] rounded mb-2 hover:bg-[#32A0FF]">
            Confirm
          </button>
          {searchParams?.message && (
            <p className="mt-4 p-4 text-sm bg-gray-100 rounded text-gray-700 text-center">
              {searchParams.message}
            </p>
          )}
          <p className="rounded-md no-underline text-sm text-center mt-4">Remember your password? <span>
          <Link
            href="/login"
            className="rounded-md no-underline text-sm text-center mt-4 text-[#1A80F4]"
          >
             Sign in
          </Link></span></p>
        </form>
      </div>

      <div className="w-1/2">
        <div
          className="bg-cover bg-center z-1 h-full shadow-2xl"
          style={{
            backgroundImage: 'url("/images/login-banner.webp")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom',
            backgroundSize: 'cover',
          }}
        ></div>
      </div>
    </div>
    <div className="w-full h-full overflow-hidden relative flex-col md:hidden justify-center align-middle  p-4">
        <div className="w-full h-full flex flex-col justify-center gap-4">
        <div className="flex align-middle w-full justify-center">
            <Link href="/dashboard">
              <Image
                src={logoUrl || '/images/logo.png'}
                width={260}
                height={142}
                alt="logo"
                className="rounded  py-[1px] bg-white "
              />        </Link>
          </div>
          <div className="w-full flex flex-col justify-center align-middle text-center">
            <h1 className="text-[18px] font-semibold text-secondary-800 mt-2">Access schedule anywhere-anytime</h1>
            <p className="text-sm text-secondary-400 font-thin">View your schedule anywhere,  anytime <br></br> with real- time updates</p>
          </div>
          <form
          className="animate-in flex flex-col justify-center gap text-foreground "
          onSubmit={handleSubmit}
        >
          <div className="my-5">
            <h1 className="text-[24px] font-bold text-primary-text_primary">Forgot Password</h1>
            <p className="text-sm text-[#A1A1AA]">Enter your email to reset your password</p>
          </div>
          <label className="text-sm text-primary-text_primary font-semibold" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-[6px] border-[#D4D4D8] px-4 py-2 bg-inherit border mt-2 mb-6 text-sm"
            name="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="bg-[#1A80F4] text-[white] text-sm px-4 py-2 border border-[#1A80F4] rounded mb-2 hover:bg-[#32A0FF]">
            Confirm
          </button>
          {searchParams?.message && (
            <p className="mt-4 p-4 text-sm bg-gray-100 rounded text-gray-700 text-center">
              {searchParams.message}
            </p>
          )}
          <p className="rounded-md no-underline text-sm text-center mt-4">Remember your password? <span>
          <Link
            href="/login"
            className="rounded-md no-underline text-sm text-center mt-4 text-[#1A80F4]"
          >
             Sign in
          </Link></span></p>
        </form>
        </div>

      </div>
    </div>
  );
}
