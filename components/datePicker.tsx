"use client"

import type { DatePickerProps } from "antd"
import { DatePicker } from "antd"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone" // Import timezone plugin
import utc from "dayjs/plugin/utc" // Import UTC plugin
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { useGlobalContext } from "@/context/store"

dayjs.extend(utc)
dayjs.extend(timezone)

const DatePickerComponent = ({ value, onChange, ...props }: DatePickerProps) => {
  const supabase = createClient()
  const { user: currentUser } = useGlobalContext()
  const [dateFormat, setDateFormat] = useState<string>("MM/DD/YYYY")
  const [timeZone, setTimeZone] = useState<string>("Australia/Melbourne")

  async function fetchData() {
    try {
      const { data: company } = await supabase
        .from("companies")
        .select("*")
        .eq("store_admin", currentUser?.email)
        .single()

      if (company) {
        setDateFormat(company.date_format || "MM/DD/YYYY")
        setTimeZone(company.timezone || "Australia/Melbourne")
      }
    } catch (error) {
      console.error("Error fetching company data:", error)
    }
  }

  useEffect(() => {
    if (currentUser?.email) {
      fetchData()
    }
  }, [currentUser?.email])

  // Safely parse the date value
  const parseDate = (dateValue: any) => {
    if (!dateValue) return null

    try {
      // Check if it's already a dayjs object
      if (dayjs.isDayjs(dateValue)) return dateValue

      // Try to parse the date string
      const parsedDate = dayjs(dateValue)

      // Validate the parsed date
      if (!parsedDate.isValid()) return null

      return parsedDate
    } catch (error) {
      console.error("Error parsing date:", error)
      return null
    }
  }

  return (
    <DatePicker
      value={parseDate(value)}
      onChange={onChange}
      className={`w-full custom_date_picker ${props.className || ""}`}
      needConfirm={false}
      format={dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY"}
      {...props}
    />
  )
}

export default DatePickerComponent
