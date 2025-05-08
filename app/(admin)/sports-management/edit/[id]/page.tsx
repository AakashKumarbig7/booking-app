"use client"

import React, { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePicker } from "antd"
import { Switch } from "@/components/ui/switch"
import { Trash2, Search, FilePlus, Plus } from "lucide-react"
import { Table } from "rsuite"
import type { RowDataType } from "rsuite/esm/Table"
import dayjs from "dayjs"
import { useGlobalContext } from "@/context/store"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import toast, { Toaster } from "react-hot-toast"
import "@/app/(admin)/sports-management/edit/[id]/style.css" // Import your global CSS file
// Add import for sport icons
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

interface CourtSettings {
  name: string
  peakHours: Array<{
    id: string
    start: string | null
    end: string | null
    fee: number
  }>
  // nonPeakHours: {
  //   start: string | null
  //   end: string | null
  // }
  fees: {
    regular: number
  }
  availability: boolean
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
  // nonPeakHours?: {
  //   start: string | null
  //   end: string | null
  // }
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
  [key: string]: {
    name: string
    peakHours: Array<{
      id: string
      start: string | null
      end: string | null
      fee: number
    }>
    // nonPeakHours: {
    //   start: string | null
    //   end: string | null
    // }
    fees: {
      regular: number
    }
    availability: boolean
  }
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
  const [loading, setLoading] = useState(true)
  const { Column, HeaderCell, Cell } = Table
  const { user: currentUser } = useGlobalContext()

  // Unwrap the params Promise using React.use()
  const { id } = React.use(params)
  const sportId = Number.parseInt(id)

  const [sportData, setSportData] = useState<SportData[]>([])
  const [courtData, setCourtData] = useState<CourtSettings[]>([])
  const [courtNames, setCourtNames] = useState<string[]>([])
  const [timeFormat, setTimeFormat] = useState("12 hours")
  const [newCourtName, setNewCourtName] = useState("")
  const [courtSearchQuery, setCourtSearchQuery] = useState("")
  const [courtToDelete, setCourtToDelete] = useState<{
    index: number
    name: string
  } | null>(null)
  const [peakHourToDelete, setPeakHourToDelete] = useState<{
    courtIndex: number
    peakIndex: number
  } | null>(null)

  // 3. Add thirdPeakTime to the editFormData state
  const [editFormData, setEditFormData] = useState<{
    sportName: string
    icon: string
    sportStatus: string
    startTime: Date | null
    endTime: Date | null
    // nonPeakStartTime: Date | null
    // nonPeakEndTime: Date | null
    peakHours: Array<{
      id: string
      startTime: Date | null
      endTime: Date | null
      fee: string
    }>
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
  }>({
    sportName: "",
    icon: "",
    sportStatus: "active",
    startTime: null,
    endTime: null,
    // nonPeakStartTime: null,
    // nonPeakEndTime: null,
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

  const [editedCourts, setEditedCourts] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchSportData()
  }, [sportId, currentUser])

  const fetchSportData = async () => {
    try {
      setLoading(true)
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
            // nonPeakHours: item.nonPeakHours || { start: null, end: null },
            peakHours: item.peakHours || [{ start: null, end: null, fee: 0 }],
            fees: item.fees || { regular: 0 },
            courtsData: item.courtsData || {},
            available_court_count: item.available_court_count || item.courts?.length || 0,
          }))

          setSportData(transformedData)

          // Find the sport to edit
          const sportToEdit = transformedData.find((sport: any) => sport.id === sportId)
          // 4. Update the fetchSportData function to include thirdPeakHours
          if (sportToEdit) {
            // Convert the peak hours array from the database to the form structure
            const peakHoursArray = Array.isArray(sportToEdit.peakHours)
              ? sportToEdit.peakHours.map((peak: any) => ({
                  id: crypto.randomUUID(),
                  startTime: peak.start ? dayjs(peak.start, "HH:mm").toDate() : null,
                  endTime: peak.end ? dayjs(peak.end, "HH:mm").toDate() : null,
                  fee: peak.fee?.toString() || "",
                }))
              : [
                  {
                    id: crypto.randomUUID(),
                    startTime: sportToEdit.peakHours?.start
                      ? dayjs(sportToEdit.peakHours.start, "HH:mm").toDate()
                      : null,
                    endTime: sportToEdit.peakHours?.end ? dayjs(sportToEdit.peakHours.end, "HH:mm").toDate() : null,
                    fee: sportToEdit.fees?.peak?.toString() || "",
                  },
                ]

            setEditFormData({
              sportName: sportToEdit.sportName,
              platformCount: sportToEdit.platform_count.toString(),
              platformName: sportToEdit.courts[0] || "",
              icon: sportToEdit.icon,
              sportStatus: sportToEdit.status,
              startTime: sportToEdit.timing.start ? dayjs(sportToEdit.timing.start, "HH:mm").toDate() : null,
              endTime: sportToEdit.timing.end ? dayjs(sportToEdit.timing.end, "HH:mm").toDate() : null,
              // nonPeakStartTime: sportToEdit.nonPeakHours?.start
              //   ? dayjs(sportToEdit.nonPeakHours.start, "HH:mm").toDate()
              //   : null,
              // nonPeakEndTime: sportToEdit.nonPeakHours?.end
              //   ? dayjs(sportToEdit.nonPeakHours.end, "HH:mm").toDate()
              //   : null,
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
          }

          // Set court names
          setCourtNames(sportToEdit.courts || [])

          // 5. Update the court data creation to include thirdPeakHours
          if (sportToEdit.courtsData && Object.keys(sportToEdit.courtsData).length > 0) {
            const courtDataArray = sportToEdit.courts.map((courtName: string) => {
              const courtSettings = sportToEdit.courtsData?.[courtName] || {
                name: courtName,
                peakHours: Array.isArray(sportToEdit.peakHours)
                  ? sportToEdit.peakHours
                  : [
                      {
                        id: crypto.randomUUID(),
                        start: sportToEdit.peakHours?.start || null,
                        end: sportToEdit.peakHours?.end || null,
                        fee: sportToEdit.fees?.peak || 0,
                      },
                    ],
                // nonPeakHours: sportToEdit.nonPeakHours || {
                //   start: null,
                //   end: null,
                // },
                fees: {
                  regular: sportToEdit.fees?.regular || 0,
                },
                availability: true,
              }

              return {
                name: courtName,
                ...courtSettings,
              }
            })

            setCourtData(courtDataArray)
          } else {
            // Create default court data if courtsData doesn't exist
            const defaultCourtData = sportToEdit.courts.map((courtName: string) => ({
              name: courtName,
              peakHours: Array.isArray(sportToEdit.peakHours)
                ? sportToEdit.peakHours
                : [
                    {
                      id: crypto.randomUUID(),
                      start: sportToEdit.peakHours?.start || null,
                      end: sportToEdit.peakHours?.end || null,
                      fee: sportToEdit.fees?.peak || 0,
                    },
                  ],
              // nonPeakHours: sportToEdit.nonPeakHours || {
              //   start: null,
              //   end: null,
              // },
              fees: {
                regular: sportToEdit.fees?.regular || 0,
              },
              availability: true,
            }))

            setCourtData(defaultCourtData)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching sport data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleEditDayToggle = (day: string) => {
    setEditFormData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day as keyof typeof prev.days],
      },
    }))
  }

  const handleCourtUpdate = (index: number, field: string, value: any) => {
    setCourtData((prev) => {
      const newData = [...prev]

      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        newData[index] = {
          ...newData[index],
          [parent]: {
            ...(typeof newData[index][parent as keyof CourtSettings] === "object" &&
            newData[index][parent as keyof CourtSettings] !== null
              ? (newData[index][parent as keyof CourtSettings] as object)
              : {}),
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

    setEditedCourts((prev) => ({
      ...prev,
      [index]: true,
    }))
  }

  const handleEditSave = async () => {
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

      const platformCount = Number.parseInt(editFormData.platformCount) || 0
      const platformNameBase = editFormData.platformName.trim()
  
      // Determine if we should use letters or numbers based on the last character
      const lastChar = platformNameBase.slice(-1)
      const useLetters = isNaN(Number(lastChar)) // If last character is not a number
  
      let courtNames: string[] = [];
      if (courtData.length > 0) {
        // Use existing court names from courtData
        courtNames = courtData.map((court) => court.name);
      } else {
        // Only generate new names if no courts exist
        for (let i = 0; i < Number.parseInt(editFormData.platformCount); i++) {
          if (useLetters) {
            const letter = String.fromCharCode(65 + i);
            courtNames.push(`${platformNameBase}${letter}`);
          } else {
            courtNames.push(`${platformNameBase}${i + 1}`);
          }
        }
      }

      // Create default values for peak hours and fees
      const defaultPeakHours = editFormData.peakHours.map((peak) => ({
        id: peak.id, // Include the id property
        start: peak.startTime ? dayjs(peak.startTime).format("HH:mm") : null,
        end: peak.endTime ? dayjs(peak.endTime).format("HH:mm") : null,
        fee: Number.parseFloat(peak.fee) || 0,
      }))

      // Update the defaultFees:
      const defaultFees = {
        regular: Number.parseFloat(editFormData.regularFee) || 0,
      }

      // Update the courtsData creation:
      const courtsData: CourtsData = {}
      courtData.forEach((court, index) => {
        if (editedCourts[index]) {
          // This court has been individually edited, preserve its values
          courtsData[court.name] = {
            name: court.name,
            peakHours: Array.isArray(court.peakHours) ? court.peakHours : [],
            // nonPeakHours: court.nonPeakHours,
            fees: court.fees,
            availability: court.availability,
          }
        } else {
          // This court hasn't been individually edited, apply default values
          courtsData[court.name] = {
            name: court.name,
            peakHours: defaultPeakHours,
            // nonPeakHours: {
            //   start: editFormData.nonPeakStartTime ? dayjs(editFormData.nonPeakStartTime).format("HH:mm") : null,
            //   end: editFormData.nonPeakEndTime ? dayjs(editFormData.nonPeakEndTime).format("HH:mm") : null,
            // },
            fees: defaultFees,
            availability: court.availability,
          }
        }
      })

      // Calculate available courts count
      const availableCourtCount = courtData.filter((court) => court.availability).length

      // Update the sports data with the new values
      const updatedSportsData = data.sports_management.map((sport: any) => {
        if (sport.id === sportId) {
          return {
            ...sport,
            icon: editFormData.icon,
            sport_name: editFormData.sportName,
            status: editFormData.sportStatus,
            courts: courtNames,
            timing: {
              start: editFormData.startTime ? dayjs(editFormData.startTime).format("HH:mm") : null,
              end: editFormData.endTime ? dayjs(editFormData.endTime).format("HH:mm") : null,
            },
            // nonPeakHours: {
            //   start: editFormData.nonPeakStartTime ? dayjs(editFormData.nonPeakStartTime).format("HH:mm") : null,
            //   end: editFormData.nonPeakEndTime ? dayjs(editFormData.nonPeakEndTime).format("HH:mm") : null,
            // },
            peakHours: defaultPeakHours,
            days: editFormData.days,
            fees: defaultFees,
            courtsData: courtsData,
            platform_count: courtNames.length,
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
      notify("Sport updated successfully", true)
      if (error) throw error

      // router.push("/sports-management")
      fetchSportData()
    } catch (error) {
      console.error("Error updating sport data:", error)
    }
  }

  const handleDeleteCourt = (index: number) => {
    setCourtData((prev) => {
      const newData = [...prev]
      newData.splice(index, 1)
      return newData
    })
    setCourtToDelete(null)
  }

  const addPeakHour = (courtIndex?: number) => {
    if (courtIndex !== undefined) {
      setCourtData((prev) => {
        const newData = [...prev]
        if (!Array.isArray(newData[courtIndex].peakHours)) {
          newData[courtIndex].peakHours = []
        }

        // Check if there's already an empty peak hour entry to prevent duplicates
        const hasEmptyEntry = newData[courtIndex].peakHours.some(
          (hour) => hour.start === null && hour.end === null && hour.fee === 0,
        )

        if (!hasEmptyEntry) {
          // Only add one new peak hour entry if there's no empty entry
          newData[courtIndex].peakHours.push({
            id: crypto.randomUUID(),
            start: null,
            end: null,
            fee: 0,
          })
        }

        return newData
      })
      setEditedCourts((prev) => ({
        ...prev,
        [courtIndex]: true,
      }))
    } else {
      // For the main form's peak hours
      setEditFormData((prev) => {
        // Check if there's already an empty peak hour entry
        const hasEmptyEntry = prev.peakHours.some(
          (hour) => hour.startTime === null && hour.endTime === null && hour.fee === "",
        )

        if (hasEmptyEntry) {
          return prev // Don't add another empty entry
        }

        return {
          ...prev,
          peakHours: [...prev.peakHours, { id: crypto.randomUUID(), startTime: null, endTime: null, fee: "" }],
        }
      })
    }
  }

  const removePeakHour = (id: string, courtIndex?: number) => {
    if (courtIndex !== undefined) {
      setCourtData((prev) => {
        const newData = [...prev]
        if (Array.isArray(newData[courtIndex].peakHours) && newData[courtIndex].peakHours.length > 1) {
          // Create a new array without the peak hour with the specified ID
          newData[courtIndex].peakHours = newData[courtIndex].peakHours.filter((hour) => hour.id !== id)
        }
        return newData
      })
      setEditedCourts((prev) => ({
        ...prev,
        [courtIndex]: true,
      }))
      setPeakHourToDelete(null)
    } else {
      if (editFormData.peakHours.length > 1) {
        setEditFormData((prev) => ({
          ...prev,
          peakHours: prev.peakHours.filter((hour) => hour.id !== id),
        }))
      }
    }
  }

  const handlePeakHourChange = (id: string, field: string, value: any, courtIndex?: number) => {
    if (courtIndex !== undefined) {
      setCourtData((prev) => {
        const newData = [...prev]
        if (Array.isArray(newData[courtIndex].peakHours)) {
          // Find the peak hour with the matching ID and update it
          newData[courtIndex].peakHours = newData[courtIndex].peakHours.map((hour) => {
            if (hour.id === id) {
              if (field === "fee") {
                return { ...hour, fee: Number(value) || 0 }
              } else if (field === "start") {
                return { ...hour, start: value ? value.format("HH:mm") : null }
              } else if (field === "end") {
                return { ...hour, end: value ? value.format("HH:mm") : null }
              }
            }
            return hour
          })
        }
        return newData
      })
      setEditedCourts((prev) => ({
        ...prev,
        [courtIndex]: true,
      }))
    } else {
      setEditFormData((prev) => {
        const updatedPeakHours = prev.peakHours.map((hour) => (hour.id === id ? { ...hour, [field]: value } : hour))
        return {
          ...prev,
          peakHours: updatedPeakHours,
        }
      })
    }
  }

  const handleAddCourt = () => {
    // Get all existing court names
    const existingNames = courtData.map(court => court.name);
    
    // Find highest number/letter in existing names
    let highestIndex = 0;
    let useLetters = false;
    
    existingNames.forEach(name => {
      // Check for number suffix
      const numMatch = name.match(/\d+$/);
      if (numMatch) {
        const num = parseInt(numMatch[0]);
        if (num > highestIndex) highestIndex = num;
      } 
      // Check for letter suffix
      else {
        const letter = name.slice(-1).toUpperCase();
        if (/[A-Z]/.test(letter)) {
          useLetters = true;
          const letterIndex = letter.charCodeAt(0) - 65;
          if (letterIndex > highestIndex) highestIndex = letterIndex;
        }
      }
    });
  
    // Determine base name (remove any trailing numbers/letters)
    let baseName = editFormData.platformName.trim();
    if (useLetters) {
      baseName = baseName.replace(/[A-Za-z]$/, '');
    } else {
      baseName = baseName.replace(/\d+$/, '');
    }
  
    // Create new court name
    const newIndex = highestIndex + 1;
    const newCourtName = useLetters 
      ? `${baseName}${String.fromCharCode(65 + newIndex)}`
      : `${baseName}${newIndex}`;
  
    // Create new court with default settings
    const newCourt: CourtSettings = {
      name: newCourtName,
      peakHours: [...editFormData.peakHours.map(peak => ({
        id: crypto.randomUUID(),
        start: peak.startTime ? dayjs(peak.startTime).format("HH:mm") : null,
        end: peak.endTime ? dayjs(peak.endTime).format("HH:mm") : null,
        fee: Number.parseFloat(peak.fee) || 0
      }))],
      fees: {
        regular: Number.parseFloat(editFormData.regularFee) || 0
      },
      availability: true
    };
  
    // Add new court
    setCourtData([...courtData, newCourt]);
    handleEditInputChange("platformCount", (courtData.length + 1).toString());
  };
  return (
    <div className="w-full bg-white p-4 ">
      <Toaster />
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="items-center gap-2">
          <h1 className="text-xl font-bold text-zinc-950">Edit Sport</h1>
          <p className="text-sm text-zinc-500">Update sport details.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/sports-management")}>
          Back to Sports
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <div className="w-full space-y-4 pt-4 pb-32 px-4">
          <div className="flex gap-4">
            <div className="w-full space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Sport Name</Label>
              {/* <Select
                value={editFormData.sportName}
                onValueChange={(value) => handleEditInputChange("sportName", value)}
              >
                <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm pt-0.5 text-gray-700">
                  <SelectValue placeholder="Badminton / Tennis / Cricket..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Badminton">Badminton</SelectItem>
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
                value={editFormData.sportName || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleEditInputChange("sportName", e.target.value)
                }
              />
            </div>

            <div className="w-full space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Icon</Label>
              <Select value={editFormData.icon} onValueChange={(value) => handleEditInputChange("icon", value)}>
                <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
                  <SelectValue placeholder="Choose icon" />
                </SelectTrigger>
                {/* Update the SelectContent for the icon field */}
                <SelectContent>
                  <SelectItem value="badminton">
                    <div className="flex items-center gap-2">
                      {getSportIcon("badminton")}
                      {/* <span>Badminton</span> */}
                    </div>
                  </SelectItem>
                  <SelectItem value="tennis">
                    <div className="flex items-center gap-2">
                      {getSportIcon("tennis")}
                      {/* <span>Tennis</span> */}
                    </div>
                  </SelectItem>
                  <SelectItem value="cricket">
                    <div className="flex items-center gap-2">
                      {getSportIcon("cricket")}
                      {/* <span>Cricket</span> */}
                    </div>
                  </SelectItem>
                  <SelectItem value="gym">
                    <div className="flex items-center gap-2">
                      {getSportIcon("gym")}
                      {/* <span>GYM</span> */}
                    </div>
                  </SelectItem>
                  <SelectItem value="yoga">
                    <div className="flex items-center gap-2">
                      {getSportIcon("yoga")}
                      {/* <span>Yoga</span> */}
                    </div>
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
                placeholder="courtA,courtB,courtC"
                className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                value={editFormData.platformName}
                onChange={(e) => handleEditInputChange("platformName", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4">
            {/* No. of Platform */}
            <div className="flex-1 space-y-2">
              <Label className="text-gray-900 text-sm font-medium">No. of Platform</Label>
              <input
                type="number"
                placeholder="2"
                className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                value={editFormData.platformCount}
                onChange={(e) => handleEditInputChange("platformCount", e.target.value)}
                min={0}
              />
            </div>

            {/* Platform Timing - Compact */}
            <div className="flex-1 space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Platform Timing</Label>
              <div className="flex items-center gap-2">
                <TimePicker
                  value={editFormData.startTime ? dayjs(editFormData.startTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm"}
                  placeholder="Start"
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("startTime", time)}
                />
                <span className="text-gray-500">to</span>
                <TimePicker
                  value={editFormData.endTime ? dayjs(editFormData.endTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm"}
                  placeholder="End"
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("endTime", time)}
                />
              </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-gray-900 text-sm font-medium">Regular Fee</Label>
                  <input
                    type="number"
                    placeholder="12.99"
                    className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                    value={editFormData.regularFee}
                    onChange={(e) => handleEditInputChange("regularFee", e.target.value)}
                    min={0}
                  />
                </div>
              </div>
            {/* <div className="flex-1 space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Non Peak Hours</Label>
              <div className="flex items-center gap-2">
                <TimePicker
                  value={editFormData.nonPeakStartTime ? dayjs(editFormData.nonPeakStartTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm"}
                  placeholder="Start"
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("nonPeakStartTime", time)}
                />
                <span className="text-gray-500">to</span>
                <TimePicker
                  value={editFormData.nonPeakEndTime ? dayjs(editFormData.nonPeakEndTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm"}
                  placeholder="End"
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("nonPeakEndTime", time)}
                />
              </div>
            </div> */}
          </div>

          <div className="flex gap-4">
            {/* Fees Section */}
            

            <div className="flex-1 space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Active Days</Label>
              <div className="flex gap-4 flex-wrap pt-2">
                {Object.keys(editFormData.days).map((day) => (
                  <label key={day} className="flex items-center gap-1 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="accent-teal-800"
                      checked={editFormData.days[day as keyof typeof editFormData.days]}
                      onChange={() => handleEditDayToggle(day)}
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

          <div
            className="w-full border border-zinc-200 rounded-[8px] bg-white text-sm my-6"
            // style={{ maxHeight: "600px", overflowY: "auto" }}
          >
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
                    <Input
                      type="number"
                      value={rowData.fees?.regular || ""}
                      onChange={(e) =>
                        index !== undefined &&
                        handleCourtUpdate(index, "fees.regular", Number.parseFloat(e.target.value) || "")
                      }
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-1 text-xs text-gray-700"
                      disabled={!rowData?.availability}
                    />
                  )}
                </Cell>
              </Column>
              <Column flexGrow={1} align="center">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>PEAK HOURS & FEES</HeaderCell>
                <Cell className="h-[200px]">
                  {(rowData: RowDataType, index?: number) => (
                    <div className="flex flex-col gap-4 max-h-[150px] overflow-y-auto pr-2">
                      {Array.isArray(rowData.peakHours) ? (
                        rowData.peakHours.map((peak, peakIndex) => (
                          <div key={peak.id} className="flex items-center gap-2">
                            <TimePicker
                              value={peak.start ? dayjs(peak.start, "HH:mm") : null}
                              use12Hours={timeFormat === "12 hours"}
                              format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                              onChange={(time) =>
                                index !== undefined && handlePeakHourChange(peak.id, "start", time, index)
                              }
                              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                              disabled={!rowData?.availability}
                              placeholder="Start"
                            />
                            <span>-</span>
                            <TimePicker
                              value={peak.end ? dayjs(peak.end, "HH:mm") : null}
                              use12Hours={timeFormat === "12 hours"}
                              format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                              onChange={(time) =>
                                index !== undefined && handlePeakHourChange(peak.id, "end", time, index)
                              }
                              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                              disabled={!rowData?.availability}
                              placeholder="End"
                            />
                            <Input
                              type="number"
                              value={peak.fee || ""}
                              onChange={(e) =>
                                index !== undefined && handlePeakHourChange(peak.id, "fee", e.target.value, index)
                              }
                              className="w-20 border border-zinc-300 rounded-md bg-gray-50 p-1 text-xs text-gray-700"
                              disabled={!rowData?.availability}
                              placeholder="Fee"
                            />
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
                        ))
                      ) : (
                        <div className="flex items-center gap-2">
                          <TimePicker
                            value={null}
                            use12Hours={timeFormat === "12 hours"}
                            format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                            className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                            disabled={!rowData?.availability}
                            placeholder="Start"
                          />
                          <span>-</span>
                          <TimePicker
                            value={null}
                            use12Hours={timeFormat === "12 hours"}
                            format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                            className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                            disabled={!rowData?.availability}
                            placeholder="End"
                          />
                          <Input
                            type="number"
                            value={0}
                            className="w-20 border border-zinc-300 rounded-md bg-gray-50 p-1 text-xs text-gray-700"
                            disabled={!rowData?.availability}
                            placeholder="Fee"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </Cell>
              </Column>

              <Column width={80} align="left" fixed="right">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>ADD PEAK</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => index !== undefined && addPeakHour(index)}
                        className="flex  justify-center text-teal-800 hover:text-teal-700"
                        disabled={!rowData?.availability}
                      >
                        <Plus size={16} />
                      </button>
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
                        className="data-[state=checked]:bg-teal-500"
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
                                if (index !== undefined && courtData.length > 1) {
                                  handleDeleteCourt(index)
                                } else if (courtData.length <= 1) {
                                  notify("Cannot delete the last court", false)
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
      )}
      <div className="w-full flex justify-end border border-bgborder_color rounded-[6px] bg-white p-2 gap-2">
        <button
          className="border border-zinc-300 rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center cursor-pointer"
          onClick={() => router.push("/sports-management")}
        >
          Cancel
        </button>
        <button
          className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center"
          onClick={handleEditSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
