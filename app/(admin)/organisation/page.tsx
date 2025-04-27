"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select"
import { TimePicker } from "antd"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import dayjs from "dayjs"
import { FilePlus } from "lucide-react"
import DatePickerComponent from "@/components/datePicker"
import Holidays from "@/components/holiday"
type Day = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"

const Organisation = () => {
  const supabase = createClient()
  const [timezone, setTimezone] = useState("(+11:00) Australian Eastern Daylight Time (Australia/Melbourne)")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>()
  const [companyName, setCompanyName] = useState("")
  const [previousName, setPreviousName] = useState("")
  const [businessType, setBusinessType] = useState("")
  // const { Column, HeaderCell, Cell } = Table;
  const [country, setCountry] = useState("Australia")
  const [currency, setCurrency] = useState("$ AUS")
  const [language, setLanguage] = useState("English")
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY")
  const [timeFormat, setTimeFormat] = useState("12 hours")
  const [weekStartDay, setWeekStartDay] = useState("Monday")
  const [companyDays, setCompanyDays] = useState<Day[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ])
  const [data, setData] = useState<any[]>()
  const[holidayData,setHolidayData]=useState<any[]>()
  const [openAdd, setOpenAdd] = useState(false);
  const [workingTime, setWorkingTime] = useState<
    Record<Day, { status: boolean; from: string; to: string; day: string }>
  >({
    Monday: { status: true, from: "9:00 AM", to: "7:00 PM", day: "Monday" },
    Tuesday: { status: true, from: "9:00 AM", to: "7:00 PM", day: "Tuesday" },
    Wednesday: {
      status: true,
      from: "9:00 AM",
      to: "7:00 PM",
      day: "Wednesday",
    },
    Thursday: { status: true, from: "9:00 AM", to: "7:00 PM", day: "Thursday" },
    Friday: { status: true, from: "9:00 AM", to: "7:00 PM", day: "Friday" },
    Saturday: {
      status: false,
      from: "9:00 AM",
      to: "7:00 PM",
      day: "Saturday",
    },
    Sunday: { status: false, from: "9:00 AM", to: "7:00 PM", day: "Sunday" },
  })
  const [editData, setEditData] = useState<any>();
  const [oldEditData, setOldEditData] = useState<any>();
  const [deleteOpen, setDeleteOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
  
    const [selectedId, setSelectedId] = useState<string | null>(null);
  function getSortedDays(startDay: Day) {
    const startIndex = companyDays.indexOf(startDay)
    return [...companyDays.slice(startIndex), ...companyDays.slice(0, startIndex)]
  }
  useEffect(() => {
    // Initial data fetch
    fetchData().then(() => setLoading(false))

    // Realtime: Listen to both tables
    const usersChannel = supabase
      .channel("custom-all-channel-users")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, (payload) => {
        console.log("User table change:", payload)
        fetchData()
      })
      .subscribe()

    const companiesChannel = supabase
      .channel("custom-all-channel-companies")
      .on("postgres_changes", { event: "*", schema: "public", table: "companies" }, (payload) => {
        console.log("Company table change:", payload)
        fetchData()
      })
      .subscribe()

    // Cleanup subscriptions on component unmount
    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(companiesChannel)
    }
  }, [])

  async function fetchData() {
    const { data: user } = await supabase.auth.getUser()

    if (!user?.user?.email) return

    const { data: company } = await supabase
      .from("companies")
      .select(
        "company_name,business_type,timezone,country,currency,language,date_format,time_format,week_start_day,working_time,holidays",
      )
      .eq("store_admin", user.user.email)
      .single()

    setUser(user.user)

    if (company) {
      const AllData = {
        companyName: company.company_name,
        businessType: company.business_type,
        timezone: company.timezone,
        country: company.country,
        currency: company.currency,
        language: company.language,
        dateFormat: company.date_format,
        timeFormat: company.time_format,
        weekStartDay: company.week_start_day,
        companyDays: getSortedDays(company.week_start_day),
        workingTime: company.working_time,
      }

      setData(AllData as any)
      setCompanyName(company.company_name)
      setPreviousName(company.company_name)
      setBusinessType(company.business_type)
      setTimezone(company.timezone)
      setCountry(company.country)
      setCurrency(company.currency)
      setLanguage(company.language)
      setDateFormat(company.date_format)
      setTimeFormat(company.time_format)
      setWeekStartDay(company.week_start_day)
      setCompanyDays(getSortedDays(company.week_start_day))
      setWorkingTime(company.working_time)

    }
  }

  async function handleSave() {
    if (companyName !== previousName) {
      const { error: userUpdateError } = await supabase
        .from("users")
        .update({ store_name: companyName })
        .eq("store_name", previousName)

      if (userUpdateError) {
        console.log("Error updating users table:", userUpdateError)
        return
      }
    }

    const { error: companyUpdateError } = await supabase
      .from("companies")
      .update({
        company_name: companyName,
        business_type: businessType,
        timezone: timezone,
        country: country,
        currency: currency,
        language: language,
        date_format: dateFormat,
        time_format: timeFormat,
        company_days: companyDays,
        week_start_day: weekStartDay,
        working_time: workingTime,
      })
      .eq("company_name", previousName)
      .single()

    if (companyUpdateError) {
      console.log("Error updating companies table:", companyUpdateError)
    } else {
      fetchData() // Optional refresh after save
    }
  }
    return (
    <div className="w-full bg-white p-4 ">
      <div className="px-4 ">
        <div className=" items-center gap-2">
          <h1 className="text-xl font-bold text-zinc-950">Organisation</h1>
          <p className="text-sm text-zinc-500">
            Manage your company details, including name, contact info, and branding, all in one place.
          </p>
        </div>
        <div className="mt-4">
          <Tabs defaultValue="companySetting" className="w-full">
            <TabsList className="w-fit">
              <TabsTrigger value="companySetting">Company Setting</TabsTrigger>
              <TabsTrigger value="holiday">Holiday List</TabsTrigger>
            </TabsList>
            <TabsContent value="companySetting" className="pt-3">
              <div className="">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Company Name */}
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium text-zinc-900">Company Name</Label>
                    <Input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      type="text"
                      placeholder="Enter your company name"
                      className="w-full border  border-zinc-300"
                    />
                  </div>

                  {/* Business Type */}
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-medium  text-zinc-900">Business Type</Label>
                    <Input
                      type="text"
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      placeholder="Enter your business type"
                      className="w-full border   border-zinc-300"
                    />
                  </div>

                  {/* Timezone */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="timezone" className="text-sm font-medium text-zinc-900">
                      Time Zone
                    </Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="w-full border border-zinc-300  text-sm text-gray-700">
                        <SelectValue placeholder="Select a time zone" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-md shadow-md">
                        <SelectGroup>
                          <SelectItem value="(+11:00) Australian Eastern Daylight Time (Australia/Melbourne)">
                            (+11:00) Australian Eastern Daylight Time (Australia/Melbourne)
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 ">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="timezone" className="text-sm font-medium text-zinc-900">
                      Country
                    </Label>
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="w-full border border-zinc-300  text-sm text-gray-700">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-md shadow-md">
                        <SelectGroup>
                          <SelectItem value="Australia">Australia</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="timezone" className="text-sm font-medium text-zinc-900">
                      Currency
                    </Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger className="w-full border border-zinc-300  text-sm text-gray-700">
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-md shadow-md">
                        <SelectGroup>
                          <SelectItem value="AUD">$AUD</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="timezone" className="text-sm font-medium text-zinc-900">
                      Language
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full border border-zinc-300  text-sm text-gray-700">
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent className="bg-white rounded-md shadow-md">
                        <SelectGroup>
                          <SelectItem value="English">English -default</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-2 pt-3">
                  <div className="flex flex-wrap items-start gap-12">
                    {/* Date Format */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="date-format" className="text-sm font-medium text-zinc-900">
                        Date Format
                      </label>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="date-format"
                            id="mm-dd-yyyy"
                            className="cursor-pointer"
                            checked={dateFormat === "MM/DD/YYYY"}
                            value="MM/DD/YYYY"
                            onChange={(e) => setDateFormat(e.target.value)}
                          />
                          <label htmlFor="mm-dd-yyyy" className="text-sm text-gray-700 cursor-pointer">
                            mm/dd/yyyy (10/23/2024)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="date-format"
                            id="dd-mm-yyyy"
                            className="cursor-pointer"
                            checked={dateFormat === "DD/MM/YYYY"}
                            value="DD/MM/YYYY"
                            onChange={(e) => setDateFormat(e.target.value)}
                          />
                          <label htmlFor="dd-mm-yyyy" className="text-sm text-gray-700 cursor-pointer">
                            dd/mm/yyyy (23/10/2024)
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Time Format */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="time-format" className="text-sm font-medium text-zinc-900">
                        Time Format
                      </label>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="time-format"
                            id="12-hour"
                            className="cursor-pointer"
                            checked={timeFormat === "12 hours"}
                            value="12 hours"
                            onChange={(e) => setTimeFormat(e.target.value)}
                          />
                          <label htmlFor="12-hour" className="text-sm text-gray-700 cursor-pointer">
                            12 Hours (3:08 PM)
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="time-format"
                            id="24-hour"
                            className="cursor-pointer"
                            checked={timeFormat === "24 hours"}
                            value="24 hours"
                            onChange={(e) => setTimeFormat(e.target.value)}
                          />
                          <label htmlFor="24-hour" className="text-sm text-gray-700 cursor-pointer">
                            24 Hours (15:06)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-2 py-3">
                  <label htmlFor="workWeekStartFrom" className="text-sm font-medium text-zinc-900">
                    Work Week Start From
                  </label>
                  <Select
                    value={weekStartDay}
                    onValueChange={(e: Day) => {
                      setWeekStartDay(e)
                      setCompanyDays(getSortedDays(e))
                    }}
                  >
                    <SelectTrigger className="px-3 py-2 text-sm w-1/2 border  border-gray-200 rounded-[6px] text-gray-800  placeholder:text-gray-400">
                      <SelectValue placeholder="" className="text-gray-400 " />
                    </SelectTrigger>
                    <SelectContent className="border-border_color rounded-[8px] bg-white">
                      <SelectGroup>
                        <SelectItem value="Sunday">Sunday</SelectItem>
                        <SelectItem value="Monday">Monday</SelectItem>
                        <SelectItem value="Tuesday">Tuesday</SelectItem>
                        <SelectItem value="Wednesday">Wednesday</SelectItem>
                        <SelectItem value="Thursday">Thursday</SelectItem>
                        <SelectItem value="Friday">Friday</SelectItem>
                        <SelectItem value="Saturday">Saturday</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <div className="flex flex-col gap-4 py-2">
                    {companyDays.map((day: Day) => (
                      <div key={day} className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          id={day}
                          className="cursor-pointer"
                          checked={workingTime[day]?.status}
                          onChange={() =>
                            setWorkingTime((prev) => ({
                              ...prev,
                              [day]: { ...prev[day], status: !prev[day]?.status },
                            }))
                          }
                        />
                        <label htmlFor={day} className="text-sm font-medium text-gray-700 cursor-pointer w-28">
                          {day}
                        </label>
                        <div className="flex items-center space-x-2 w-full">
                          {workingTime[day]?.status && workingTime[day]?.from !== "Closed" ? (
                            <TimePicker
                              use12Hours={timeFormat === "12 hours"}
                              needConfirm={false}
                              format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"}
                              value={workingTime[day]?.from ? dayjs(workingTime[day]?.from, "hh:mm A") : null}
                              onChange={(time) => {
                                setWorkingTime((prev) => ({
                                  ...prev,
                                  [day]: {
                                    ...prev[day],
                                    from: time?.format("hh:mm A") || null,
                                  },
                                }))
                              }}
                            />
                          ) : (
                            <div
                              className={`border border-border_color rounded-[6px] py-[5px] px-3 text-sm ${
                                timeFormat === "12 hours" ? "w-[169px]" : "w-[154px]"
                              }  min-w-24 bg-gray-50`}
                            >
                              Closed
                            </div>
                          )}
                          <span className="text-sm text-center pl-1">to</span>
                          {workingTime[day]?.status && workingTime[day]?.to !== "Closed" ? (
                            <TimePicker
                              className="bg-gray-50"
                              use12Hours={timeFormat === "12 hours"}
                              format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"}
                              needConfirm={false}
                              value={
                                workingTime[day]?.to
                                  ? dayjs(workingTime[day]?.to, "hh:mm A") // Convert to Dayjs
                                  : null
                              }
                              onChange={(time: any) =>
                                setWorkingTime((prev) => ({
                                  ...prev,
                                  [day]: {
                                    ...prev[day],
                                    to: time?.format("hh:mm A") || null,
                                  },
                                }))
                              }
                            />
                          ) : (
                            <div
                              className={`border border-border_color rounded-[6px] py-[5px] px-3 text-sm ${
                                timeFormat === "12 hours" ? "w-[169px]" : "w-[154px]"
                              }  min-w-24 bg-gray-50`}
                            >
                              Closed
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full flex justify-end border border-bgborder_color rounded-[6px] bg-white p-2 gap-2">
                  <button className="px-8 py-2 text-xs border border-gray-200 rounded-[6px] text-gray-800 ">
                    Cancel
                  </button>
                  <button
                    className="px-8 py-2 text-xs border border-gray-200 rounded-[6px] bg-blue-700 text-white"
                    onClick={() => handleSave()}
                  >
                    Save
                  </button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="holiday" className="pt-3 text-sm text-zinc-700">
              <Holidays/>
              
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
export default Organisation
