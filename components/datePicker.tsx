"use client"

import type { DatePickerProps } from "antd"
import { DatePicker } from "antd"
import dayjs from "dayjs"
import timezone from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { useEffect, useState } from "react"
import { supabase } from '@/utils/supabase/client';
import { useGlobalContext } from "@/context/store"

dayjs.extend(utc)
dayjs.extend(timezone)

const DatePickerComponent = ({ value, onChange, ...props }: DatePickerProps) => {
  // const supabase = createClient()
  const { user: currentUser } = useGlobalContext()
  const [dateFormat, setDateFormat] = useState<string>("DD/MM/YYYY") // Default to DD/MM/YYYY
  const [timeZone, setTimeZone] = useState<string>("Australia/Melbourne")

  async function fetchData() {
    try {
      const { data: company } = await supabase
        .from("companies")
        .select("date_format, timezone")
        .eq("store_admin", currentUser?.email)
        .single()

      if (company) {
        // Ensure we have a valid format, fallback to default if not
        const format = company.date_format === "MM/DD/YYYY" ? "MM/DD/YYYY" : "DD/MM/YYYY"
        setDateFormat(format)
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

  // Parse date value according to current format
  const parseDate = (dateValue: string | dayjs.Dayjs | null | undefined) => {
    if (!dateValue) return null
  
    try {
      if (dayjs.isDayjs(dateValue)) return dateValue
  
      let parsedDate = dayjs(dateValue, dateFormat)
      if (!parsedDate.isValid() && dateFormat === "DD/MM/YYYY") {
        parsedDate = dayjs(dateValue, "MM/DD/YYYY")
      } else if (!parsedDate.isValid() && dateFormat === "MM/DD/YYYY") {
        parsedDate = dayjs(dateValue, "DD/MM/YYYY")
      }
  
      return parsedDate.isValid() ? parsedDate : null
    } catch (error) {
      console.error("Error parsing date:", error)
      return null
    }
  }
  

  // Handle date changes and format output correctly
  const handleChange = (date: dayjs.Dayjs | null, dateString: string | string[]) => {
    if (onChange) {
      // Ensure dateString is a string before passing it
      const formattedDateString = Array.isArray(dateString) ? dateString.join(", ") : dateString
      if (date) {
        onChange(date, formattedDateString)
      }
    }
  }

  // Get the proper display format for the picker
  const getDisplayFormat = () => {
    return dateFormat === "MM/DD/YYYY" ? "MM/DD/YYYY" : "DD/MM/YYYY"
  }

  return (
    <>
    <div className="hidden">
<p>{timeZone}</p>
    </div>
    <DatePicker
      value={parseDate(value)}
      onChange={handleChange}
      className={`w-full custom_date_picker ${props.className || ""}`}
      needConfirm={false}
      format={getDisplayFormat()}
      {...props}
    />
    </>
  )
}

export default DatePickerComponent