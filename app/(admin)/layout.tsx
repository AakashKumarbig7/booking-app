
import SideBar from "@/components/sideBar"
import type React from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen w-full bg-white text-black">
      <main className="w-full h-screen">
        <div className="w-full flex relative">
          <div className={`absolute top-0 left-0 h-screen w-16  z-10`}>
            <SideBar />
          </div>
          <div className="custom-scroll h-screen ml-16 w-full">{children}</div>
        </div>
      </main>
    </div>
  )
}
