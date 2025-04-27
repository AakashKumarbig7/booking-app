"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePicker } from "antd"
import { Switch } from "@/components/ui/switch"
import { FilePlus, Pencil, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Table } from "rsuite"
import type { RowDataType } from "rsuite/esm/Table"
import dayjs from "dayjs"
import { useGlobalContext } from "@/context/store"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"

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
  peakHours?: {
    start: string | null
    end: string | null
  }
  fees?: {
    regular: number
    peak: number
  }
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
  const supabase = createClient()
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const { Column, HeaderCell, Cell } = Table
  const { user: currentUser } = useGlobalContext()
  const [currentEditId, setCurrentEditId] = useState<number | null>(null)

  const [sportData, setSportData] = useState<SportData[]>([])
  const [courtData, setCourtData] = useState<CourtData[]>([])

  const [formData, setFormData] = useState({
    sportName: "",
    icon: "",
    sportStatus: "active",
    platformName: "",
    platformCount: "",
    startTime: null,
    endTime: null,
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

  const [editFormData, setEditFormData] = useState<{
    sportName: string;
    icon: string;
    sportStatus: string;
    platformName: string;
    platformCount: string;
    startTime: Date | null;
    endTime: Date | null;
    peakStartTime: Date | null;
    peakEndTime: Date | null;
    regularFee: string;
    peakFee: string;
    days: {
      Mon: boolean;
      Tue: boolean;
      Wed: boolean;
      Thu: boolean;
      Fri: boolean;
      Sat: boolean;
      Sun: boolean;
    };
  }>({
    sportName: "",
    icon: "",
    sportStatus: "active",
    platformName: "",
    platformCount: "",
    startTime: null,
    endTime: null,
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
        .select("sports_management")
        .eq("store_admin", currentUser?.email)
        .single()

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
          peakHours: item.peakHours || { start: null, end: null },
          fees: item.fees || { regular: 0, peak: 0 },
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

  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData((prev) => ({
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

  const handleEditDayToggle = (day: string) => {
    setEditFormData((prev) => ({
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
      const platformCount = parseInt(formData.platformCount) || 1
      for (let i = 1; i <= platformCount; i++) {
        courts.push(`${formData.platformName} ${i}`)
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
        peakHours: {
          start: formData.peakStartTime ? dayjs(formData.peakStartTime).format("HH:mm") : null,
          end: formData.peakEndTime ? dayjs(formData.peakEndTime).format("HH:mm") : null,
        },
        days: formData.days,
        platform_count: platformCount,
        fees: {
          regular: parseFloat(formData.regularFee) || 0,
          peak: parseFloat(formData.peakFee) || 0,
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

  const handleEditSave = async () => {
    if (currentEditId === null) return

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

      const updatedSportsData = data.sports_management.map((sport: any) => {
        if (sport.id === currentEditId) {
          return {
            ...sport,
            icon: editFormData.icon,
            sport_name: editFormData.sportName,
            status: editFormData.sportStatus,
            timing: {
              start: editFormData.startTime ? dayjs(editFormData.startTime).format("HH:mm") : null,
              end: editFormData.endTime ? dayjs(editFormData.endTime).format("HH:mm") : null,
            },
            peakHours: {
              start: editFormData.peakStartTime ? dayjs(editFormData.peakStartTime).format("HH:mm") : null,
              end: editFormData.peakEndTime ? dayjs(editFormData.peakEndTime).format("HH:mm") : null,
            },
            days: editFormData.days,
            fees: {
              regular: parseFloat(editFormData.regularFee) || 0,
              peak: parseFloat(editFormData.peakFee) || 0,
            },
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

      setOpenEdit(false)
      fetchSportsData()
    } catch (error) {
      console.error("Error updating sport data:", error)
    }
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

  const handleEdit = (id: number) => {
    const sportToEdit = sportData.find((sport) => sport.id === id)
    if (!sportToEdit) return

    setCurrentEditId(id)
    setEditFormData({
      sportName: sportToEdit.sportName,
      icon: sportToEdit.icon,
      sportStatus: sportToEdit.status,
      platformName: sportToEdit.courts[0]?.replace(/\d+$/, "") || "",
      platformCount: sportToEdit.platform_count.toString(),
      startTime: sportToEdit.timing.start ? dayjs(sportToEdit.timing.start, "HH:mm").toDate() : null,
      endTime: sportToEdit.timing.end ? dayjs(sportToEdit.timing.end, "HH:mm").toDate() : null,
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

    const courts = sportToEdit.courts.map((court, index) => ({
      name: court,
      timing: {
        start: sportToEdit.timing.start || "00:00",
        end: sportToEdit.timing.end || "00:00",
      },
      peakHours: {
        start: sportToEdit.peakHours?.start || "00:00",
        end: sportToEdit.peakHours?.end || "00:00",
      },
      fee: sportToEdit.fees?.regular || 0,
      peakFee: sportToEdit.fees?.peak || 0,
      availability: true,
    }))

    setCourtData(courts)
    setOpenEdit(true)
  }

  const handleCourtUpdate = (index: number, field: string, value: any) => {
    setCourtData((prev) => {
      const newData = [...prev]
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        newData[index] = {
          ...newData[index],
          [parent]: {
            ...(typeof newData[index][parent as keyof CourtData] === "object" && newData[index][parent as keyof CourtData] !== null
              ? (newData[index][parent as keyof CourtData] as object)
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

  const getRowStyle = (availability: boolean) => {
    return availability ? {} : { color: "#9ca3af" }
  }

  const getAvailablePlatforms = (sport: SportData) => {
    return sport.availability ? sport.platform_count : 0
  }

  const getUnavailablePlatforms = (sport: SportData) => {
    return sport.availability ? 0 : sport.platform_count
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
          <SheetContent className="bg-white" style={{ maxWidth: "600px" }}>
            <SheetHeader className="">
              <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">New Sport</SheetTitle>
            </SheetHeader>
            <SheetDescription>
              <div className="w-full space-y-4 pt-4">
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
                        use12Hours
                        format="h:mm A"
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("startTime", time)}
                      />
                    </div>

                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">To</Label>
                      <TimePicker
                        value={formData.endTime}
                        use12Hours
                        format="h:mm A"
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("endTime", time)}
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
                        use12Hours
                        format="h:mm A"
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleInputChange("peakStartTime", time)}
                      />
                    </div>

                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">To</Label>
                      <TimePicker
                        value={formData.peakEndTime}
                        use12Hours
                        format="h:mm A"
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
                      step="0.01"
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
                      step="0.01"
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

                <div className="flex justify-start gap-2 absolute bottom-0 bg-white w-full">
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

        {/* Edit Sheet with scrollable content */}
        <Sheet open={openEdit} onOpenChange={setOpenEdit}>
          <SheetContent className="bg-white" style={{ width: "1200px", maxWidth: "100vw", height: "100vh", overflowY: "auto" }}>
            <SheetHeader className="">
              <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase">Edit Sport</SheetTitle>
            </SheetHeader>
            <SheetDescription>
              <div className="w-full space-y-4 pt-4 pb-32">
                <div className="flex gap-4">
                  <div className="w-full space-y-2">
                    <Label>Sport Name</Label>
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
                    <Label>Icon</Label>
                    <Select
                      value={editFormData.icon}
                      onValueChange={(value) => handleEditInputChange("icon", value)}
                    >
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

                <div className="flex gap-4">
                  <div className="w-full space-y-2">
                    <Label>Platform Name</Label>
                    <input
                      type="text"
                      placeholder="Court, Turf, Class, Room"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={editFormData.platformName}
                      onChange={(e) => handleEditInputChange("platformName", e.target.value)}
                      disabled
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <Label>No. of Platform</Label>
                    <input
                      type="number"
                      placeholder="20"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={editFormData.platformCount}
                      onChange={(e) => handleEditInputChange("platformCount", e.target.value)}
                      min={1}
                      disabled
                    />
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Platform Timing</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">From</Label>
                      <TimePicker
                        value={editFormData.startTime ? dayjs(editFormData.startTime) : null}
                        use12Hours
                        format="h:mm A"
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleEditInputChange("startTime", time)}
                      />
                    </div>

                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">To</Label>
                      <TimePicker
                        value={editFormData.endTime ? dayjs(editFormData.endTime) : null}
                        use12Hours
                        format="h:mm A"
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleEditInputChange("endTime", time)}
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
                        value={editFormData.peakStartTime ? dayjs(editFormData.peakStartTime) : null}
                        use12Hours
                        format="h:mm A"
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleEditInputChange("peakStartTime", time)}
                      />
                    </div>

                    <div className="w-full space-y-1.5">
                      <Label className="text-sm text-gray-600">To</Label>
                      <TimePicker
                        value={editFormData.peakEndTime ? dayjs(editFormData.peakEndTime) : null}
                        use12Hours
                        format="h:mm A"
                        className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                        onChange={(time) => handleEditInputChange("peakEndTime", time)}
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
                      value={editFormData.regularFee}
                      onChange={(e) => handleEditInputChange("regularFee", e.target.value)}
                      min={0}
                      step="0.01"
                    />
                  </div>

                  <div className="w-full space-y-2">
                    <Label>Peak Fee</Label>
                    <input
                      type="number"
                      placeholder="15.99"
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                      value={editFormData.peakFee}
                      onChange={(e) => handleEditInputChange("peakFee", e.target.value)}
                      min={0}
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <Label>Active Days</Label>
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

                {/* Scrollable Court Table */}
                <div className="w-full border border-zinc-200 rounded-[8px] bg-white text-sm my-6">
                  <Table 
                    data={courtData} 
                    autoHeight 
                    className="rounded-[8px]"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                    headerHeight={40}
                    rowHeight={60}
                  >
                    <Column width={70} align="center">
                      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>S.NO</HeaderCell>
                      <Cell>
                        {(rowData: RowDataType, index?: number) => (
                          <div>{index !== undefined ? index + 1 : ""}</div>
                        )}
                      </Cell>
                    </Column>

                    <Column width={200} align="center">
                      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>COURT NAME</HeaderCell>
                      <Cell>
                        {(rowData: RowDataType) => (
                          <div>{rowData.name}</div>
                        )}
                      </Cell>
                    </Column>

                    <Column flexGrow={1} align="center">
                      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>TIMING</HeaderCell>
                      <Cell>
                        {(rowData: RowDataType, index?: number) => (
                          <div className="flex items-center gap-2">
                            <TimePicker
                              value={dayjs(rowData.timing.start, "HH:mm")}
                              format="HH:mm"
                              onChange={(time) =>
                                index !== undefined &&
                                handleCourtUpdate(index, "timing.start", time ? time.format("HH:mm") : "00:00")
                              }
                              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                            />
                            <span>-</span>
                            <TimePicker
                              value={dayjs(rowData.timing.end, "HH:mm")}
                              format="HH:mm"
                              onChange={(time) =>
                                index !== undefined &&
                                handleCourtUpdate(index, "timing.end", time ? time.format("HH:mm") : "00:00")
                              }
                              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
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
                              value={dayjs(rowData.peakHours.start, "HH:mm")}
                              format="HH:mm"
                              onChange={(time) =>
                                index !== undefined &&
                                handleCourtUpdate(index, "peakHours.start", time ? time.format("HH:mm") : "00:00")
                              }
                              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                            />
                            <span>-</span>
                            <TimePicker
                              value={dayjs(rowData.peakHours.end, "HH:mm")}
                              format="HH:mm"
                              onChange={(time) =>
                                index !== undefined &&
                                handleCourtUpdate(index, "peakHours.end", time ? time.format("HH:mm") : "00:00")
                              }
                              className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                            />
                          </div>
                        )}
                      </Cell>
                    </Column>

                    <Column width={120} align="center">
                      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>FEE</HeaderCell>
                      <Cell>
                        {(rowData: RowDataType, index?: number) => (
                          <Input
                            type="number"
                            value={rowData.fee}
                            onChange={(e) => index !== undefined && handleCourtUpdate(index, "fee", parseFloat(e.target.value) || 0)}
                            className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
                          />
                        )}
                      </Cell>
                    </Column>

                    <Column width={120} align="center">
                      <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>PEAK FEE</HeaderCell>
                      <Cell>
                        {(rowData: RowDataType, index?: number) => (
                          <Input
                            type="number"
                            value={rowData.peakFee}
                            onChange={(e) => index !== undefined && handleCourtUpdate(index, "peakFee", parseFloat(e.target.value) || 0)}
                            className="w-full border border-zinc-300 rounded-md bg-gray-50 p-2 text-sm text-gray-700"
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
                              onCheckedChange={(checked) => index !== undefined && handleCourtUpdate(index, "availability", checked)}
                              className="data-[state=checked]:bg-teal-500"
                            />
                          </div>
                        )}
                      </Cell>
                    </Column>
                  </Table>
                </div>

                <div className="flex justify-start gap-2 fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-zinc-200">
                  <button
                    className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center"
                    onClick={handleEditSave}
                  >
                    Save Changes
                  </button>
                  <div
                    className="border border-border_color rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center cursor-pointer"
                    onClick={() => setOpenEdit(false)}
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
                <div style={getRowStyle((rowData as SportData).availability)}>
                  {rowData.platform_count}
                </div>
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
                <div className="flex justify-center gap-2">
                  <div onClick={() => handleEdit((rowData as SportData).id)}>
                    <Pencil size={16} className="text-gray-500 cursor-pointer" />
                  </div>
                  <Trash2
                    size={16}
                    className="text-red-500 cursor-pointer"
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