

import "./globals.css";
import "@fontsource/inter";
import 'rsuite/dist/rsuite-no-reset.min.css'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Toaster } from "@/components/ui/sonner";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        <ToastContainer></ToastContainer>
      <div className="h-screen">
        <AntdRegistry>
        {children}
        </AntdRegistry>
        </div>
      <Toaster/>
      </body>
    </html>
  );
}
