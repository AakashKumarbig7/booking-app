"use client";

import dynamic from "next/dynamic";

const LoginPage = dynamic(() => import("@/components/login"), { ssr: false });
const Login = () => {
  return <LoginPage />;
};

export default Login;