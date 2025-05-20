"use client";

import {  useState } from "react";
import { SubmitButton } from "../app/(auth)/login/submit-button";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import {  useSearchParams } from "next/navigation";
import { createClient } from '@/utils/supabase/client';
import { toaster, Message } from "rsuite";

// const supabase = createClient();

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  
  // const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  // const fetchLogo = async () => {
  //   const { data, error } = await supabase.from("app_settings").select("logo").single();
  //   if (error) return null;
  //   return data?.logo || null;
  // };

  // useEffect(() => {
  //   const fetchLogoUrl = async () => {
  //     const logoUrl = await fetchLogo();
  //     setLogoUrl(logoUrl);
  //   };
  //   fetchLogoUrl();
  // }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
// console.log(formData.get("email"));
// console.log(formData.get("password"));
const email = formData.get("email") as string;
  const password = formData.get("password") as string;
console.log("working");
  const { error } = await supabase.auth.signInWithPassword({  
    email,
    password,
  });

  if (error) {
    // Return a structured error response
    console.log(error);
  }

    const fetchData = async () => {
      const { data } = await supabase
        .from("users")
        .select("status,access")
        .eq("email", (formData.get("email")!.toString()).toLowerCase())
        .single();

      if (data?.status === true) {
        toaster.push(
          <Message showIcon type={"success"}>
            <strong>Login Successfully!</strong>
          </Message>,
          { placement: "topEnd", duration: 2000 }
        );
        if (data?.access === "admin") window.location.href = "/organisation";
        else if (data?.access === "user") window.location.href = "/home";
        else window.location.href = "/dashboard-sa";
      } else {
        toaster.push(
          <Message showIcon type={"error"}>
            <strong>Access Denied!</strong> Your access has been restricted.
          </Message>,
          { placement: "topEnd", duration: 3000 }
        );
        setLoading(false);
      }
    };

    setLoading(true);
    // fetchData();
    const response = await fetch("/auth/login", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      setLoading(false);
      toaster.push(
        <Message showIcon type={"error"}>
          <strong>{data.error}!</strong>
        </Message>,
        { placement: "topEnd", duration: 3000 }
      );
    } else {
      setErrorMessage("");
      fetchData();
    }
  };

  return (
    <div className="">
      {/* Desktop View */}
      <div className="w-full h-screen overflow-hidden relative hidden md:flex">
        <div className="absolute top-0 left-0 p-4">
          <Link href="/dashboard">
            {/* <Image
              src={logoUrl || "/images/logo.png"}
              width={100}
              height={36}
              alt="logo"
              className="rounded py-[1px] bg-white"
            /> */}
          </Link>
        </div>

        <div className="w-1/2 flex items-center justify-center p-6">
          <form onSubmit={handleSubmit} className="animate-in flex flex-col justify-center gap text-foreground w-[600px]">
            <div className="my-5">
              <h1 className="text-[30px] font-semibold text-secondary-800">Sign In</h1>
              <p className="text-sm text-secondary-400 font-thin">Access your account to manage your events</p>
            </div>
            <label className="text-sm text-secondary-900 font-light" htmlFor="email">Email</label>
            <input
              className="rounded-[6px] border-secondary-300 px-4 py-2 bg-inherit border mt-1 mb-6 text-sm"
              name="email"
              placeholder="Enter your email"
              required
            />
            <label className="text-sm text-secondary-900 font-light" htmlFor="password">Password</label>
            <div className="relative mb-6 mt-1">
              <input
                className="rounded-[6px] border-secondary-300 px-4 py-2 bg-inherit border text-sm w-full"
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <Eye size={18} className="text-gray-500" /> : <EyeOff size={18} className="text-gray-500" />}
              </button>
            </div>
            <SubmitButton
              formAction={async () => {}}
              className="bg-teal-800 text-[white] text-sm px-4 py-2 border border-primary-700 rounded mb-2 hover:bg-primary-600 fade"
              pendingText={"Logging In..."}
            >
              {loading ? "Logging In..." : "Log In"}
            </SubmitButton>
            <div className="flex flex-row justify-between py-2">
              <Link href="/forgot-password" className="rounded-md no-underline text-primary-700 text-sm">
                Forgot Password
              </Link>
            </div>
            {message && (
              <p className="mt-4 p-4 text-sm bg-green-100 rounded text-green-700 text-center">
                {message}
              </p>
            )}
            {errorMessage && (
              <p className="mt-4 p-4 text-sm bg-red-100 rounded text-red-700 text-center">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
        {/* <div className="w-1/2">
          <div
            className="bg-cover bg-center z-1 h-full shadow-2xl"
            style={{
              backgroundImage: 'url("/images/login-banner.webp")',
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          ></div>
        </div> */}
      </div>

      {/* Mobile View */}
      <div className="w-full h-full overflow-hidden relative flex-col md:hidden justify-center align-middle p-4">
        <div className="w-full h-full flex flex-col justify-center gap-4">
          <div>
            <div className="flex align-middle w-full justify-center">
              {/* <Link href="/dashboard">
                <Image
                  src={logoUrl || "/images/logo.png"}
                  width={260}
                  height={142}
                  alt="logo"
                  className="rounded py-[1px] bg-white"
                />
              </Link> */}
            </div>
            <div className="w-full flex flex-col justify-center align-middle text-center">
              <h1 className="text-[18px] font-semibold text-secondary-800 mt-2">Access schedule anywhere-anytime</h1>
              <p className="text-sm text-secondary-400 font-thin">
                View your schedule anywhere, anytime <br /> with real-time updates
              </p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="animate-in flex flex-col justify-center gap text-foreground">
            <div className="my-5">
              <h1 className="text-2xl font-semibold text-secondary-800">Sign In</h1>
              <p className="text-sm text-secondary-400 font-thin">Access your account to manage your events</p>
            </div>
            <label className="text-sm text-secondary-900 font-light" htmlFor="email">Email</label>
            <input
              className="rounded-[6px] border-secondary-300 px-4 py-2 bg-inherit border mt-1 mb-6 text-sm"
              name="email"
              placeholder="Enter your email"
              required
            />
            <label className="text-sm text-secondary-900 font-light" htmlFor="password">Password</label>
            <div className="relative mb-6 mt-1">
              <input
                className="rounded-[6px] border-secondary-300 px-4 py-2 bg-inherit border text-sm w-full"
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <Eye size={18} className="text-gray-500" /> : <EyeOff size={18} className="text-gray-500" />}
              </button>
            </div>
            <SubmitButton
              formAction={async () => {}}
              className="bg-primary-700 text-[white] text-sm px-4 py-2 border border-primary-700 rounded mb-2 hover:bg-primary-600 fade"
              pendingText={"Logging In..."}
            >
              {loading ? "Logging In..." : "Log In"}
            </SubmitButton>
            <div className="flex flex-row justify-between py-2">
              <Link href="/forgot-password" className="rounded-md no-underline text-primary-700 text-xs">
                Forgot Password
              </Link>
            </div>
            {message && (
              <p className="mt-4 p-4 text-sm bg-green-100 rounded text-green-700 text-center">
                {message}
              </p>
            )}
            {errorMessage && (
              <p className="mt-4 p-4 text-sm bg-red-100 rounded text-red-700 text-center">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
