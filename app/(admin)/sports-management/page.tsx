"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePicker } from "antd"
import { Switch } from "@/components/ui/switch"
import { FilePlus, SquarePen, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table } from "rsuite"
import type { RowDataType } from "rsuite/esm/Table"
import dayjs from "dayjs"
import { useGlobalContext } from "@/context/store"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import BadmintonIcon, { getSportIcon } from "@/components/sport-icons"
import toast from "react-hot-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

interface CourtSettings {
  peakHours: Array<{
    start: string | null
    end: string | null
    fee: number
  }>
  nonPeakHours: {
    start: string | null
    end: string | null
  }
  fees: {
    regular: number
  }
  availability: boolean
}

// 1. Add thirdPeakHours to the SportData interface
interface CourtsData {
  [courtName: string]: {
    peakHours: Array<{
      start: string | null
      end: string | null
      fee: number
    }>
    nonPeakHours: {
      start: string | null
      end: string | null
    }
    fees: {
      regular: number
    }
    availability: boolean
  }
}

interface SportData {
  id: number
  icon: string
  sportName: string
  courts: string[]
  availability: boolean
  platform_count: number
  timing: {
    start: string | null
    end: string | null
  }
  days: {
    [key: string]: boolean
  }
  status: string
  nonPeakHours?: {
    start: string | null
    end: string | null
  }
  peakHours?: Array<{
    start: string | null
    end: string | null
    fee: number
  }>
  fees?: {
    regular: number
  }
  courtsData?: CourtsData
  available_court_count?: number
}

const notify = (message: string, success: boolean) =>
  toast[success ? "success" : "error"](message, {
    style: {
      borderRadius: "10px",
      background: "#fff",
      color: "#000",
    },
    position: "top-right",
    duration: 3000,
  })

export default function SportsManagementPage() {
  const router = useRouter()
  const supabase = createClient()
  const [openAdd, setOpenAdd] = useState(false)
  const { Column, HeaderCell, Cell } = Table
  const { user: currentUser } = useGlobalContext()

  const [sportData, setSportData] = useState<SportData[]>([])
  const [timeFormat, setTimeFormat] = useState("12 hours")
  // 2. Add thirdPeakTime to the formData state
  const [formData, setFormData] = useState({
    sportName: "",
    icon: "",
    sportStatus: "active",
    platformName: "",
    platformCount: "",
    startTime: null,
    endTime: null,
    nonPeakStartTime: null,
    nonPeakEndTime: null,
    peakHours: [{ id: crypto.randomUUID(), startTime: null, endTime: null, fee: "" }],
    regularFee: "",
    days: {
      Mon: false,
      Tue: false,
      Wed: false,
      Thu: false,
      Fri: false,
      Sat: false,
      Sun: false,
    },
  })

  const [sportIdToDelete, setSportIdToDelete] = useState<number | null>(null)

  useEffect(() => {
    fetchSportsData()
  }, [currentUser])

  const fetchSportsData = async () => {
    try {
       if (!currentUser?.email) {
      console.log("No current user available");
      return;
    }

      const { data, error } = await supabase
        .from("companies")
        .select("sports_management,time_format")
        .eq("store_admin", currentUser?.email)
        .single()
      if (data) {
        setTimeFormat(data.time_format)
      }
      if (error) {
        console.error("Error fetching data:", error)
        return
      }

      if (data && data.sports_management) {
        const transformedData = data.sports_management.map((item: any) => ({
          id: item.id,
          icon: item.icon,
          sportName: item.sport_name,
          courts: item.courts || [],
          availability: item.availability,
          platform_count: item.courts?.length || 0,
          timing: item.timing || { start: null, end: null },
          days: item.days || {
            Mon: false,
            Tue: false,
            Wed: false,
            Thu: false,
            Fri: false,
            Sat: false,
            Sun: false,
          },
          status: item.status || "active",
          nonPeakHours: item.nonPeakHours || { start: null, end: null },
          peakHours: item.peakHours || { start: null, end: null },
          fees: item.fees || { regular: 0, peak: 0 },
          courtsData: item.courtsData || {},
          available_court_count: getAvailableCourtCount(item),
        }))

        setSportData(transformedData)
      }
    } catch (error) {
      console.error("Error fetching sports management data:", error)
    }
  }

  const getAvailableCourtCount = (sport: any): number => {
    if (!sport.availability) return 0

    if (sport.courtsData) {
      return Object.values(sport.courtsData).filter((court: any) => court.availability).length
    }

    return sport.courts?.length || 0
  }

  const handleToggleAvailability = async (id: number, currentValue: boolean) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("sports_management")
        .eq("store_admin", currentUser?.email)
        .single()

      if (fetchError) throw fetchError

      if (!data || !data.sports_management) {
        console.error("No sports management data found")
        return
      }

      const updatedSportsData = data.sports_management.map((sport: any) =>
        sport.id === id ? { ...sport, availability: !sport.availability } : sport,
      )

      const { error } = await supabase
        .from("companies")
        .update({
          sports_management: updatedSportsData,
        })
        .eq("store_admin", currentUser?.email)

      if (error) throw error

      fetchSportsData()
    } catch (error) {
      console.error("Error updating availability:", error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day as keyof typeof prev.days],
      },
    }))
  }

  const addPeakHour = () => {
    // Check if we're already in the process of adding a peak hour to prevent duplicates
    if (formData.peakHours.some((hour) => hour.startTime === null && hour.endTime === null && hour.fee === "")) {
      return // Don't add another empty peak hour if one already exists
    }

    setFormData((prev) => ({
      ...prev,
      peakHours: [...prev.peakHours, { id: crypto.randomUUID(), startTime: null, endTime: null, fee: "" }],
    }))
  }

  const removePeakHour = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      peakHours: prev.peakHours.filter((hour) => hour.id !== id),
    }))
  }

  // In the handlePeakHourChange function, add validation to ensure peak hours are within platform timing
  const handlePeakHourChange = (id: string, field: string, value: any) => {
    // For validation checks
    const validateTimeValue = (value: any, fieldType: string, peakId: string) => {
      // Get platform start and end times
      const platformStart = formData.startTime ? dayjs(formData.startTime) : null
      const platformEnd = formData.endTime ? dayjs(formData.endTime) : null

      // If platform times are set, validate the peak hour time
      if (platformStart && platformEnd && value) {
        // Check if peak time is outside platform hours
        if (value.isBefore(platformStart) || value.isAfter(platformEnd)) {
          // Show error toast - make sure this is called
          notify(
            `Peak hours must be within platform timing (${platformStart.format("h:mm a")} - ${platformEnd.format("h:mm a")})`,
            false,
          )
          return false
        }
      }

      // For end time, check if it's before start time
      if (fieldType === "endTime") {
        const peakHour = formData.peakHours.find((hour) => hour.id === peakId)
        if (peakHour?.startTime && value) {
          const startTime = dayjs(peakHour.startTime)
          if (value.isBefore(startTime)) {
            notify("End time cannot be before start time", false)
            return false
          }
        }
      }

      return true
    }

    if (field === "startTime" || field === "endTime") {
      if (!validateTimeValue(value, field, id)) {
        return
      }
    }

    setFormData((prev) => {
      const updatedPeakHours = prev.peakHours.map((hour) => (hour.id === id ? { ...hour, [field]: value } : hour))
      return {
        ...prev,
        peakHours: updatedPeakHours,
      }
    })
  }

  // Add a new function to handle platform end time changes
  const handleEndTimeChange = (time: any) => {
    if (formData.startTime && time) {
      const startTime = dayjs(formData.startTime)

      if (time.isBefore(startTime)) {
        notify("End time cannot be before start time", false)
        return
      }
    }
    handleInputChange("endTime", time)
  }

  const handleSave = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("sports_management")
        .eq("store_admin", currentUser?.email)
        .single()

      if (fetchError) throw fetchError

      const currentSportsData = data?.sports_management || []

      const platformCount = Number.parseInt(formData.platformCount) || 0
      const platformNameBase = formData.platformName.trim()

      // Determine if we should use letters or numbers based on the last character
      const lastChar = platformNameBase.slice(-1)
      const useLetters = isNaN(Number(lastChar)) // If last character is not a number

      const courtNames = []
      for (let i = 0; i < platformCount; i++) {
        if (useLetters) {
          // For letter sequence (A, B, C...)
          const baseWithoutLastChar = isNaN(Number(lastChar)) ? platformNameBase.slice(0, -1) : platformNameBase
          const letter = String.fromCharCode(65 + i) // A=65, B=66, etc.
          courtNames.push(`${baseWithoutLastChar}${letter}`)
        } else {
          // For number sequence (1, 2, 3...)
          const baseWithoutLastNumber = !isNaN(Number(lastChar)) ? platformNameBase.slice(0, -1) : platformNameBase
          courtNames.push(`${baseWithoutLastNumber}${i + 1}`)
        }
      }

      interface CourtsData {
        [courtName: string]: {
          peakHours: Array<{
            start: string | null
            end: string | null
            fee: number
          }>
          nonPeakHours: {
            start: string | null
            end: string | null
          }
          fees: {
            regular: number
          }
          availability: boolean
        }
      }

      const courtsData: CourtsData = {}

      courtNames.forEach((courtName) => {
        courtsData[courtName] = {
          peakHours: formData.peakHours.map((peak) => ({
            start: peak.startTime ? dayjs(peak.startTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm") : null,
            end: peak.endTime ? dayjs(peak.endTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm") : null,
            fee: Number.parseFloat(peak.fee) || 0,
          })),
          nonPeakHours: {
            start: formData.nonPeakStartTime
              ? dayjs(formData.nonPeakStartTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm")
              : null,
            end: formData.nonPeakEndTime
              ? dayjs(formData.nonPeakEndTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm")
              : null,
          },
          fees: {
            regular: Number.parseFloat(formData.regularFee) || 0,
          },
          availability: true,
        }
      })

      const newId = currentSportsData.length > 0 ? Math.max(...currentSportsData.map((s: any) => s.id)) + 1 : 1

      const newSport = {
        id: newId,
        icon: formData.icon,
        sport_name: formData.sportName,
        courts: courtNames,
        availability: true,
        status: formData.sportStatus,
        timing: {
          start: formData.startTime
            ? dayjs(formData.startTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm")
            : null,
          end: formData.endTime ? dayjs(formData.endTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm") : null,
        },
        nonPeakHours: {
          start: formData.nonPeakStartTime
            ? dayjs(formData.nonPeakStartTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm")
            : null,
          end: formData.nonPeakEndTime
            ? dayjs(formData.nonPeakEndTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm")
            : null,
        },
        peakHours: formData.peakHours.map((peak) => ({
          start: peak.startTime ? dayjs(peak.startTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm") : null,
          end: peak.endTime ? dayjs(peak.endTime).format(timeFormat === "12 hours" ? "h:mm a" : "HH:mm") : null,
          fee: Number.parseFloat(peak.fee) || 0,
        })),
        days: formData.days,
        platform_count: courtNames.length,
        fees: {
          regular: Number.parseFloat(formData.regularFee) || 0,
        },
        courtsData: courtsData,
      }

      const updatedSportsData = [...currentSportsData, newSport]

      const { error } = await supabase
        .from("companies")
        .update({
          sports_management: updatedSportsData,
        })
        .eq("store_admin", currentUser?.email)

      if (error) throw error

      setFormData({
        sportName: "",
        icon: "",
        sportStatus: "active",
        platformName: "",
        platformCount: "",
        startTime: null,
        endTime: null,
        nonPeakStartTime: null,
        nonPeakEndTime: null,
        peakHours: [{ id: crypto.randomUUID(), startTime: null, endTime: null, fee: "" }],
        regularFee: "",
        days: {
          Mon: false,
          Tue: false,
          Wed: false,
          Thu: false,
          Fri: false,
          Sat: false,
          Sun: false,
        },
      })

      notify("Sport added successfully", true)
      setOpenAdd(false)
      fetchSportsData()
    } catch (error) {
      console.error("Error saving sport data:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      sportName: "",
      icon: "",
      sportStatus: "active",
      platformName: "",
      platformCount: "",
      startTime: null,
      endTime: null,
      nonPeakStartTime: null,
      nonPeakEndTime: null,
      peakHours: [{ id: crypto.randomUUID(), startTime: null, endTime: null, fee: "" }],
      regularFee: "",
      days: {
        Mon: false,
        Tue: false,
        Wed: false,
        Thu: false,
        Fri: false,
        Sat: false,
        Sun: false,
      },
    })
  }

  const handleEdit = (id: number) => {
    router.push(`/sports-management/edit/${id}`)
  }

  const handleDelete = async (id: number) => {
    try {
      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("sports_management")
        .eq("store_admin", currentUser?.email)
        .single()

      if (fetchError) throw fetchError

      if (!data || !data.sports_management) {
        console.error("No sports management data found")
        return
      }

      const updatedSportsData = data.sports_management.filter((sport: any) => sport.id !== id)

      const { error } = await supabase
        .from("companies")
        .update({
          sports_management: updatedSportsData,
        })
        .eq("store_admin", currentUser?.email)
      notify("Sport deleted successfully", true)
      if (error) throw error

      fetchSportsData()
    } catch (error) {
      console.error("Error deleting sport:", error)
    }
  }

  const getRowStyle = (availability: boolean) => {
    return availability ? {} : { color: "#9ca3af" }
  }

  const getAvailablePlatforms = (sport: SportData) => {
    if (!sport.availability) return 0

    if (sport.courtsData) {
      return Object.values(sport.courtsData as Record<string, { availability: boolean }>).filter(
        (court) => court.availability,
      ).length
    }

    return sport.available_court_count || sport.platform_count
  }

  const getUnavailablePlatforms = (sport: SportData) => {
    if (!sport.availability) return sport.platform_count

    if (sport.courtsData) {
      const availableCount = Object.values(sport.courtsData as Record<string, { availability: boolean }>).filter(
        (court) => court.availability,
      ).length
      return sport.courts.length - availableCount
    }

    return sport.platform_count - (sport.available_court_count || sport.platform_count)
  }

  return (
    <div className="w-full bg-white p-4">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="items-center gap-2">
          <h1 className="text-xl font-bold text-zinc-950">Sport Management</h1>
          <p className="text-sm text-zinc-500">Add & manage sports details.</p>
        </div>
        <Sheet
          open={openAdd}
          onOpenChange={(open) => {
            setOpenAdd(open)
            if (!open) resetForm()
          }}
        >
          <SheetTrigger>
            <div className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] w-[130px] h-[40px] flex items-center justify-center text-xs cursor-pointer">
              <FilePlus size={14} />
              <span className="ml-2">Add Sport</span>
            </div>
          </SheetTrigger>
          <SheetContent className="bg-white overflow-y-auto" style={{ maxWidth: "600px", height: "100vh" }}>
            <SheetHeader className="">
              <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">New Sport</SheetTitle>
            </SheetHeader>
            <SheetDescription>
              <div className="w-full space-y-4 pt-4 pb-20">
                <div className="flex gap-4">
                  <div className="w-full space-y-2">
                    <Label className="text-gray-900 text-sm font-medium">Sport Name</Label>
                    {/* <Select value={formData.sportName} onValueChange={(value) => handleInputChange("sportName", value)}>
                      <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm  text-gray-700">
                        <SelectValue placeholder="Badminton / Tennis / Cricket..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Badminton">Badminton </SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Cricket">Cricket</SelectItem>
                        <SelectItem value="GYM">GYM</SelectItem>
                        <SelectItem value="Yoga Class">Yoga Class</SelectItem>
                      </SelectContent>
                    </Select> */}
                    <Input
                      type="text"
                      placeholder="Badminton / Tennis / Cricket..."
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={formData.sportName || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange("sportName", e.target.value)
                      }
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <Label className="text-gray-900 text-sm font-medium">Icon</Label>
                    <Select value={formData.icon} onValueChange={(value) => handleInputChange("icon", value)}>
                      <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
                        <SelectValue placeholder="Choose icon" />
                      </SelectTrigger>
                      <SelectContent className="align-middle">
                        <SelectItem value="badminton">
                          <div className="flex items-center gap-2">
                            <BadmintonIcon />
                          </div>
                        </SelectItem>
                        <SelectItem value="tennis">
                          <div className="flex items-center gap-2">{getSportIcon("tennis")}</div>
                        </SelectItem>
                        <SelectItem value="cricket">
                          <div className="flex items-center gap-2">{getSportIcon("cricket")}</div>
                        </SelectItem>
                        <SelectItem value="gym">
                          <div className="flex items-center gap-2">{getSportIcon("gym")}</div>
                        </SelectItem>
                        <SelectItem value="yoga">
                          <div className="flex items-center gap-2">{getSportIcon("yoga")}</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full space-y-2">
                    <Label className="text-gray-900 text-sm font-medium">Sport Status</Label>
                    <Select
                      value={formData.sportStatus}
                      onValueChange={(value) => handleInputChange("sportStatus", value)}
                    >
                      <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
                        <SelectValue placeholder="Active / Inactive" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-row gap-4">
                  <div className="w-full space-y-2">
                    <Label className="text-gray-900 text-sm font-medium">Platform Names </Label>
                    <input
                      type="text"
                      placeholder="courtA,courtB,courtC"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={formData.platformName}
                      onChange={(e) => handleInputChange("platformName", e.target.value)}
                    />
                  </div>
                  <div className="w-full space-y-2">
                    <Label className="text-gray-900 text-sm font-medium">No. of Platform</Label>
                    <input
                      type="number"
                      placeholder="2"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={formData.platformCount}
                      onChange={(e) => handleInputChange("platformCount", e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full  space-y-2">
                  <Label className="text-gray-900 text-sm font-medium">Platform Timing</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">From</Label>
                      <TimePicker
                        value={formData.startTime}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"}
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("startTime", time)}
                      />
                    </div>

                    <div className="w-full space-y-1.5">
                      <Label className="text-gray-900 text-sm font-medium">To</Label>
                      <TimePicker
                        value={formData.endTime}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm "}
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={handleEndTimeChange}
                      />
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <Label className="text-gray-900 text-sm font-medium">Regular Fee</Label>
                    <input
                      type="number"
                      placeholder="12.99"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={formData.regularFee}
                      onChange={(e) => handleInputChange("regularFee", e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-gray-900 text-sm font-medium">Peak Hours</Label>
                  {formData.peakHours.map((peakHour, index) => (
                    <div key={peakHour.id} className="flex items-center gap-4 mb-2">
                      <div className="w-full space-y-1.5">
                        <Label className="text-sm text-gray-600">From</Label>
                        <TimePicker
                          value={peakHour.startTime}
                          use12Hours={timeFormat === "12 hours"}
                          format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"}
                          className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                          onChange={(time) => handlePeakHourChange(peakHour.id, "startTime", time)}
                        />
                      </div>

                      <div className="w-full space-y-1.5">
                        <Label className="text-gray-900 text-sm font-medium">To</Label>
                        <TimePicker
                          value={peakHour.endTime}
                          use12Hours={timeFormat === "12 hours"}
                          format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm "}
                          className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                          onChange={(time) => handlePeakHourChange(peakHour.id, "endTime", time)}
                        />
                      </div>

                      <div className="w-full space-y-1.5">
                        <Label className="text-gray-900 text-sm font-medium">Fee</Label>
                        <input
                          type="number"
                          placeholder="15.99"
                          className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                          value={peakHour.fee}
                          onChange={(e) => handlePeakHourChange(peakHour.id, "fee", e.target.value)}
                        />
                      </div>

                      {formData.peakHours.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePeakHour(peakHour.id)}
                          className="mt-6 p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {/* <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={addPeakHour}
                      className="flex items-center justify-center text-teal-800 hover:text-teal-700"
                    >
                      <FilePlus size={16} />
                      <span className="ml-1">Add Peak Hour</span>
                    </button>
                  </div> */}
                </div>

                <div>
                  <Label className="text-gray-900 text-sm font-medium">Active Days</Label>
                  <div className="flex gap-4 flex-wrap pt-2">
                    {Object.keys(formData.days).map((day) => (
                      <label key={day} className="flex items-center gap-1 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="accent-teal-800"
                          checked={formData.days[day as keyof typeof formData.days]}
                          onChange={() => handleDayToggle(day)}
                        />
                        {day}
                      </label>
                    ))}
                    <label className="flex items-center gap-1 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="accent-teal-800"
                        checked={Object.values(formData.days).every((day) => day)}
                        onChange={(e) => {
                          const isChecked = e.target.checked
                          setFormData((prev) => ({
                            ...prev,
                            days: {
                              Mon: isChecked,
                              Tue: isChecked,
                              Wed: isChecked,
                              Thu: isChecked,
                              Fri: isChecked,
                              Sat: isChecked,
                              Sun: isChecked,
                            },
                          }))
                        }}
                      />
                      <span>All</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-start gap-2 bg-white w-full">
                  <button
                    className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <div
                    className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2 cursor-pointer"
                    onClick={() => {
                      resetForm()
                      setOpenAdd(false)
                    }}
                  >
                    Cancel
                  </div>
                </div>
              </div>
            </SheetDescription>
          </SheetContent>
        </Sheet>
      </div>

      <div className="w-full border border-zinc-200 rounded-[8px] bg-white text-sm my-6">
        <Table data={sportData} autoHeight className="rounded-[8px]">
          <Column width={70} align="center">
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>S.NO</HeaderCell>
            <Cell>
              {(rowData: RowDataType) => (
                <div style={getRowStyle((rowData as SportData).availability)}>{rowData.id}</div>
              )}
            </Cell>
          </Column>

          <Column width={100} align="center">
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>ICON</HeaderCell>
            <Cell>
              {(rowData: RowDataType) => (
                <div className="flex justify-center" style={getRowStyle((rowData as SportData).availability)}>
                  {getSportIcon(rowData.icon)}
                </div>
              )}
            </Cell>
          </Column>

          <Column width={200} align="center">
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>SPORT NAME</HeaderCell>
            <Cell>
              {(rowData: RowDataType) => (
                <div style={getRowStyle((rowData as SportData).availability)}>{rowData.sportName}</div>
              )}
            </Cell>
          </Column>

          <Column flexGrow={120}>
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>No. OF PLATFORM</HeaderCell>
            <Cell>
              {(rowData: RowDataType) => (
                <div style={getRowStyle((rowData as SportData).availability)}>{rowData.platform_count}</div>
              )}
            </Cell>
          </Column>

          <Column flexGrow={120}>
            <HeaderCell className="uppercase" style={{ backgroundColor: "#f2f2f2" }}>
              Available Platform
            </HeaderCell>
            <Cell>
              {(rowData: RowDataType) => (
                <div style={getRowStyle((rowData as SportData).availability)}>
                  {getAvailablePlatforms(rowData as SportData)}
                </div>
              )}
            </Cell>
          </Column>

          <Column flexGrow={120}>
            <HeaderCell className="uppercase" style={{ backgroundColor: "#f2f2f2" }}>
              UnAvailable Platform
            </HeaderCell>
            <Cell>
              {(rowData: RowDataType) => (
                <div style={getRowStyle((rowData as SportData).availability)}>
                  {getUnavailablePlatforms(rowData as SportData)}
                </div>
              )}
            </Cell>
          </Column>

          <Column width={120} align="center">
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>AVAILABILITY</HeaderCell>
            <Cell>
              {(rowData: RowDataType) => (
                <div className="flex justify-center">
                  <Switch
                    checked={(rowData as SportData).availability}
                    onCheckedChange={() =>
                      handleToggleAvailability((rowData as SportData).id, (rowData as SportData).availability)
                    }
                    className="data-[state=checked]:bg-teal-500"
                  />
                </div>
              )}
            </Cell>
          </Column>

          <Column width={100} align="center">
            <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>ACTION</HeaderCell>
            <Cell>
              {(rowData: RowDataType) => (
                <div className="flex justify-evenly align-middle items-center h-full text-gray-600 gap-3">
                  <div
                    onClick={() => handleEdit((rowData as SportData).id)}
                    className="flex items-center hover:text-teal-700 cursor-pointer"
                  >
                    <SquarePen size={16} />
                  </div>
                  <AlertDialog
                    open={sportIdToDelete === (rowData as SportData).id}
                    onOpenChange={(open) => {
                      if (!open) setSportIdToDelete(null)
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Trash2
                        size={16}
                        className="hover:text-red-700 cursor-pointer"
                        onClick={() => setSportIdToDelete((rowData as SportData).id)}
                      />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete this sport?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the sport and all its data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete((rowData as SportData).id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </Cell>
          </Column>
        </Table>
      </div>
    </div>
  )
}
