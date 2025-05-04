"use client"

import React, { useState,useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePicker } from "antd"
import { Switch } from "@/components/ui/switch"
import { Trash2, PlusCircle,Search } from "lucide-react"
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
interface CourtSettings {
  name: string
  peakHours: {
    start: string | null
    end: string | null
  }
  nonPeakHours: {
    start: string | null
    end: string | null
  }
  fees: {
    regular: number
    peak: number
  }
  availability: boolean
}

interface CourtsData {
  [courtName: string]: CourtSettings
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
  peakHours?: {
    start: string | null
    end: string | null
  }
  fees?: {
    regular: number
    peak: number
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

export default function EditSportPage({ params }: { params: Promise<{ id: string }> }) {
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
  const [editFormData, setEditFormData] = useState<{
    sportName: string
    icon: string
    sportStatus: string
    startTime: Date | null
    endTime: Date | null
    nonPeakStartTime: Date | null
    nonPeakEndTime: Date | null
    peakStartTime: Date | null
    peakEndTime: Date | null
    regularFee: string
    peakFee: string
    days: {
      Mon: boolean
      Tue: boolean
      Wed: boolean
      Thu: boolean
      Fri: boolean
      Sat: boolean
      Sun: boolean
    }
  }>({
    sportName: "",
    icon: "",
    sportStatus: "active",
    startTime: null,
    endTime: null,
    nonPeakStartTime: null,
    nonPeakEndTime: null,
    peakStartTime: null,
    peakEndTime: null,
    regularFee: "",
    peakFee: "",
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
  
  useEffect(() =>{
  fetchSportData()}
  , [sportId, currentUser])

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
            nonPeakHours: item.nonPeakHours || { start: null, end: null },
            peakHours: item.peakHours || { start: null, end: null },
            fees: item.fees || { regular: 0, peak: 0 },
            courtsData: item.courtsData || {},
            available_court_count: item.available_court_count || item.courts?.length || 0,
          }))

          setSportData(transformedData)

          // Find the sport to edit
          const sportToEdit = transformedData.find((sport: any) => sport.id === sportId)
          if (sportToEdit) {
            setEditFormData({
              sportName: sportToEdit.sportName,
              icon: sportToEdit.icon,
              sportStatus: sportToEdit.status,
              startTime: sportToEdit.timing.start ? dayjs(sportToEdit.timing.start, "HH:mm").toDate() : null,
              endTime: sportToEdit.timing.end ? dayjs(sportToEdit.timing.end, "HH:mm").toDate() : null,
              nonPeakStartTime: sportToEdit.nonPeakHours?.start
                ? dayjs(sportToEdit.nonPeakHours.start, "HH:mm").toDate()
                : null,
              nonPeakEndTime: sportToEdit.nonPeakHours?.end
                ? dayjs(sportToEdit.nonPeakHours.end, "HH:mm").toDate()
                : null,
              peakStartTime: sportToEdit.peakHours?.start ? dayjs(sportToEdit.peakHours.start, "HH:mm").toDate() : null,
              peakEndTime: sportToEdit.peakHours?.end ? dayjs(sportToEdit.peakHours.end, "HH:mm").toDate() : null,
              regularFee: sportToEdit.fees?.regular?.toString() || "",
              peakFee: sportToEdit.fees?.peak?.toString() || "",
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

            // Set court names
            setCourtNames(sportToEdit.courts || [])

            // Create court data with individual settings if courtsData exists
            if (sportToEdit.courtsData && Object.keys(sportToEdit.courtsData).length > 0) {
              const courtDataArray = sportToEdit.courts.map((courtName: string) => {
                const courtSettings = sportToEdit.courtsData?.[courtName] || {
                  peakHours: sportToEdit.peakHours || { start: null, end: null },
                  nonPeakHours: sportToEdit.nonPeakHours || { start: null, end: null },
                  fees: sportToEdit.fees || { regular: 0, peak: 0 },
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
                peakHours: sportToEdit.peakHours || { start: null, end: null },
                nonPeakHours: sportToEdit.nonPeakHours || { start: null, end: null },
                fees: sportToEdit.fees || { regular: 0, peak: 0 },
                availability: true,
              }))

              setCourtData(defaultCourtData)
            }
          } else {
            console.error("Sport not found")
            router.push("/sports-management")
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
  }

  const handleAddCourt = () => {
    if (!newCourtName.trim()) return

    // Check if court name already exists
    if (courtNames.includes(newCourtName)) {
      alert("Court name already exists")
      return
    }

    // Add to court names
    setCourtNames([...courtNames, newCourtName])

    // Add to court data with default settings
    setCourtData([
      ...courtData,
      {
        name: newCourtName,
        peakHours: {
          start: editFormData.peakStartTime ? dayjs(editFormData.peakStartTime).format("HH:mm") : null,
          end: editFormData.peakEndTime ? dayjs(editFormData.peakEndTime).format("HH:mm") : null,
        },
        nonPeakHours: {
          start: editFormData.nonPeakStartTime ? dayjs(editFormData.nonPeakStartTime).format("HH:mm") : null,
          end: editFormData.nonPeakEndTime ? dayjs(editFormData.nonPeakEndTime).format("HH:mm") : null,
        },
        fees: {
          regular: Number.parseFloat(editFormData.regularFee) || 0,
          peak: Number.parseFloat(editFormData.peakFee) || 0,
        },
        availability: true,
      },
    ])
    notify("Court added successfully", true)

    // Clear input
    setNewCourtName("")
  }

  const handleDeleteCourt = (index: number) => {
    const courtName = courtData[index].name

    // Remove from court names
    setCourtNames(courtNames.filter((name) => name !== courtName))

    // Remove from court data
    setCourtData(courtData.filter((_, i) => i !== index))
    notify("Court deleted successfully", true)
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

      // Create courtsData object from courtData array
      const courtsData: CourtsData = {}
      courtData.forEach((court) => {
        courtsData[court.name] = {
          name: court.name,
          peakHours: court.peakHours,
          nonPeakHours: court.nonPeakHours,
          fees: court.fees,
          availability: court.availability,
        }
      })

      // Calculate available courts count
      const availableCourtCount = courtData.filter((court) => court.availability).length

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
            nonPeakHours: {
              start: editFormData.nonPeakStartTime ? dayjs(editFormData.nonPeakStartTime).format("HH:mm") : null,
              end: editFormData.nonPeakEndTime ? dayjs(editFormData.nonPeakEndTime).format("HH:mm") : null,
            },
            peakHours: {
              start: editFormData.peakStartTime ? dayjs(editFormData.peakStartTime).format("HH:mm") : null,
              end: editFormData.peakEndTime ? dayjs(editFormData.peakEndTime).format("HH:mm") : null,
            },
            days: editFormData.days,
            fees: {
              regular: Number.parseFloat(editFormData.regularFee) || 0,
              peak: Number.parseFloat(editFormData.peakFee) || 0,
            },
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

      router.push("/sports-management")
    } catch (error) {
      console.error("Error updating sport data:", error)
    }
  }

  return (
    <div className="w-full bg-white p-4">
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
              <Select
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
              </Select>
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
          </div>

          <div className="w-full space-y-2">
            <Label className="text-gray-900 text-sm font-medium">Platform Timing</Label>
            <div className="flex items-center gap-4">
              <div className="w-full space-y-1.5">
                <Label className="text-sm text-gray-600">From</Label>
                <TimePicker
                  value={editFormData.startTime ? dayjs(editFormData.startTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("startTime", time)}
                />
              </div>

              <div className="w-full space-y-1.5">
                <Label className="text-gray-900 text-sm font-medium">To</Label>
                <TimePicker
                  value={editFormData.endTime ? dayjs(editFormData.endTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("endTime", time)}
                />
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <Label className="text-gray-900 text-sm font-medium">Non-Peak Hour Timing</Label>
            <div className="flex items-center gap-4">
              <div className="w-full space-y-1.5">
                <Label className="text-sm text-gray-600">From</Label>
                <TimePicker
                  value={editFormData.nonPeakStartTime ? dayjs(editFormData.nonPeakStartTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("nonPeakStartTime", time)}
                />
              </div>

              <div className="w-full space-y-1.5">
                <Label className="text-gray-900 text-sm font-medium">To</Label>
                <TimePicker
                  value={editFormData.nonPeakEndTime ? dayjs(editFormData.nonPeakEndTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("nonPeakEndTime", time)}
                />
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <Label className="text-gray-900 text-sm font-medium">Peak Hours</Label>
            <div className="flex items-center gap-4">
              <div className="w-full space-y-1.5">
                <Label className="text-sm text-gray-600">From</Label>
                <TimePicker
                  value={editFormData.peakStartTime ? dayjs(editFormData.peakStartTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("peakStartTime", time)}
                />
              </div>

              <div className="w-full space-y-1.5">
                <Label className="text-gray-900 text-sm font-medium">To</Label>
                <TimePicker
                  value={editFormData.peakEndTime ? dayjs(editFormData.peakEndTime) : null}
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("peakEndTime", time)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-full space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Default Regular Fee</Label>
              <input
                type="number"
                placeholder="12.99"
                className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                value={editFormData.regularFee}
                onChange={(e) => handleEditInputChange("regularFee", e.target.value)}
                min={0}
              />
            </div>

            <div className="w-full space-y-2">
              <Label className="text-gray-900 text-sm font-medium">Default Peak Fee</Label>
              <input
                type="number"
                placeholder="15.99"
                className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                value={editFormData.peakFee}
                onChange={(e) => handleEditInputChange("peakFee", e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div>
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
            </div>
          </div>

          {/* Add Court Section */}
          <div className="w-full space-y-2 pt-4 border-t border-gray-200">
            <Label className="text-gray-900 text-sm font-medium">Add New Court</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Enter court name"
                value={newCourtName}
                onChange={(e) => setNewCourtName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddCourt} className="bg-teal-800 hover:bg-teal-700">
                <PlusCircle size={16} className="mr-1" /> Add Court
              </Button>
            </div>
          </div>
          <div className="flex">
            <div className="w-[360px] ml-auto space-y-2 mt-2">
              <Input
                type="text"
                placeholder="Search court names..."
                value={courtSearchQuery}
                onChange={(e) => setCourtSearchQuery(e.target.value)}
                className="w-full"
              />
              <Search className="relative left-[338px] bottom-8 z-10 text-gray-500" size={16}  />
            </div>
          </div>

          {/* Court Table */}
          <div className="w-full border border-zinc-200 rounded-[8px] bg-white text-sm my-6">
  <Table
    data={courtData.filter((court) => court.name.toLowerCase().includes(courtSearchQuery.toLowerCase()))}
    autoHeight
    className="rounded-[8px]"
    style={{ overflowY: "auto" }}
    headerHeight={40}
    rowHeight={60}
    rowClassName={(rowData: RowDataType) => !rowData?.availability ? 'grayed-out-row' : ''}
  >
    <Column width={70} align="center">
      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>S.NO</HeaderCell>
      <Cell>
        {(rowData: RowDataType, index?: number) => <div>{index !== undefined ? index + 1 : ""}</div>}
      </Cell>
    </Column>

    <Column width={150} align="center">
      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>COURT NAME</HeaderCell>
      <Cell>{(rowData: RowDataType) => <div>{rowData.name}</div>}</Cell>
    </Column>

    <Column flexGrow={1} align="center">
      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>NON PEAK HOUR</HeaderCell>
      <Cell>
        {(rowData: RowDataType, index?: number) => (
          <div className="flex items-center gap-2">
            <TimePicker
              value={rowData.nonPeakHours?.start ? dayjs(rowData.nonPeakHours.start, "HH:mm") : null}
              use12Hours={timeFormat === "12 hours"}
              format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
              onChange={(time) =>
                index !== undefined &&
                handleCourtUpdate(index, "nonPeakHours.start", time ? time.format("HH:mm") : null)
              }
              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
              disabled={!rowData.availability}
            />
            <span>-</span>
            <TimePicker
              value={rowData.nonPeakHours?.end ? dayjs(rowData.nonPeakHours.end, "HH:mm") : null}
              use12Hours={timeFormat === "12 hours"}
              format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
              onChange={(time) =>
                index !== undefined &&
                handleCourtUpdate(index, "nonPeakHours.end", time ? time.format("HH:mm") : null)
              }
              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
              disabled={!rowData?.availability}
            />
          </div>
        )}
      </Cell>
    </Column>

    <Column flexGrow={1} align="center">
      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>PEAK HOUR</HeaderCell>
      <Cell>
        {(rowData: RowDataType, index?: number) => (
          <div className="flex items-center gap-2">
            <TimePicker
              value={rowData.peakHours?.start ? dayjs(rowData.peakHours.start, "HH:mm") : null}
              use12Hours={timeFormat === "12 hours"}
              format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
              onChange={(time) =>
                index !== undefined &&
                handleCourtUpdate(index, "peakHours.start", time ? time.format("HH:mm") : null)
              }
              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
              disabled={!rowData?.availability}
            />
            <span>-</span>
            <TimePicker
              value={rowData.peakHours?.end ? dayjs(rowData.peakHours.end, "HH:mm") : null}
              use12Hours={timeFormat === "12 hours"}
              format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
              onChange={(time) =>
                index !== undefined &&
                handleCourtUpdate(index, "peakHours.end", time ? time.format("HH:mm") : null)
              }
              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
              disabled={!rowData?.availability}
            />
          </div>
        )}
      </Cell>
    </Column>

    <Column width={100} align="center">
      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>REG FEE</HeaderCell>
      <Cell>
        {(rowData: RowDataType, index?: number) => (
          <Input
            type="number"
            value={rowData.fees?.regular || 0}
            onChange={(e) =>
              index !== undefined &&
              handleCourtUpdate(index, "fees.regular", Number.parseFloat(e.target.value) || 0)
            }
            className="w-full border border-zinc-300 rounded-md bg-gray-50 p-1 text-xs text-gray-700"
            disabled={!rowData?.availability}
          />
        )}
      </Cell>
    </Column>

    <Column width={100} align="center">
      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>PEAK FEE</HeaderCell>
      <Cell>
        {(rowData: RowDataType, index?: number) => (
          <Input
            type="number"
            value={rowData.fees?.peak || 0}
            onChange={(e) =>
              index !== undefined &&
              handleCourtUpdate(index, "fees.peak", Number.parseFloat(e.target.value) || 0)
            }
            className="w-full border border-zinc-300 rounded-md bg-gray-50 p-1 text-xs text-gray-700"
            disabled={!rowData?.availability}
          />
        )}
      </Cell>
    </Column>

    <Column width={120} align="center">
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

    <Column width={100} align="center">
      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>DELETE</HeaderCell>
      <Cell>
        {(rowData: RowDataType, index?: number) => (
          <div className="flex justify-center">
            <Trash2
              size={16}
              className="text-gray-600 cursor-pointer"
              onClick={() => {
                if (index !== undefined && courtData.length > 1) {
                  handleDeleteCourt(index)
                } else if (courtData.length <= 1) {
                  alert("Cannot delete the last court")
                }
              }}
            />
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
          className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center"
          onClick={handleEditSave}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
