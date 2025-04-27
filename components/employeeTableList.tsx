// "use client"

// import { useState } from "react"
// import { Table, Column, HeaderCell, Cell } from "rsuite-table"
// import { Button } from "@/components/ui/button"
// import { Pencil, Trash2 } from "lucide-react"
// import "rsuite-table/dist/css/rsuite-table.css"

// // You can replace this with your actual data fetching logic
// const employees = [
//   {
//     id: "#0056",
//     name: "Shiji Kumaran",
//     mobile: "+61 0000 0000",
//     email: "shiji@paarthernaddyclub.com.au",
//     role: "Admin",
//     pin: "1627",
//   },
//   {
//     id: "#0087",
//     name: "Pugazhenthi",
//     mobile: "+61 0000 0000",
//     email: "pugazh@paarthernaddyclub.com.au",
//     role: "Manager",
//     pin: "8890",
//   },
//   {
//     id: "#0034",
//     name: "Prasanth Sekar",
//     mobile: "+61 0000 0000",
//     email: "prasanth@paarthernaddyclub.com.au",
//     role: "Booking Staff",
//     pin: "6374",
//   },
// ]

// const ActionCell = ({ rowData, ...props }: { rowData: { id: string; name: string; mobile: string; email: string; role: string; pin: string } }) => (
//   <Cell {...props} style={{ padding: "6px" }}>
//     <div className="flex justify-end gap-2">
//       <Button variant="ghost" size="icon" className="h-8 w-8">
//         <Pencil className="h-4 w-4" />
//       </Button>
//       <Button variant="ghost" size="icon" className="h-8 w-8">
//         <Trash2 className="h-4 w-4" />
//       </Button>
//     </div>
//   </Cell>
// )

// export function EmployeeListTable() {
//   const [loading, setLoading] = useState(false)
//   const [sortColumn, setSortColumn] = useState()
//   const [sortType, setSortType] = useState()
//   const [data, setData] = useState(employees)

// interface Employee {
//     id: string
//     name: string
//     mobile: string
//     email: string
//     role: string
//     pin: string
// }

// type SortType = "asc" | "desc" | undefined

// const handleSortColumn = (sortColumn: keyof Employee, sortType: SortType) => {
//     setLoading(true)

//     setTimeout(() => {
//         setLoading(false)
//         setSortColumn(sortColumn)
//         setSortType(sortType)

//         if (sortColumn && sortType) {
//             const sortedData = [...data].sort((a, b) => {
//                 const valueA = a[sortColumn]
//                 const valueB = b[sortColumn]

//                 if (typeof valueA === "string" && typeof valueB === "string") {
//                     return sortType === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
//                 }

//                 return sortType === "asc" ? (valueA as number) - (valueB as number) : (valueB as number) - (valueA as number)
//             })

//             setData(sortedData)
//         }
//     }, 500)
// }

//   return (
//     <div className="border rounded-md">
//       <Table
//         height={400}
//         data={data}
//         sortColumn={sortColumn}
//         sortType={sortType}
//         onSortColumn={handleSortColumn}
//         loading={loading}
//         bordered
//         cellBordered
//         autoHeight
//         hover
//         wordWrap
//         className="w-full"
//         loadAnimation
//         renderEmpty={() => <div className="p-4 text-center">No data found</div>}
//       >
//         <Column width={100} sortable>
//           <HeaderCell>EMP ID</HeaderCell>
//           <Cell dataKey="id" />
//         </Column>

//         <Column width={180} sortable>
//           <HeaderCell>EMPLOYEE NAME</HeaderCell>
//           <Cell dataKey="name" />
//         </Column>

//         <Column width={150} sortable>
//           <HeaderCell>MOBILE NO.</HeaderCell>
//           <Cell dataKey="mobile" />
//         </Column>

//         <Column width={250} sortable>
//           <HeaderCell>EMAIL</HeaderCell>
//           <Cell dataKey="email" />
//         </Column>

//         <Column width={150} sortable>
//           <HeaderCell>ROLE</HeaderCell>
//           <Cell dataKey="role" />
//         </Column>

//         <Column width={100} sortable>
//           <HeaderCell>PIN</HeaderCell>
//           <Cell dataKey="pin" />
//         </Column>

//         <Column width={100} fixed="right">
//           <HeaderCell>ACTION</HeaderCell>
//           <ActionCell />
//         </Column>
//       </Table>
//     </div>
//   )
// }
