'use client';
import { useState, useEffect } from "react";
import { SubmitButton } from "./submit-button";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Eye, EyeOff, TriangleAlert} from "lucide-react";
import { toaster, Message} from 'rsuite';
import { supabase } from '@/utils/supabase/client';

export default function SignUp() {
  const [message, setMessage] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  useEffect(() => {
    // Initialize Supabase client only on client side
    setSupabaseClient(supabase);
  }, []);

  const fetchLogo = async () => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('app_settings')
      .select('logo')
      .single();
  
    if (error) {
      console.error('Error fetching logo:', error);
      return null;
    }
    return data?.logo || null;
  };

  useEffect(() => {
    if (supabase) {
      const fetchLogoUrl = async () => {
        const logoUrl = await fetchLogo();
        setLogoUrl(logoUrl);
      };
      fetchLogoUrl();
    }
  }, [supabaseClient]);


  // Sign up handler
  const signUp = async (formData: FormData) => {
    const email = formData.get("email") as string;

    // Ensure the passwords match before signing up
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true); // Set loading state to true

    const res = await fetch('/auth/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setIsLoading(false); // Reset loading state after request

    if (!res.ok) {
      toaster.push(<Message showIcon type={"error"}><strong>Access Denied:</strong> {data.error || 'Could not authenticate user'}</Message>, { placement:"topEnd", duration: 3000 })
    } else {
      toaster.push(<Message showIcon type={"success"}> {data.message}</Message>, { placement:"topEnd", duration: 3000 })
    }
  };

    // Validation checks
    const isCapitalLetter = /[A-Z]/.test(password.charAt(0));
    const hasValidLength = password.length >= 6 && password.length <= 15;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const noSpaces = !/\s/.test(password);
    const isFormValid = isCapitalLetter && hasValidLength && hasSpecialChar && noSpaces;
    const isPasswordMatch = password === confirmPassword;

    const renderIcon = (condition:boolean) =>
      condition ? <CheckCircle className="text-green-500 inline ml-2" size={14} /> : <TriangleAlert className="text-red-500 inline ml-2" size={16}/>;

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
        <form className="animate-in flex flex-col justify-center gap text-foreground w-[600px]" onSubmit={(e) => {
          e.preventDefault();
          signUp(new FormData(e.target as HTMLFormElement));
        }}>
          <div className="my-5">
            <h1 className="text-[30px] font-semibold text-secondary-800 ">Sign Up</h1>
            <p className="text-sm text-secondary-400 font-thin">Create an account to manage your events</p>
          </div>
          <label className="text-sm text-secondary-900 font-light" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-[6px] border-[#D4D4D8] px-4 py-2 bg-inherit border mt-2 mb-6 text-sm"
            name="email"
            placeholder="Enter your email"
            required
          />
          <label className="text-sm text-secondary-900 font-light" htmlFor="password">
            Password
          </label>
          <div className="relative mb-6">
            <input
              className="rounded-[6px] border-[#D4D4D8] px-4 py-2 bg-inherit border text-sm w-full"
              type={passwordVisible ? "text" : "password"}
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
              {passwordVisible ? <Eye size={18} className="text-gray-500"/> : <EyeOff size={18} className="text-gray-500"/>}
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
          <label className="text-sm text-secondary-900 font-light" htmlFor="confirm-password">
            Confirm Password
          </label>
          <div className="relative mb-6">
            <input
              className="rounded-[6px] border-[#D4D4D8] px-4 py-2 bg-inherit border text-sm w-full"
              type={confirmPasswordVisible ? "text" : "password"}
              name="confirm-password"
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
              {confirmPasswordVisible ? <Eye size={18} className="text-gray-500"/> : <EyeOff size={18} className="text-gray-500"/>}
            </button>
          </div>
          {isFormValid && isPasswordMatch ? null :
            <ul className="text-sm mb-3 -mt-2">
              <li className={isPasswordMatch ? 'hidden' : 'text-red-500 pb-1'}>
                {renderIcon(isPasswordMatch)} Passwords do not match
              </li>
            </ul>}
          <SubmitButton
            type="submit"
            className="bg-[#1A80F4] text-[white] text-sm px-4 py-2 border border-[#1A80F4] rounded mb-2 hover:bg-[#32A0FF]"
            pendingText={isLoading ? "Signing Up..." : "Sign Up"} // Show pending text
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </SubmitButton>
          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-[#1A80F4] hover:underline">
              Log In
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
        {/* <div
          className="bg-cover bg-center z-1 h-full shadow-2xl"
          style={{
            backgroundImage: 'url("/images/login-banner.webp")',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top',
            backgroundSize: 'cover',
          }}
        ></div> */}
      </div>
    </div>
  );
}
