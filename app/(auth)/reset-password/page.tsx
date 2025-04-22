'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Eye, EyeOff, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function ResetPassword({ searchParams }: { searchParams: { message: string; code: string } }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(searchParams?.message || null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const router = useRouter();
  

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

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

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: searchParams.code, password, email }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (!response.ok) {
        setMessage(data.error || 'Could not reset password. Please try again.');
      } else {
        setMessage(data.message);
        router.push('/login?message=Your Password has been reset successfully. Sign in.');
      }
    } catch (error) {
      setIsLoading(false);
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  // Validation checks
  const isCapitalLetter = /[A-Z]/.test(password.charAt(0));
  const hasValidLength = password.length >= 6 && password.length <= 15;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const noSpaces = !/\s/.test(password);
  const isFormValid = isCapitalLetter && hasValidLength && hasSpecialChar && noSpaces;
  const isPasswordMatch = password === confirmPassword;

  // Icon rendering based on condition
  const renderIcon = (condition: any) =>
    condition ? <CheckCircle className="text-green-500 inline ml-2" size={14} /> : <TriangleAlert className="text-red-500 inline ml-2" size={16} />;

  return (
    <div className="flex w-full h-full overflow-hidden">

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
          onSubmit={handleResetPassword}
        >
          <div className="my-5">
            <h1 className="text-[30px] font-bold text-primary-text_primary">Reset Password</h1>
            <p className="text-sm text-[#A1A1AA]">Enter your new password below</p>
          </div>

          <label className="text-sm text-gray-800 font-semibold" htmlFor="Email">
            Email
          </label>
          <div className="relative mb-4">
            <input
              className={`rounded-[6px] border-[#D4D4D8] px-4 py-2 bg-inherit border text-sm w-full `}
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label className="text-sm text-primary-text_primary font-semibold" htmlFor="password">
            New Password
          </label>
          <div className="relative mb-4">
            <input
              className={`rounded-[6px] border-[#D4D4D8] px-4 py-2 bg-inherit border text-sm w-full ${isFormValid ? `` : `focus-visible:border-red-500`}`}
              type={passwordVisible ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? <Eye size={18} className="text-gray-500" /> : <EyeOff size={18} className="text-gray-500" />}
            </button>
          </div>
          {isFormValid ? null : <ul className="text-sm mb-3 -mt-2">
            <li className={isCapitalLetter ? 'hidden' : 'text-red-500 pb-1'} >
              {renderIcon(isCapitalLetter)} Must start with a capital letter
            </li>
            <li className={hasValidLength ? 'hidden' : 'text-red-500 pb-1'}>
              {renderIcon(hasValidLength)}  Must be between 6-15 characters
            </li>
            <li className={hasSpecialChar ? 'hidden' : 'text-red-500 pb-1'}>
              {renderIcon(hasSpecialChar)} Must contain a special character
            </li>
            <li className={noSpaces ? 'hidden' : 'text-red-500 pb-1'}>
              {renderIcon(noSpaces)}No spaces allowed
            </li>
          </ul>}
          <label className="text-sm text-primary-text_primary font-semibold" htmlFor="confirmPassword">
            Confirm New Password
          </label>
          <div className="relative mb-6">
            <input
              className={`rounded-[6px] border-[#D4D4D8] px-4 py-2 bg-inherit border text-sm w-full ${isFormValid ? `` : `focus-visible:border-red-500`}`}
              type={confirmPasswordVisible ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? <Eye size={18} className="text-gray-500" /> : <EyeOff size={18} className="text-gray-500" />}
            </button>
          </div>
          {isFormValid && isPasswordMatch ? null :
            <ul className="text-sm mb-3 -mt-2">
              <li className={isPasswordMatch ? 'hidden' : 'text-red-500 pb-1'}>
                {renderIcon(isPasswordMatch)} Passwords do not match
              </li>
            </ul>}

          <button
            type="submit"
            className="bg-[#1A80F4] text-[white] text-sm px-4 py-2 border border-[#1A80F4] rounded mb-2 hover:bg-[#32A0FF]"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset'}
          </button>
          <p className="text-sm text-center text-gray-500">
            Remember your password?{" "}
            <a href="/login" className="text-[#1A80F4] hover:underline">
              Sign In
            </a>
          </p>

          {message && (
            <p className="mt-4 p-4 text-sm bg-gray-100 rounded text-gray-700 text-center">
              {message}
            </p>
          )}
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
  );
}
