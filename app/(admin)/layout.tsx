
import SideBar from "@/components/sideBar"
import type React from "react"
import { GlobalContextProvider } from "@/context/store";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full bg-white text-black">
      <main className="w-full h-screen">
        <div className=" flex ">
          <div className={` h-screen `}>
            <SideBar />
          </div>
          <div className="custom-scroll h-screen max-h-screen w-full overflow-y-scroll">
          <GlobalContextProvider>
                            {children}
                        </GlobalContextProvider>
           
            
            </div>
        </div>
      </main>
    </div>
  )
}
