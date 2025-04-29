"use client"

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
  court_availability?: Array<{ name: string; availability: boolean }>
  available_court_count?: number
}

interface CourtData {
  name: string
  timing: {
    start: string
    end: string
  }
  peakHours: {
    start: string
    end: string
  }
  fee: number
  peakFee: number
  availability: boolean
}

export default function SportsManagementPage() {
  const router = useRouter()
  const supabase = createClient()
  const [openAdd, setOpenAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const { Column, HeaderCell, Cell } = Table
  const { user: currentUser } = useGlobalContext()

  const [sportData, setSportData] = useState<SportData[]>([])
  const [timeFormat, setTimeFormat] = useState("12 hours")
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

  useEffect(() => {
    fetchSportsData()
  }, [currentUser])

  const fetchSportsData = async () => {
    try {
      setLoading(true)
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
          platform_count: item.platform_count || 0,
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
          court_availability: item.court_availability || [],
          available_court_count: item.available_court_count || item.platform_count || 0,
        }))

        setSportData(transformedData)
      }
    } catch (error) {
      console.error("Error fetching sports management data:", error)
    } finally {
      setLoading(false)
    }
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

  const handleSave = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("companies")
        .select("sports_management")
        .eq("store_admin", currentUser?.email)
        .single()

      if (fetchError) throw fetchError

      const currentSportsData = data?.sports_management || []

      const courts = []
      const platformCount = Number.parseInt(formData.platformCount)
      for (let i = 1; i <= platformCount; i++) {
        courts.push(`${formData.platformName}`)
      }

      const newId = currentSportsData.length > 0 ? Math.max(...currentSportsData.map((s: any) => s.id)) + 1 : 1

      const newSport = {
        id: newId,
        icon: formData.icon,
        sport_name: formData.sportName,
        courts: courts,
        availability: true,
        status: formData.sportStatus,
        timing: {
          start: formData.startTime ? dayjs(formData.startTime).format("HH:mm") : null,
          end: formData.endTime ? dayjs(formData.endTime).format("HH:mm") : null,
        },
        nonPeakHours: {
          start: formData.nonPeakStartTime ? dayjs(formData.nonPeakStartTime).format("HH:mm") : null,
          end: formData.nonPeakEndTime ? dayjs(formData.nonPeakEndTime).format("HH:mm") : null,
        },
        peakHours: {
          start: formData.peakStartTime ? dayjs(formData.peakStartTime).format("HH:mm") : null,
          end: formData.peakEndTime ? dayjs(formData.peakEndTime).format("HH:mm") : null,
        },
        days: formData.days,
        platform_count: platformCount,
        fees: {
          regular: Number.parseFloat(formData.regularFee) || 0,
          peak: Number.parseFloat(formData.peakFee) || 0,
        },
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

      setOpenAdd(false)
      fetchSportsData()
    } catch (error) {
      console.error("Error saving sport data:", error)
    }
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
    return sport.available_court_count || sport.platform_count
  }

  const getUnavailablePlatforms = (sport: SportData) => {
    if (!sport.availability) return sport.platform_count
    return sport.platform_count - (sport.available_court_count || sport.platform_count)
  }

  return (
    <div className="w-full bg-white p-4">
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="items-center gap-2">
          <h1 className="text-xl font-bold text-zinc-950">Sport Management</h1>
          <p className="text-sm text-zinc-500">Add & manage sports details.</p>
        </div>
        <Sheet open={openAdd} onOpenChange={setOpenAdd}>
          <SheetTrigger>
            <div className="bg-teal-800 text-white rounded-[12px] w-[130px] h-[40px] flex items-center justify-center text-xs cursor-pointer">
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
                    <Label>Sport Name</Label>
                    <Select value={formData.sportName} onValueChange={(value) => handleInputChange("sportName", value)}>
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
                    <Label>Icon</Label>
                    <Select value={formData.icon} onValueChange={(value) => handleInputChange("icon", value)}>
                      <SelectTrigger className="w-full border border-zinc-300 bg-gray-50 text-sm text-gray-700">
                        <SelectValue placeholder="Choose icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="🏸">🏸 Badminton</SelectItem>
                        <SelectItem value="🎾">🎾 Tennis</SelectItem>
                        <SelectItem value="🏏">🏏 Cricket</SelectItem>
                        <SelectItem value="🏋️">🏋️ GYM</SelectItem>
                        <SelectItem value="🧘">🧘 Yoga</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full space-y-2">
                    <Label>Sport Status</Label>
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

                <div className="flex gap-4">
                  <div className="w-full space-y-2">
                    <Label>Platform Name</Label>
                    <input
                      type="text"
                      placeholder="Court, Turf, Class, Room"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={formData.platformName}
                      onChange={(e) => handleInputChange("platformName", e.target.value)}
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <Label>No. of Platform</Label>
                    <input
                      type="number"
                      placeholder="20"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={formData.platformCount}
                      onChange={(e) => handleInputChange("platformCount", e.target.value)}
                      min={1}
                    />
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Platform Timing</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">From</Label>
                      <TimePicker
                        value={formData.startTime}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("startTime", time)}
                        needConfirm={false}
                      />
                    </div>

                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">To</Label>
                      <TimePicker
                        value={formData.endTime}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("endTime", time)}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Non-Peak Hour Timing</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">From</Label>
                      <TimePicker
                        value={formData.nonPeakStartTime}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("nonPeakStartTime", time)}
                      />
                    </div>

                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">To</Label>
                      <TimePicker
                        value={formData.nonPeakEndTime}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("nonPeakEndTime", time)}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Peak Hours</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">From</Label>
                      <TimePicker
                        value={formData.peakStartTime}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("peakStartTime", time)}
                      />
                    </div>

                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">To</Label>
                      <TimePicker
                        value={formData.peakEndTime}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("peakEndTime", time)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-full space-y-2">
                    <Label>Regular Fee</Label>
                    <input
                      type="number"
                      placeholder="12.99"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={formData.regularFee}
                      onChange={(e) => handleInputChange("regularFee", e.target.value)}
                      min={0}
                     
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <Label>Peak Fee</Label>
                    <input
                      type="number"
                      placeholder="15.99"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={formData.peakFee}
                      onChange={(e) => handleInputChange("peakFee", e.target.value)}
                      min={0}
                     
                    />
                  </div>
                </div>

                <div>
                  <Label>Active Days</Label>
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
                  </div>
                </div>

                <div className="flex justify-start gap-2 bg-white w-full">
                  <button
                    className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                  <div
                    className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center mt-2 cursor-pointer"
                    onClick={() => setOpenAdd(false)}
                  >
                    Cancel
                  </div>
                </div>
              </div>
            </SheetDescription>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Table */}
      <div className="w-full border border-zinc-200 rounded-[8px] bg-white text-sm my-6">
        <Table data={sportData} autoHeight className="rounded-[8px]" loading={loading}>
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
                  {rowData.icon}
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
                  <Trash2
                    size={16}
                    className="hover:text-red-700 cursor-pointer"
                    onClick={() => handleDelete((rowData as SportData).id)}
                  />
                </div>
              )}
            </Cell>
          </Column>
        </Table>
      </div>
    </div>
  )
}
