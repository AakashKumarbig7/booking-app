"use client"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from '@/utils/supabase/client';
import {
  Bell,
  Building2,
 
  Home,
  LogOut,
  ShoppingCart,
  // Trophy,
  Users2,
  BarChart3,
  Crown,
  // LayoutDashboard,
  FlagTriangleRight,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

const SideBar = () => {
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [collapsed] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [loadingMenu, setLoadingMenu] = useState<string | null>(null)
  // const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const allowedModules = [
    "/organisation",
    "staff-management",
    "sports-management",
    "pos-setting",
    "loyalty-management",
    "notifications",
    "reports-and-analytics",
  ]

  const navlinks = [
    { name: "organisation", icon: <Building2 size={18} />, label: "Organisation" },
    { name: "staff-management", icon: <Users2 size={18} />, label: "Staff Management" },
    { name: "sports-management", icon: <FlagTriangleRight size={18} />, label: "Sports Management" },
    { name: "pos-setting", icon: <ShoppingCart size={18} />, label: "POS Settings" },
    { name: "loyalty-management", icon: <Crown size={18} />, label: "Loyalty Management" },
    { name: "notifications", icon: <Bell size={18} />, label: "Notification" },
    { name: "reports-and-analytics", icon: <BarChart3 size={18} />, label: "Reports & Analytics" },
  ]

  const signOut = async () => {
    // const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push("/login")
    await supabase.auth.signOut()
    router.push("/login")
  }

  useEffect(() => {
    setLoadingMenu(pathname.split("/")[1])
    if (allowedModules.includes(pathname)) {
      setActiveMenu(pathname.split("/")[1])
    }
    setLoadingMenu(null)
  }, [pathname])

  // const toggleSidebar = () => {
  //   setCollapsed(prev => !prev)
  // }

  // const sidebarWidth = collapsed && !isHovered ? "w-16" : "w-[220px]"

  return (
    <div className="h-full">
      <div
        className={` relative h-screen  ${
          collapsed ? "w-16 hover:w-[220px]" : "w-[220px]"
        } bg-teal-900 text-white z-50 select-none transition-width duration-300 ease-in-out` }
        onMouseEnter={() => collapsed && setIsHovered(true)}
        onMouseLeave={() => collapsed && setIsHovered(false)}
      >
        <div className="flex justify-between items-center px-3 py-2">
          <div className="flex items-center">
            <Image
              src="/images/s22logo.png"
              alt="Logo"
              width={collapsed && !isHovered ? 40 : 106}
              height={40}
              className="py-1"
            />
          </div>
          <div className="flex space-x-1">
            {(!collapsed || isHovered) && (
              <button className="text-white p-1 rounded hover:bg-teal-800 ">
                <Bell size={16} />
              </button>
            )}
            {/* <button
              onClick={toggleSidebar}
              className="text-white p-1 rounded hover:bg-teal-800 "
            >
              {(!collapsed || isHovered) && <LayoutDashboard size={16} />}
            </button> */}
          </div>
        </div>

        <div className="mt-4">
          <ul className="flex flex-col space-y-1 px-2">
            {navlinks.map((link, index) => {
              const isActive = activeMenu === link.name || pathname.includes(link.name)
              const isLoading = loadingMenu === link.name

              return (
                <li
                  key={index}
                  onClick={() => {
                    router.push(`/${link.name}`)
                    setLoadingMenu(link.name)
                    setActiveMenu(link.name)
                  }}
                  className={`flex items-center px-3 py-2 rounded-md cursor-pointer transition-all duration-300 ease-in-out  ${
                    isActive ? "bg-teal-700" : "hover:bg-teal-800"
                  }`}
                >
                  <div className="flex items-center w-full">
                    <div className={`text-white ${!collapsed || isHovered ? "mr-3" : ""}`}>
                      {isLoading ? (
                        <div className="animate-spin h-5 w-5">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : (
                        link.icon
                      )}
                    </div>
                    {(!collapsed || isHovered) && <span className="text-white text-sm">{link.label}</span>}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3  border-t border-teal-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center cursor-pointer" onClick={() => router.push("/profile")}>
              <Avatar className="h-8 w-8 border border-teal-700">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>LX</AvatarFallback>
              </Avatar>
              {(!collapsed || isHovered) && (
                <div className="ml-2 text-white">
                  <p className="text-sm font-medium">Laxman</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              {(!collapsed || isHovered) && (
                <button
                  onClick={() => router.push("")}
                  className="p-1.5 rounded-md text-white hover:bg-teal-700"
                >
                  <Home size={16} />
                </button>
              )}
              {(!collapsed || isHovered) && (
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-md text-white hover:bg-teal-700"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SideBar
