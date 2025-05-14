// import { TimePicker } from 'antd';
// import { useEffect, useState } from 'react';
// import dayjs from "dayjs";
// import timezone from 'dayjs/plugin/timezone'; // Import timezone plugin
// import utc from 'dayjs/plugin/utc'; // Import UTC plugin

// dayjs.extend(utc);
// dayjs.extend(timezone);

// export const Time = (time: any, onChange: any) => {
//   const [timeFormat, setTimeFormat] = useState<string>("12 hours");
//   const [timeZone, setTimeZone] = useState<string>("Australia/Melbourne");
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedState = sessionStorage.getItem("storeState");
//       if (storedState) {
//         const parsedState = JSON.parse(storedState);
//         setTimeFormat(parsedState?.timeFormat || "12 hours");
//         setTimeZone(parsedState?.timeZone || "Australia/Melbourne");
//       }
//     }
//   }, []);
//   return (
//     <TimePicker
//     value={time ? dayjs(time).locale('en').tz(timeZone, true) : null} 
//       onChange={onChange}
//       use12Hours={timeFormat === "12 hours"} 
//       format={timeFormat === "12 hours" ? "h:mm a" : "HH:mm"} 
//       className="w-full"
//       needConfirm={false}
//     />

//   );
// };