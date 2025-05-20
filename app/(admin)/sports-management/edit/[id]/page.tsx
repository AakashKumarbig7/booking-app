"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePicker } from "antd"
import { Switch } from "@/components/ui/switch"
import { Trash2, Search, FilePlus, Plus } from "lucide-react"
import { Table } from "rsuite"
import type { RowDataType } from "rsuite/esm/Table"
import dayjs, { type Dayjs } from "dayjs"
import { useGlobalContext } from "@/context/store"
import { createClient } from '@/utils/supabase/client';
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import toast, { Toaster } from "react-hot-toast"
import "@/app/(admin)/sports-management/edit/[id]/style.css"
import { getSportIcon } from "@/components/sport-icons"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { use } from "react"

interface CourtSettings {
  name: string
  peakHours: Array<{
    id: string
    start: string | null
    end: string | null
    fee: number
  }>
  fees: {
    regular: number
  }
  availability: boolean
}

interface SportData {
  id: number
  icon: string
  sport_name: string
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

interface CourtsData {
  [key: string]: CourtSettings
}

interface PeakHour {
  id: string
  startTime: Dayjs | null
  endTime: Dayjs | null
  fee: string
}

interface EditFormData {
  sport_name: string
  icon: string
  sportStatus: string
  startTime: Dayjs | null
  endTime: Dayjs | null
  peakHours: PeakHour[]
  regularFee: string
  days: {
    Mon: boolean
    Tue: boolean
    Wed: boolean
    Thu: boolean
    Fri: boolean
    Sat: boolean
    Sun: boolean
  }
  platformName: string
  platformCount: string
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

export default function EditSportPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const supabase = createClient()
  const { Column, HeaderCell, Cell } = Table
  const { user: currentUser } = useGlobalContext()

  const unwrappedParams = use(params)
  const sportId = Number.parseInt(unwrappedParams.id)

  const [timeFormat, setTimeFormat] = useState("12 hours")
  const [courtSearchQuery, setCourtSearchQuery] = useState("")
  const [saveLoader, setSaveLoader] = useState(false)
  const [cancelLoader, setCancelLoader] = useState(false)
  const [backToSportsLoader, setBackToSportsLoader] = useState(false)

  const [editFormData, setEditFormData] = useState<EditFormData>({
    sport_name: "",
    icon: "",
    sportStatus: "",
    startTime: null,
    endTime: null,
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
    platformName: "",
    platformCount: "",
  })

  const [courtData, setCourtData] = useState<CourtSettings[]>([])

  const fetchSportData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("sports_management,time_format")
        .eq("store_admin", currentUser?.email)
        .single()

      if (error) {
        console.error("Error fetching data:", error)
        return
      }

      if (data) {
        setTimeFormat(data.time_format)

        if (data.sports_management) {
          const transformedData = data.sports_management.map((item: SportData) => ({
            id: item.id,
            icon: item.icon,
            sport_name: item.sport_name,
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
            status: item.status,
            peakHours: item.peakHours || [{ start: null, end: null, fee: 0 }],
            fees: item.fees || { regular: 0 },
            courtsData: item.courtsData || {},
            available_court_count: item.available_court_count || item.courts?.length || 0,
          }))

          const sportToEdit = transformedData.find((sport: SportData) => sport.id === sportId)

          if (sportToEdit) {
            const peakHoursArray = Array.isArray(sportToEdit.peakHours)
              ? sportToEdit.peakHours.map((peak: { start: string | null; end: string | null; fee: number }) => ({
                  id: crypto.randomUUID(),
                  startTime: peak.start ? dayjs(peak.start, "HH:mm a") : null,
                  endTime: peak.end ? dayjs(peak.end, "HH:mm a") : null,
                  fee: peak.fee?.toString() || "",
                }))
              : [
                  {
                    id: crypto.randomUUID(),
                    startTime: sportToEdit.peakHours?.start ? dayjs(sportToEdit.peakHours.start, "HH:mm a") : null,
                    endTime: sportToEdit.peakHours?.end ? dayjs(sportToEdit.peakHours.end, "HH:mm a") : null,
                    fee: sportToEdit.fees?.peak?.toString() || "",
                  },
                ]

            setEditFormData({
              sport_name: sportToEdit.sport_name,
              platformCount: sportToEdit.platform_count.toString(),
              platformName: sportToEdit.courts[0]?.replace(/[0-9]+$/, "") || "",
              icon: sportToEdit.icon,
              sportStatus: sportToEdit.status,
              startTime: sportToEdit.timing.start ? dayjs(sportToEdit.timing.start, "HH:mm a") : null,
              endTime: sportToEdit.timing.end ? dayjs(sportToEdit.timing.end, "HH:mm a") : null,
              peakHours: peakHoursArray,
              regularFee: sportToEdit.fees?.regular?.toString() || "",
              days: {
                Mon: sportToEdit.days.Mon || false,
                Tue: sportToEdit.days.Tue || false,
                Wed: sportToEdit.days.Wed || false,
                Thu: sportToEdit.days.Thu || false,
                Fri: sportToEdit.days.Fri || false,
                Sat: sportToEdit.days.Sat || false,
                Sun: sportToEdit.days.Sun || false,
              },
            })

            if (sportToEdit.courtsData && Object.keys(sportToEdit.courtsData).length > 0) {
              const courtDataArray = sportToEdit.courts.map((courtName: string) => ({
                name: courtName,
                peakHours: sportToEdit.courtsData?.[courtName].peakHours?.map(
                  (item: { start: string | null; end: string | null; fee: number }) => ({
                    id: crypto.randomUUID(),
                    start: item.start,
                    end: item.end,
                    fee: item.fee || 0,
                  }),
                ) || [{ id: crypto.randomUUID(), start: null, end: null, fee: 0 }],
                fees: {
                  regular: sportToEdit.courtsData?.[courtName].fees?.regular || 0,
                },
                availability: sportToEdit.courtsData?.[courtName].availability !== false,
              }))
              setCourtData(courtDataArray)
            } else {
              const defaultCourtData: CourtSettings[] = sportToEdit.courts.map(
                (courtName: string): CourtSettings => ({
                  name: courtName,
                  peakHours: Array.isArray(sportToEdit.peakHours)
                    ? sportToEdit.peakHours.map(
                        (peak: { start: string | null; end: string | null; fee: number }): {
                          id: string
                          start: string | null
                          end: string | null
                          fee: number
                        } => ({
                          id: crypto.randomUUID(),
                          start: peak.start || null,
                          end: peak.end || null,
                          fee: peak.fee || 0,
                        }),
                      )
                    : [
                        {
                          id: crypto.randomUUID(),
                          start: sportToEdit.peakHours?.start || null,
                          end: sportToEdit.peakHours?.end || null,
                          fee: sportToEdit.fees?.peak || 0,
                        },
                      ],
                  fees: {
                    regular: sportToEdit.fees?.regular || 0,
                  },
                  availability: true,
                }),
              )
              setCourtData(defaultCourtData)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching sport data:", error)
    }
  }, [currentUser?.email, sportId, supabase])

  useEffect(() => {
    fetchSportData()
  }, [fetchSportData])

  const handleEditInputChange = (field: keyof EditFormData, value: string | boolean | null| number | dayjs.Dayjs  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditDayToggle = (day: keyof EditFormData["days"]) => {
    setEditFormData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day],
      },
    }))
  }

  const handleCourtUpdate = (index: number, field: string, value: unknown) => {
    setCourtData((prev) => {
      const newData = [...prev]

      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        newData[index] = {
          ...newData[index],
          [parent]: {
            ...(newData[index][parent as keyof CourtSettings] as object),
            [child]: value,
          },
        }
      } else {
        newData[index] = {
          ...newData[index],
          [field]: value,
        }
      }
      return newData
    })
  }

  const handleEditSave = async () => {
    try {
      setSaveLoader(true)
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

      // Create courtsData object preserving all individual court settings
      const courtsData: CourtsData = {}
      courtData.forEach((court) => {
        courtsData[court.name] = {
          name: court.name,
          peakHours: court.peakHours.map((peak) => ({
            id: peak.id,
            start: peak.start,
            end: peak.end,
            fee: peak.fee,
          })),
          fees: {
            regular: court.fees.regular,
          },
          availability: court.availability,
        }
      })

      // Calculate available courts count
      const availableCourtCount = courtData.filter((court) => court.availability).length

      // Update the sports data
      const updatedSportsData = data.sports_management.map((sport: SportData) => {
        if (sport.id === sportId) {
          return {
            ...sport,
            icon: editFormData.icon,
            sport_name: editFormData.sport_name,
            status: editFormData.sportStatus,
            courts: courtData.map((court) => court.name),
            timing: {
              start: editFormData.startTime ? dayjs(editFormData.startTime).format("h:mm a") : null,
              end: editFormData.endTime ? dayjs(editFormData.endTime).format("h:mm a") : null,
            },
            peakHours: editFormData.peakHours.map((peak) => ({
              start: peak.startTime ? dayjs(peak.startTime).format("h:mm a") : null,
              end: peak.endTime ? dayjs(peak.endTime).format("h:mm a") : null,
              fee: Number.parseFloat(peak.fee) || 0,
            })),
            days: editFormData.days,
            fees: {
              regular: Number.parseFloat(editFormData.regularFee) || 0,
            },
            courtsData: courtsData,
            platform_count: courtData.length,
            available_court_count: availableCourtCount,
          }
        }
        return sport
      })

      const { error } = await supabase
        .from("companies")
        .update({
          sports_management: updatedSportsData,
        })
        .eq("store_admin", currentUser?.email)

      if (error) throw error

      notify("Sport updated successfully", true)
      fetchSportData()
    } catch (error) {
      console.error("Error updating sport data:", error)
      notify("Failed to update sport", false)
    } finally {
      setSaveLoader(false)
    }
  }

  const handleDeleteCourt = (index: number) => {
    if (courtData.length <= 1) {
      notify("Cannot delete the last court", false)
      return
    }

    setCourtData((prev) => {
      const newData = [...prev]
      newData.splice(index, 1)
      return newData
    })
    handleEditInputChange("platformCount", (courtData.length - 1).toString())
  }

  const addPeakHour = (courtIndex?: number) => {
    if (courtIndex !== undefined) {
      setCourtData((prev) => {
        const newData = [...prev]
        if (!Array.isArray(newData[courtIndex].peakHours)) {
          newData[courtIndex].peakHours = []
        }

        const lastPeakHour = newData[courtIndex].peakHours[newData[courtIndex].peakHours.length - 1]
        if (lastPeakHour && (!lastPeakHour.start || !lastPeakHour.end )) {
          notify("Please complete the current peak hour details for this court before adding a new one", false)
          return prev
        }

        newData[courtIndex].peakHours.push({
          id: crypto.randomUUID(),
          start: null,
          end: null,
          fee:  lastPeakHour.fee,
        })

        return newData
      })
    } else {
      setEditFormData((prev) => {
        const lastPeakHour = prev.peakHours[prev.peakHours.length - 1]
        if (lastPeakHour && (!lastPeakHour.startTime || !lastPeakHour.endTime )) {
          notify("Please complete the current peak hour details before adding a new one", false)
          return prev
        }

        return {
          ...prev,
          peakHours: [
            ...prev.peakHours,
            {
              id: crypto.randomUUID(),
              startTime: null,
              endTime: null,
              fee: "",
            },
          ],
        }
      })
    }
  }

  const removePeakHour = (id: string, courtIndex?: number) => {
    if (courtIndex !== undefined) {
      setCourtData((prev) => {
        const newData = [...prev]
        if (Array.isArray(newData[courtIndex].peakHours)) {
          newData[courtIndex].peakHours = newData[courtIndex].peakHours.filter((hour) => hour.id !== id)
        }
        return newData
      })
    } else {
      if (editFormData.peakHours.length > 1) {
        setEditFormData((prev) => ({
          ...prev,
          peakHours: prev.peakHours.filter((hour) => hour.id !== id),
        }))
      }
    }
  }

  const handlePeakHourChange = (id: string, field: string, value: Dayjs | number | string, courtIndex?: number) => {
    // First update the state
    if (courtIndex !== undefined) {
      if (field === "start" || field === "end") {
        setCourtData((prev) => {
          const newData = [...prev]
          if (Array.isArray(newData[courtIndex].peakHours)) {
            newData[courtIndex].peakHours = newData[courtIndex].peakHours.map((hour) => {
              if (hour.id === id) {
                return {
                  ...hour,
                  [field]: value ? dayjs(value as Dayjs).format("h:mm a") : null,
                }
              }
              return hour
            })
          }
          return newData
        })
      } else {
        setCourtData((prev) => {
          const newData = [...prev]
          if (Array.isArray(newData[courtIndex].peakHours)) {
            newData[courtIndex].peakHours = newData[courtIndex].peakHours.map((hour) => {
              if (hour.id === id) {
                return { ...hour, fee: Number(value) || 0 }
              }
              return hour
            })
          }
          return newData
        })
      }
    } else {
      setEditFormData((prev) => {
        const updatedPeakHours = prev.peakHours.map((hour) => (hour.id === id ? { ...hour, [field]: value } : hour))
        return {
          ...prev,
          peakHours: updatedPeakHours,
        }
      })
    }
  
    // Then perform validation after state update
    if ((field === "start" || field === "end" || field === "startTime" || field === "endTime") && value) {
      const platformStart = editFormData.startTime ? dayjs(editFormData.startTime, "HH:mm a") : null
      const platformEnd = editFormData.endTime ? dayjs(editFormData.endTime, "HH:mm a") : null
  
      if (platformStart && platformEnd && value) {
        const timeValue = dayjs(value as Dayjs)
        if (timeValue.isBefore(platformStart)) {
          setTimeout(() => notify(`Peak hours must be after platform start time`, false), 0)
        } else if (timeValue.isAfter(platformEnd)) {
          setTimeout(() => notify(`Peak hours must be before platform end time`, false), 0)
        }
      }
  
      if (field === "end" || field === "endTime") {
        let startTime = null
  
        if (courtIndex !== undefined) {
          const peakHour = courtData[courtIndex]?.peakHours.find((hour) => hour.id === id)
          if (peakHour?.start) {
            startTime = dayjs(peakHour.start, "HH:mm a")
          }
        } else {
          const peakHour = editFormData.peakHours.find((hour) => hour.id === id)
          if (peakHour?.startTime) {
            startTime = dayjs(peakHour.startTime, "HH:mm a")
          }
        }
  
        if (startTime && value && dayjs(value as Dayjs).isBefore(startTime)) {
          setTimeout(() => notify("End time cannot be before start time", false), 0)
        }
      }
    }
  }
  const handleAddCourt = () => {
    const existingNames = courtData.map((court) => court.name)
    let highestIndex = 0
    let useLetters = false

    existingNames.forEach((name) => {
      const numMatch = name.match(/\d+$/)
      if (numMatch) {
        const num = Number.parseInt(numMatch[0])
        if (num > highestIndex) highestIndex = num
      } else {
        const letter = name.slice(-1).toUpperCase()
        if (/[A-Z]/.test(letter)) {
          useLetters = true
          const letterIndex = letter.charCodeAt(0) - 65
          if (letterIndex > highestIndex) highestIndex = letterIndex
        }
      }
    })

    let baseName = editFormData.platformName.trim()
    baseName = useLetters ? baseName.replace(/[A-Za-z]$/, "") : baseName.replace(/\d+$/, "")

    const newIndex = highestIndex + 1
    const newCourtName = useLetters ? `${baseName}${String.fromCharCode(65 + newIndex)}` : `${baseName}${newIndex}`

    const newCourt: CourtSettings = {
      name: newCourtName,
      peakHours: [
        {
          id: crypto.randomUUID(),
          start: null,
          end: null,
          fee: 0,
        },
      ],
      fees: {
        regular: Number.parseFloat(editFormData.regularFee) || 0,
      },
      availability: true,
    }

    notify(`Court ${newCourtName} added successfully`, true)
    setCourtData([...courtData, newCourt])
    handleEditInputChange("platformCount", (courtData.length + 1).toString())
  }

  const handleEndTimeChange = (time: Dayjs | null) => {
    if (editFormData.startTime && time) {
      const startTime = dayjs(editFormData.startTime)

      if (time.isBefore(startTime)) {
        notify("End time cannot be before start time", false)
        return
      }
    }
    handleEditInputChange("endTime", time)
  }

  return (
    <>
      <div className="w-full bg-white p-4 ">
        <Toaster />
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="items-center gap-2">
            <h1 className="text-xl font-bold text-zinc-950">Edit Sport</h1>
            <p className="text-sm text-zinc-500">Update sport details.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setBackToSportsLoader(true)
              setTimeout(() => {
                router.push("/sports-management")
                setBackToSportsLoader(false)
              }, 1000)
            }}
            disabled={backToSportsLoader}
          >
            {backToSportsLoader ? (
              <svg
                className="animate-spin h-6 w-6 text-teal-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-100"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Back To Sports"
            )}
          </Button>
        </div>

        <div className="w-full space-y-4 pt-4 pb-32 px-4">
          <div className="flex gap-4">
            <div className="w-full space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Sport Name</Label>
              <Input
                type="text"
                placeholder="e.g Badminton"
                className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                value={editFormData.sport_name || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleEditInputChange("sport_name", e.target.value)
                }
              />
            </div>

            <div className="w-full space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Icon</Label>
              <Select value={editFormData.icon} onValueChange={(value) => handleEditInputChange("icon", value)}>
                <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
                  <SelectValue placeholder="Choose icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="badminton">
                    <div className="flex items-center gap-2">{getSportIcon("badminton")}</div>
                  </SelectItem>
                  <SelectItem value="tennis">
                    <div className="flex items-center gap-2">{getSportIcon("tennis")}</div>
                  </SelectItem>
                  <SelectItem value="cricket">
                    <div className="flex items-center gap-2">{getSportIcon("cricket")}</div>
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
                value={editFormData.sportStatus}
                onValueChange={(value) => handleEditInputChange("sportStatus", value)}
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
            <div className="w-full space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Platform Name</Label>
              <input
                type="text"
                placeholder="e.g CourtA or Court1"
                className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                value={editFormData.platformName}
                onChange={(e) => handleEditInputChange("platformName", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-gray-900 text-sm font-medium">No. of Platform</Label>
              <input
                type="number"
                placeholder="e.g 2"
                className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                value={editFormData.platformCount}
                onChange={(e) => handleEditInputChange("platformCount", e.target.value)}
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Platform Timing</Label>
              <div className="flex items-center gap-2">
                <TimePicker
                  value={editFormData.startTime ? dayjs(editFormData.startTime, "h:mm a") : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"}
                  placeholder="Start"
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("startTime", time)}
                  needConfirm={false}
                />
                <span className="text-gray-500">to</span>
                <TimePicker
                  value={editFormData.endTime ? dayjs(editFormData.endTime, "h:mm a") : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"}
                  placeholder="End"
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={handleEndTimeChange}
                  needConfirm={false}
                />
              </div>
            </div>
            {/* <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label className="text-gray-900 text-sm font-medium">Regular Fee</Label>
                <input
                  type="number"
                  placeholder="e.g 10"
                  className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                  value={editFormData.regularFee}
                  onChange={(e) => handleEditInputChange("regularFee", e.target.value)}
                 />
              </div>
            </div> */}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Active Days</Label>
              <div className="flex gap-4 flex-wrap pt-2">
                {Object.keys(editFormData.days).map((day) => (
                  <label key={day} className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="accent-teal-800"
                      checked={editFormData.days[day as keyof typeof editFormData.days]}
                      onChange={() => handleEditDayToggle(day as keyof EditFormData["days"])}
                    />
                    {day}
                  </label>
                ))}
                <label className="flex items-center gap-1 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="accent-teal-800"
                    checked={Object.values(editFormData.days).every(Boolean)}
                    onChange={() => {
                      const allSelected = Object.values(editFormData.days).every(Boolean)
                      setEditFormData((prev) => ({
                        ...prev,
                        days: Object.keys(prev.days).reduce(
                          (acc, day) => {
                            acc[day as keyof typeof prev.days] = !allSelected
                            return acc
                          },
                          {} as typeof prev.days,
                        ),
                      }))
                    }}
                  />
                  All
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-zinc-950 text-xl font-bold">Court Setting</h1>
            </div>
            <div className="w-[360px] ml-auto space-y-2 mt-2">
              <Input
                type="text"
                placeholder="Search court names..."
                value={courtSearchQuery}
                onChange={(e) => setCourtSearchQuery(e.target.value)}
                className="w-full"
              />
              <Search className="relative left-[338px] bottom-8 z-10 text-gray-500" size={16} />
            </div>
          </div>
          <div className="flex justify-end">
            <div
              className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] w-[130px] h-[40px] flex items-center justify-center text-xs cursor-pointer"
              onClick={handleAddCourt}
            >
              <FilePlus size={14} />
              <span className="ml-2">Add court</span>
            </div>
          </div>

          <div className="w-full border border-zinc-200 rounded-[8px] bg-white text-sm my-6">
            <Table
              data={courtData.filter((court) => court.name.toLowerCase().includes(courtSearchQuery.toLowerCase()))}
              autoHeight={false}
              className="rounded-[8px]"
              rowHeight={170}
              height={600}
              rowClassName={(rowData: RowDataType) => (!rowData?.availability ? "grayed-out-row" : "")}
            >
              <Column width={70} align="center" fixed>
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>S.NO</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => <div>{index !== undefined ? index + 1 : ""}</div>}
                </Cell>
              </Column>

              <Column width={150} align="center" fixed>
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>COURT NAME</HeaderCell>
                <Cell>{(rowData: RowDataType) => <div>{rowData.name}</div>}</Cell>
              </Column>
              <Column width={100} align="center" fixed>
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>REG FEE</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => (
                    <div className="relative">
                    {rowData.fees?.regular ? (
                      <span className="absolute left-4 top-4.5 -translate-y-1/2 text-gray-500 text-xs">$</span>
                    ) : null}
                    <Input
                      type="number"
                      placeholder="e.g 10"
                      value={rowData.fees?.regular || ""}
                      onChange={(e) =>
                        index !== undefined &&
                        handleCourtUpdate(index, "fees.regular", Number.parseFloat(e.target.value) || "")
                      }
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-1 pl-6 text-xs text-gray-700"
                      disabled={!rowData?.availability}
                    />
                  </div>
                  
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1} align="center">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>PEAK HOURS & FEES</HeaderCell>
                <Cell className="h-[200px]">
                  {(rowData: RowDataType, index?: number) => (
                    <div className="flex flex-col gap-4 max-h-[150px] overflow-y-auto pr-2">
                      {Array.isArray(rowData.peakHours) &&
                        rowData.peakHours.map((peak) => (
                          <div key={peak.id} className="flex items-center gap-2">
                            <TimePicker
                              value={peak.start ? dayjs(peak.start, "h:mm a") : null}
                              use12Hours={timeFormat === "12 hours"}
                              format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"}
                              onChange={(time) =>
                                index !== undefined && handlePeakHourChange(peak.id, "start", time, index)
                              }
                              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                              disabled={!rowData?.availability}
                              placeholder="Start"
                              needConfirm={false}
                            />
                            <span>to</span>
                            <TimePicker
                              value={peak.end ? dayjs(peak.end, "h:mm a") : null}
                              use12Hours={timeFormat === "12 hours"}
                              format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"}
                              onChange={(time) =>
                                index !== undefined && handlePeakHourChange(peak.id, "end", time, index)
                              }
                              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                              disabled={!rowData?.availability}
                              placeholder="End"
                                needConfirm={false}
                            />
                            <div className="relative">
                              {peak.fee ?
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span> :
                            null}
                            <Input
                              type="number"
                              value={peak.fee || ""}
                              onChange={(e) =>
                                index !== undefined && handlePeakHourChange(peak.id, "fee", e.target.value, index)
                              }
                              className="w-20 border border-zinc-300 rounded-md bg-gray-50 p-1 pl-6 text-xs text-gray-700"
                              disabled={!rowData?.availability}
                              placeholder="e.g $15"
                            />
                            </div>
                            {rowData.peakHours.length > 1 && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    type="button"
                                    className="text-red-500 hover:text-red-700"
                                    disabled={!rowData?.availability}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Peak Hour</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this peak hour? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => index !== undefined && removePeakHour(peak.id, index)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        ))}
                      <div className="flex justify-start">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (index !== undefined) {
                              addPeakHour(index)
                            }
                          }}
                          className="flex justify-center text-teal-800 hover:text-teal-700"
                          disabled={!rowData?.availability}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Plus size={16} />
                              </TooltipTrigger>
                              <TooltipContent>Add Peak hour and Fees</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </button>
                      </div>
                    </div>
                  )}
                </Cell>
              </Column>

              <Column width={120} align="center" fixed="right">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>AVAILABILITY</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => (
                    <div className="flex justify-center">
                      <Switch
                        checked={rowData.availability}
                        onCheckedChange={(checked) =>
                          index !== undefined && handleCourtUpdate(index, "availability", checked)
                        }
                        className="data-[state=checked]:bg-teal-800"
                      />
                    </div>
                  )}
                </Cell>
              </Column>

              <Column width={100} align="center" fixed="right">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>DELETE</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => (
                    <div className="flex justify-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Trash2 size={16} className="text-gray-600 cursor-pointer hover:text-red-700" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Court</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {rowData.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                if (index !== undefined) {
                                  handleDeleteCourt(index)
                                }
                              }}
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

        <div className="w-full flex justify-end border border-bgborder_color rounded-[6px] bg-white p-2 gap-2">
          <button
            className="border border-zinc-300 rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center cursor-pointer hover:bg-gray-50"
            onClick={() => {
              setCancelLoader(true)
              setTimeout(() => {
                router.push("/sports-management")
                setCancelLoader(false)
              }, 1000)
            }}
            disabled={cancelLoader}
          >
            {cancelLoader ? (
              <svg
                className="animate-spin h-6 w-6 text-teal-700"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-100"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Cancel"
            )}
          </button>
          <button
            className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center"
            onClick={handleEditSave}
            disabled={saveLoader}
          >
            {saveLoader ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="#fff"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </>
  )
}
