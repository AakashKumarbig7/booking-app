import type { DatePickerProps } from 'antd';
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone'; // Import timezone plugin
import utc from 'dayjs/plugin/utc'; // Import UTC plugin
import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import { useGlobalContext } from '@/context/store';

dayjs.extend(utc);
dayjs.extend(timezone);

const DatePickerComponent = ({ value, onChange }: DatePickerProps) => {
   const supabase = createClient();
   const { user: currentUser } = useGlobalContext();
   const [loading, setLoading] = useState(true);
   const [dateFormat, setDateFormat] = useState<string>("");
   const [timeZone, setTimeZone] = useState<string>("");

  async function fetchData() {
    // const { data: user } = await supabase.auth.getUser();
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("store_admin", currentUser?.email)
      .single();
    // setUser(user.user);
    if (company) {
      setDateFormat(company.date_format);
      setTimeZone(company.timezone);
      // setData(company.store_department);
      // setOptions(company.store_locations);
    }
    console.log("company", company);
  }

  useEffect(() => {
      // if (typeof window !== "undefined") {
      //   const sessionData = sessionStorage.getItem("storeState");
      //   if (sessionData) {
      //     const parsedData = JSON.parse(sessionData);
      //     if (parsedData.company === null) {
      //       fetchData().then(() => {
      //         setLoading(false);
      //       });
      //     } else {
      //       setDateFormat(parsedData.company.date_format);
      //       setTimeZone(parsedData.company.timezone);
      //       setLoading(false);
      //     }
      //   }
      // }
      fetchData().then(() => {
        setLoading(false);
      });
    }, []);
  return (
    // <Space direction="vertical" style={{ width: '100%' }}>
      <DatePicker
        value={value ? dayjs(value).locale('en').tz(timeZone || "Australia/Melbourne", true) : null}
        onChange={onChange}
        className="w-full custom_date_picker"
        needConfirm={false}
        format={dateFormat === "dd/MMM/yyyy" ? "DD/MM/YYYY" : "MM/DD/YYYY"}
      />
    // </Space>
  );
};

export default DatePickerComponent;