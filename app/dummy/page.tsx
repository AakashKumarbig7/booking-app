"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

import { TimePicker } from "antd";

import dayjs, { Dayjs } from "dayjs";
import {  useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Table } from "rsuite";
import { Button } from "@/components/ui/button";
import Holidays from "@/components/holiday";
import { FilePlus } from "lucide-react";
import {  SquarePen, Trash2 } from "lucide-react";


import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useGlobalContext } from "@/context/store";
import DatePicker from "@/components/datePicker";
import DatePickerComponent from "@/components/datePicker";
import { format } from "date-fns";

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
  
const Organisation = () => {
  const [timezone, setTimezone] = useState(
    "(+11:00) Australian Eastern Daylight Time (Australia/Melbourne)"
  );
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>();
  const [companyName, setCompanyName] = useState("");
  const [previousName, setPreviousName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const { Column, HeaderCell, Cell } = Table;
  const [country, setCountry] = useState("Australia");
  const [currency, setCurrency] = useState("$ AUS");
  const [language, setLanguage] = useState("English");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = useState("12 hours");
  const [weekStartDay, setWeekStartDay] = useState("Monday");
  const [companyDays, setCompanyDays] = useState<Day[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ]);
  const [openAdd, setOpenAdd] = useState(false);
    const [editData, setEditData] = useState<any>();
    const [oldEditData, setOldEditData] = useState<any>();
    

    const [sortColumn, setSortColumn] = useState();
    const [sortType, setSortType] = useState();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
  
    const [selectedId, setSelectedId] = useState<string | null>(null);
  
  
  function getSortedDays(startDay: Day) {
    const startIndex = companyDays.indexOf(startDay);
    return [
      ...companyDays.slice(startIndex),
      ...companyDays.slice(0, startIndex),
    ];
  }
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
  });
  const [data, setData] = useState<any[]>();
  const [holidayData, setHolidayData] = useState<any[]>();
  // async function  fetchComapny ()
  // {
  //   const { data: user } = await supabase.auth.getUser();
  //   const { data: company } = await supabase.from("companies").select("company_name,business_type,timezone,country,currency,language,date_format,time_format,week_start_day,working_time").eq("store_admin", user?.user?.email).single();
  //   setUser(user.user);
  //   if (company) {
  //     console.log("company",company)
  //   }
  // }
  // useEffect(() => {
  //   fetchComapny();
  // }, []);

  async function fetchData() {
    const { data: user } = await supabase.auth.getUser();
    const { data: company } = await supabase
      .from("companies")
      .select(
        "company_name,business_type,timezone,country,currency,language,date_format,time_format,week_start_day,working_time"
      )
      .eq("store_admin", user?.user?.email)
      .single();
    setUser(user.user);
    console.log("company", company);
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
      };
      console.log(company);
      setData(AllData as any);
      setCompanyName(company.company_name || companyName);
      setPreviousName(company.company_name || companyName);
      setBusinessType(company.business_type || businessType);
      setTimezone(company.timezone || timezone);
      setCountry(company.country || country);
      setCurrency(company.currency || currency);
      setLanguage(company.language || language);
      setDateFormat(company.date_format || dateFormat);
      setTimeFormat(company.time_format || timeFormat);
      setWeekStartDay(company.week_start_day || weekStartDay);
      setCompanyDays(getSortedDays(company.week_start_day || weekStartDay));
      setWorkingTime(company.working_time || workingTime);
      console.log("alldata", AllData);
    }
  }
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedState = sessionStorage.getItem("storeState");
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        if (parsedState?.storeName === null) {
          // fetchData().then(() => setLoading(false));
        } else {
          const AllData = {
            storeName: parsedState?.storeName,
            businessType: parsedState?.company?.business_type,
            timezone: parsedState?.company?.timezone,
            country: parsedState?.company?.country,
            currency: parsedState?.company?.currency,
            language: parsedState?.company?.language,
            dateFormat: parsedState?.company?.date_format,
            timeFormat: parsedState?.company?.time_format,
            weekStartDay: parsedState?.company?.week_start_day,
            companyDays: getSortedDays(parsedState?.company?.week_start_day),
            workingTime: parsedState?.company?.working_time,
          };
          setData(AllData as any);
          setCompanyName(parsedState?.storeName);
          setPreviousName(parsedState?.storeName || companyName);
          setBusinessType(parsedState?.company?.business_type || businessType);
          setTimezone(parsedState?.company?.timezone || timezone);
          setCountry(parsedState?.company?.country || country);
          setCurrency(parsedState?.company?.currency || currency);
          setLanguage(parsedState?.company?.language || language);
          setDateFormat(parsedState?.company?.date_format || dateFormat);
          setTimeFormat(parsedState?.company?.time_format || timeFormat);
          setWeekStartDay(parsedState?.company?.week_start_day || weekStartDay);
          setCompanyDays(
            getSortedDays(parsedState?.company?.week_start_day || weekStartDay)
          );
          setWorkingTime(parsedState?.company?.working_time || workingTime);
        }
      } 
      else {
        fetchData().then(() => setLoading(false));
      }
    }
  }, []);
  async function handleSave() {
    console.log("enterd");
    if (companyName !== previousName) {
      const { error } = await supabase
        .from("users")
        .update({
          store_name: companyName,
        })
        .eq("store_name", previousName);
      if (error) return;
    }
    console.log(previousName);
    const { error } = await supabase
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
      .single();
    if (error) {
      // toast({
      //   title: "Error",
      //   description: "Unable to update company details",
      // });
      console.log(error);
    } else {
      // toast({
      //   title: "Success",
      //   description: "Company details updated successfully",
      // })
    }
  }
  const handleSortColumn = (sortColumn: any, sortType: any) => {
    setTimeout(() => {
      setSortColumn(sortColumn);
      setSortType(sortType);
    });
  };
  async function handleCreate(newData: any) {
    console.log(newData);

    if (newData.name && newData.startDate && newData.endDate) {
      const randomId = () => Math.random().toString(36).substring(2, 9);

      // Ensure all holidays have a unique ID
      const updatedData = {
        ...newData,
        id: newData.id || randomId(),
        startDate: new Date(newData.startDate).toString(),
        endDate: new Date(newData.endDate).toString(),
      };

      // Generate unique IDs for all holidays if missing
      const updatedHolidays = (holidayData ?? []).map((holiday: any) => ({
         ...holiday,
        id: holiday.id || randomId(),
      }));

      const datas = [...updatedHolidays, updatedData];
      setHolidayData(datas);

      await supabase
        .from("companies")
        .update({ holidays: datas })
        .eq("store_admin", user?.email)
        .single();

      setOpenEdit(false);
      setDeleteOpen(false);
      setOpenAdd(false);
      setEditData(null);

    //   toast({
    //     title: "Created",
    //     description: "Holiday created successfully.",
    //   });
    }
  }
  const handleUpdate1 = async (newData: any) => {
    const filteredData = (holidayData ?? []).filter((item: any) => item.id !== oldEditData.id);
    if (newData.name && newData.startDate && newData.endDate) {
      setHolidayData([...filteredData, newData]);
      const datas = [...filteredData, newData];
      await supabase
        .from("companies")
        .update({ holidays: datas })
        .eq("store_admin", user?.email)
        .single();
      setOpenEdit(false);
      setDeleteOpen(false);
      setOpenAdd(false);
    //   toast({
    //     title: "Updated",
    //     description: "Holiday updated successfully.",
    //   });
    }
  };
  const handleDelete = async () => {
    if (!selectedId) return;
    const filteredData = holidayData?.filter((item: any) => item.id !== selectedId);

    if (filteredData) {
      await supabase
        .from("companies")
        .update({ holidays: filteredData })
        .eq("store_admin", user?.email)
        .single();
    //   toast({
    //     title: "Deleted",
    //     description: "Department deleted successfully.",
    //   });
    }
    setHolidayData(filteredData);
    setDeleteOpen(false);
    setSelectedId(null);
  };

  function handleEdit(data: any) {
    setOldEditData(data);
    setEditData(data);
    setOpenEdit(true);
  }

  function AddDepartment() {
    setOldEditData({
      name: null,
    });
    setEditData({
      name: null,
    });
    setOpenAdd(true);
  }

  const getData = () => {
    if (sortColumn && sortType) {
      return (holidayData ?? []).sort((a, b) => {
        const x = a[sortColumn];
        const y = b[sortColumn];
        if (typeof x === "string" && typeof y === "string") {
          return sortType === "asc"
            ? (x as string).localeCompare(y as string)
            : (y as string).localeCompare(x as string);
        }
        if (typeof x === "number" && typeof y === "number") {
          return sortType === "asc" ? x - y : y - x;
        }
        return 0;
      });
    }
    return data;
  };

  return (
    <div className="flex w-full bg-white p-4 md:p-6">
      <div className="w-full flex flex-col gap-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-zinc-950">Organisation</h1>
          <p className="text-sm text-zinc-500">
            Manage your company details, including name, contact info, and
            branding, all in one place.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="companySetting" className="w-full">
          <TabsList className="w-fit">
            <TabsTrigger value="companySetting">Company Setting</TabsTrigger>
            <TabsTrigger value="holiday">Holiday List</TabsTrigger>
          </TabsList>

          {/* Company Setting Content */}
          <TabsContent value="companySetting" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Company Name */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium text-zinc-900">
                  Company Name
                </Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  type="text"
                  placeholder="Enter your company name"
                  className="w-full border bg-gray-50 border-zinc-300"
                />
              </div>

              {/* Business Type */}
              <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium  text-zinc-900">
                  Business Type
                </Label>
                <Input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Enter your business type"
                  className="w-full border  bg-gray-50 border-zinc-300"
                />
              </div>

              {/* Timezone */}
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="timezone"
                  className="text-sm font-medium text-zinc-900"
                >
                  Time Zone
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
                    <SelectValue placeholder="Select a time zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-md shadow-md">
                    <SelectGroup>
                      <SelectItem value="(+11:00) Australian Eastern Daylight Time (Australia/Melbourne)">
                        (+11:00) Australian Eastern Daylight Time
                        (Australia/Melbourne)
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="timezone"
                  className="text-sm font-medium text-zinc-900"
                >
                  Country
                </Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
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
                <Label
                  htmlFor="timezone"
                  className="text-sm font-medium text-zinc-900"
                >
                  Currency
                </Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
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
                <Label
                  htmlFor="timezone"
                  className="text-sm font-medium text-zinc-900"
                >
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
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
            <div className="flex flex-col gap-2 p-2 py-3">
              <div className="flex flex-wrap items-start gap-12">
                {/* Date Format */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="date-format"
                    className="text-sm font-medium text-zinc-900"
                  >
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
                      <label
                        htmlFor="mm-dd-yyyy"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
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
                      <label
                        htmlFor="dd-mm-yyyy"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        dd/mm/yyyy (23/10/2024)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Time Format */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="time-format"
                    className="text-sm font-medium text-zinc-900"
                  >
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
                      <label
                        htmlFor="12-hour"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
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
                      <label
                        htmlFor="24-hour"
                        className="text-sm text-gray-700 cursor-pointer"
                      >
                        24 Hours (15:06)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 p-2 py-3">
              <label
                htmlFor="workWeekStartFrom"
                className="text-sm font-medium text-zinc-900"
              >
                Work Week Start From
              </label>
              <Select
                value={weekStartDay}
                onValueChange={(e: Day) => {
                  setWeekStartDay(e);
                  setCompanyDays(getSortedDays(e));
                }}
              >
                <SelectTrigger className="px-3 py-2 text-sm w-1/2 border  border-gray-200 rounded-[6px] text-gray-800 bg-gray-50 placeholder:text-gray-400">
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
                    <label
                      htmlFor={day}
                      className="text-sm font-medium text-gray-700 cursor-pointer w-28"
                    >
                      {day}
                    </label>
                    <div className="flex items-center space-x-2 w-full">
                      {workingTime[day]?.status &&
                      workingTime[day]?.from !== "Closed" ? (
                        <TimePicker
                          use12Hours={timeFormat === "12 hours"}
                          needConfirm={false}
                          format={
                            timeFormat === "12 hours" ? "h:mm a" : "HH:mm"
                          }
                          value={
                            workingTime[day]?.from
                              ? dayjs(workingTime[day]?.from, "hh:mm A")
                              : null
                          }
                          onChange={(time) => {
                            setWorkingTime((prev) => ({
                              ...prev,
                              [day]: {
                                ...prev[day],
                                from: time?.format("hh:mm A") || null,
                              },
                            }));
                          }}
                        />
                      ) : (
                        <div
                          className={`border border-border_color rounded-[6px] py-[5px] px-3 text-sm ${
                            timeFormat === "12 hours"
                              ? "w-[169px]"
                              : "w-[154px]"
                          }  min-w-24 bg-gray-50`}
                        >
                          Closed
                        </div>
                      )}
                      <span className="text-sm text-center">to</span>
                      {workingTime[day]?.status &&
                      workingTime[day]?.to !== "Closed" ? (
                        <TimePicker
                          className="bg-gray-50"
                          use12Hours={timeFormat === "12 hours"}
                          format={
                            timeFormat === "12 hours" ? "h:mm a" : "HH:mm"
                          }
                          needConfirm={false}
                          value={
                            workingTime[day]?.to
                              ? dayjs(workingTime[day]?.to, "hh:mm A") // Convert to Dayjs
                              : null
                          }
                          onChange={(time) =>
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
                            timeFormat === "12 hours"
                              ? "w-[169px]"
                              : "w-[154px]"
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
          </TabsContent>
          
          {/* Holiday Tab */}
          <TabsContent value="holiday" className="pt-4 text-sm text-zinc-700">
            <div>
            <Sheet open={openAdd} onOpenChange={setOpenAdd}>
          <SheetTrigger>
          
            <div
              className="bg-blue-700 text-white rounded-[12px] px-4 h-10 pr-5  text-xs flex items-center"
              onClick={() => AddDepartment()}
            >
              <FilePlus size={14} />
              <span className="ml-2">Add Holiday</span>
            </div>
          
          </SheetTrigger>
          <SheetContent
            className="bg-white border-border_color"
            style={{ maxWidth: "460px" }}
          >
            <SheetHeader className="relative h-full">
              <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">
                Add new Holiday
              </SheetTitle>
              <SheetDescription>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1 py-2">
                    <label className="text-gray-800 text-xs font-medium">
                      Description
                    </label>
                    <div className="relative  flex items-center gap-2 w-full">
                      <input
                        type="text"
                        className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                        value={editData?.name}
                        onChange={(e) =>
                          setEditData({ ...editData, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-6 mt-3 w-full">
                      <div className="w-1/2">
                        <label className="text-gray-800 text-xs font-medium">
                          Start Date
                        </label>
                        <DatePickerComponent
                          value={editData?.startDate}
                          onChange={(e) => {
                            setEditData({
                              ...editData,
                              startDate: e?.toString(),
                            });
                          }}
                          className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="text-gray-800 text-xs font-medium">
                          End Date
                        </label>
                        <DatePickerComponent
                          value={editData?.endDate}
                          onChange={(e) => {
                            setEditData({
                              ...editData,
                              endDate: e?.toString(),
                            });
                          }}
                          className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-start gap-2 absolute bottom-0">
                  <button
                    className="bg-blue-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                    onClick={() => handleCreate(editData)}
                  >
                    Save Holiday
                  </button>
                  <button
                    className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                    onClick={() => setOpenAdd(false)}
                  >
                    Cancel
                  </button>
                </div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <div className="w-full border border-border_color rounded-[8px] bg-white text-sm my-2">
        <Table
          data={getData()}
          loading={loading}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn}
          onRowClick={(rowData) => {}}
          className="rounded-[8px] "
          autoHeight
        >
          <Column width={300} sortable>
            <HeaderCell
              className="uppercase select-none text-left font-bold"
              style={{ backgroundColor: "#f2f2f2", paddingLeft: "50px" }}
            >
              Reason
            </HeaderCell>
            <Cell className="text-left pl-10" dataKey="name" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell
              className="uppercase select-none text-left font-bold"
              style={{ backgroundColor: "#f2f2f2" }}
            >
              start date
            </HeaderCell>
            <Cell>
              {(rowData) => {
                const date = new Date(rowData.startDate);
                const formattedDate = format(
                  date,
                  dateFormat.split("/").join(" ")
                );
                return formattedDate;
              }}
            </Cell>
          </Column>
          <Column flexGrow={1}>
            <HeaderCell
              className="uppercase select-none text-left font-bold"
              style={{ backgroundColor: "#f2f2f2" }}
            >
              end date
            </HeaderCell>
            <Cell>
              {(rowData) => {
                const date = new Date(rowData.endDate);
                const formattedDate = format(
                  date,
                  dateFormat.split("/").join(" ")
                );
                return formattedDate;
              }}
            </Cell>
          </Column>
          <Column width={200} fixed="right">
            <HeaderCell
              className="uppercase text-center font-bold pl-2"
              style={{ backgroundColor: "#f2f2f2" }}
            >
              Action
            </HeaderCell>

            <Cell
              style={{ padding: "6px" }}
              className="text-left flex align-middle"
            >
              {(rowData) => (
                <div className="flex justify-evenly align-middle items-center h-full text-gray-600">
                  <Sheet open={openEdit} onOpenChange={setOpenEdit}>
                    <SheetTrigger>
                      <div
                        onClick={() => handleEdit(rowData)}
                        className="flex items-center hover:text-primary-700 cursor-pointer"
                      >
                        <SquarePen width={16} />
                        <span className="ml-1">Edit</span>
                      </div>
                    </SheetTrigger>
                    <SheetContent className="bg-white border-border_color" style={{ maxWidth: "460px" }}>
                      <SheetHeader className="relative h-full">
                        <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">
                          Edit Holiday
                        </SheetTitle>
                        <SheetDescription>
                          <div className="flex flex-col gap-2">
                            <div>
                              <label className="text-gray-800 text-xs">
                                Description
                              </label>
                              <input
                                type="text"
                                className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                                value={editData?.name}
                                onChange={(e) =>
                                  setEditData({
                                    ...editData,
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="flex items-center gap-6 mt-3 w-full">
                              <div className="w-1/2">
                                <label className="text-gray-800 text-xs font-medium">
                                  Start Date
                                </label>
                                <DatePickerComponent
                                  value={editData?.startDate}
                                  onChange={(e) => {
                                    setEditData({
                                      ...editData,
                                      startDate: e?.toString(),
                                    });
                                  }}
                                  className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                                />
                              </div>
                              <div className="w-1/2">
                                <label className="text-gray-800 text-xs font-medium">
                                  End Date
                                </label>
                                <DatePickerComponent
                                  value={editData?.endDate}
                                  onChange={(e) => {
                                    setEditData({
                                      ...editData,
                                      endDate: e?.toString(),
                                    });
                                  }}
                                  className="border border-border_color w-full rounded-[12px] px-4 h-10 pr-5 text-xs bg-gray-50"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-start gap-2 absolute bottom-0">
                            <button
                              className="bg-blue-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                              onClick={() => handleUpdate1(editData)}
                            >
                              Update
                            </button>
                            <button
                              className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                              onClick={() => setOpenEdit(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        </SheetDescription>
                      </SheetHeader>
                    </SheetContent>
                  </Sheet>
                  {/* <button onClick={() => handleDelete(rowData)} className='flex items-center hover:text-red-700 '>
                              <Trash2 width={16} />
                              <span className='ml-1'>Delete</span>
                            </button> */}
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger
                      className="flex items-center hover:text-red-700 cursor-pointer"
                      onClick={() => setSelectedId(rowData.id)}
                    >
                      <Trash2 width={16} />
                      <span className="ml-1">Delete</span>
                    </DialogTrigger>
                    <DialogContent className="w-[350px] rounded-lg">
                      <DialogHeader>
                        <DialogTitle>Delete</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this entry?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-start gap-3">
                        <Button
                          className="bg-red-600 text-white hover:bg-red-400 hover:text-white w-1/2"
                          onClick={() => setDeleteOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleDelete()}
                          className="flex items-center hover:text-white hover:bg-primary-700 bg-primary-700 text-white w-1/2"
                        >
                          <span className="ml-1">Delete</span>
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </Cell>
          </Column>
        </Table>
      </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Organisation;
