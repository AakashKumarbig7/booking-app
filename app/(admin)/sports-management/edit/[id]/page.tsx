"use client"

import React, { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TimePicker } from "antd"
import { Switch } from "@/components/ui/switch"
import { Trash2 } from "lucide-react"
import { Table } from "rsuite"
import type { RowDataType } from "rsuite/esm/Table"
import dayjs from "dayjs"
import { useGlobalContext } from "@/context/store"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

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
  const [courtData, setCourtData] = useState<CourtData[]>([])
  const [timeFormat, setTimeFormat] = useState("12 hours")
  const [editFormData, setEditFormData] = useState<{
    sportName: string
    icon: string
    sportStatus: string
    platformName: string
    platformCount: string
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

          // Find the sport to edit
          const sportToEdit = transformedData.find((sport: any) => sport.id === sportId)
          if (sportToEdit) {
            setEditFormData({
              sportName: sportToEdit.sportName,
              icon: sportToEdit.icon,
              sportStatus: sportToEdit.status,
              platformName: sportToEdit.courts[0]?.replace(/\d+$/, "") || "",
              platformCount: sportToEdit.platform_count.toString(),
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

            // Create court data with individual availability if it exists
            const courts = sportToEdit.courts.map((court:any) => {
              // Find court availability if it exists
              const courtAvailabilityData = sportToEdit.court_availability?.find((ca: any) => ca.name === court)

              return {
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
                availability: courtAvailabilityData ? courtAvailabilityData.availability : true,
              }
            })

            setCourtData(courts)
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

      // If updating non-peak hour timing, apply to all courts
      if (field === "timing.start" || field === "timing.end") {
        return newData.map((court) => ({
          ...court,
          timing: {
            ...court.timing,
            [field.split(".")[1]]: value,
          },
        }))
      }

      // Otherwise, update just the specific court
      if (field.includes(".")) {
        const [parent, child] = field.split(".")
        newData[index] = {
          ...newData[index],
          [parent]: {
            ...(typeof newData[index][parent as keyof CourtData] === "object" &&
            newData[index][parent as keyof CourtData] !== null
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

      // Calculate available courts count
      const availableCourtCount = courtData.filter((court) => court.availability).length

      const updatedSportsData = data.sports_management.map((sport: any) => {
        if (sport.id === sportId) {
          // Create updated courts array with availability information
          const updatedCourts = courtData.map((court) => court.name)

          return {
            ...sport,
            icon: editFormData.icon,
            sport_name: editFormData.sportName,
            status: editFormData.sportStatus,
            courts: updatedCourts,
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
            // Store court availability data
            court_availability: courtData.map((court) => ({
              name: court.name,
              availability: court.availability,
            })),
            // Update available court count
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

      router.push("/sports-management")
    } catch (error) {
      console.error("Error updating sport data:", error)
    }
  }

  return (
    <div className="w-full bg-white p-4">
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
              <Select value={editFormData.icon} onValueChange={(value) => handleEditInputChange("icon", value)}>
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
                  use12Hours={timeFormat === "12 hours"}
                  format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                  className="w-full !border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                  onChange={(time) => handleEditInputChange("startTime", time)}
                />
              </div>

              <div className="w-full space-y-1.5">
                <Label className="text-sm text-gray-600">To</Label>
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
            <Label className="text-sm font-medium text-gray-700">Non-Peak Hour Timing</Label>
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
                <Label className="text-sm text-gray-600">To</Label>
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
            <Label className="text-sm font-medium text-gray-700">Peak Hours</Label>
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
                <Label className="text-sm text-gray-600">To</Label>
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
              <Label>Regular Fee</Label>
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
              <Label>Peak Fee</Label>
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
              style={{  overflowY: "auto" }}
              headerHeight={40}
              rowHeight={60}
            >
              <Column width={70} align="center">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>S.NO</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => <div>{index !== undefined ? index + 1 : ""}</div>}
                </Cell>
              </Column>

              <Column width={100} align="center">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>COURT NAME</HeaderCell>
                <Cell>{(rowData: RowDataType) => <div>{rowData.name}</div>}</Cell>
              </Column>

              <Column flexGrow={1} align="center">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>NON PEAK HOUR</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => (
                    <div className="flex items-center gap-2">
                      <TimePicker
                        value={dayjs(rowData.timing.start, "HH:mm")}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                        onChange={(time) =>
                          index !== undefined &&
                          handleCourtUpdate(index, "timing.start", time ? time.format("HH:mm") : "00:00")
                        }
                        className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                      />
                      <span>-</span>
                      <TimePicker
                        value={dayjs(rowData.timing.end, "HH:mm")}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
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
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
                        onChange={(time) =>
                          index !== undefined &&
                          handleCourtUpdate(index, "peakHours.start", time ? time.format("HH:mm") : "00:00")
                        }
                        className="!border-zinc-300 !bg-gray-50 !text-sm !text-gray-700"
                      />
                      <span>-</span>
                      <TimePicker
                        value={dayjs(rowData.peakHours.end, "HH:mm")}
                        use12Hours={timeFormat === "12 hours"}
                        format={timeFormat === "12 hours" ? "h:mm A" : "HH:mm A"}
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

              <Column width={80} align="center">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>FEE</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => (
                    <Input
                      type="number"
                      value={rowData.fee}
                      onChange={(e) =>
                        index !== undefined && handleCourtUpdate(index, "fee", Number.parseFloat(e.target.value) || 0)
                      }
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-1 text-xs text-gray-700"
                    />
                  )}
                </Cell>
              </Column>

              <Column width={80} align="center">
                <HeaderCell style={{ backgroundColor: "#f2f2f2" }}>PEAK FEE</HeaderCell>
                <Cell>
                  {(rowData: RowDataType, index?: number) => (
                    <Input
                      type="number"
                      value={rowData.peakFee}
                      onChange={(e) =>
                        index !== undefined &&
                        handleCourtUpdate(index, "peakFee", Number.parseFloat(e.target.value) || 0)
                      }
                      className="w-full border border-zinc-300 rounded-md bg-gray-50 p-1 text-xs text-gray-700"
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
                        className="text-red-500 cursor-pointer"
                        onClick={() => {
                          if (index !== undefined) {
                            setCourtData((prev) => prev.filter((_, i) => i !== index))
                          }
                        }}
                      />
                    </div>
                  )}
                </Cell>
              </Column>
            </Table>
          </div>

          <div className="flex justify-start gap-2 mt-6">
            <button
              className="bg-teal-800 text-white rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center"
              onClick={handleEditSave}
            >
              Save Changes
            </button>
            <button
              className="border border-zinc-300 rounded-[12px] px-4 h-10 pr-5 text-xs flex items-center cursor-pointer"
              onClick={() => router.push("/sports-management")}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
