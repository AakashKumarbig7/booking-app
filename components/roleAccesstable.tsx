// "use client"

// import { useState } from "react"
// import { Table, Column, HeaderCell, Cell } from "rsuite-table"
// import { Button } from "@/components/ui/button"
// import { Pencil, Trash2 } from "lucide-react"
// import "rsuite-table/dist/css/rsuite-table.css"

// // You can replace this with your actual data fetching logic
// const roles = [
//   { level: "Level 01", role: "Admin", permissions: "Full Access" },
//   { level: "Level 02", role: "Manager", permissions: "30 default permissions" },
//   { level: "Level 03", role: "Ass. Manager", permissions: "20 default permissions" },
//   { level: "Level 04", role: "Employee", permissions: "10 default permissions" },
// ]

// const ActionCell = ({ rowData, ...props }) => (
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

// export function RolesAccessTable() {
//   const [loading, setLoading] = useState(false)
//   const [sortColumn, setSortColumn] = useState()
//   const [sortType, setSortType] = useState()
//   const [data, setData] = useState(roles)

//   const handleSortColumn = (sortColumn, sortType) => {
//     setLoading(true)

//     setTimeout(() => {
//       setLoading(false)
//       setSortColumn(sortColumn)
//       setSortType(sortType)

//       if (sortColumn && sortType) {
//         const sortedData = [...data].sort((a, b) => {
//           const valueA = a[sortColumn]
//           const valueB = b[sortColumn]

//           if (typeof valueA === "string" && typeof valueB === "string") {
//             return sortType === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
//           }

//           return sortType === "asc" ? valueA - valueB : valueB - valueA
//         })

//         setData(sortedData)
//       }
//     }, 500)
//   }

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
//         <Column width={150} sortable>
//           <HeaderCell>LEVEL</HeaderCell>
//           <Cell dataKey="level" />
//         </Column>

//         <Column width={200} sortable>
//           <HeaderCell>ROLES</HeaderCell>
//           <Cell dataKey="role" />
//         </Column>

//         <Column width={300} sortable>
//           <HeaderCell>PERMISSIONS</HeaderCell>
//           <Cell dataKey="permissions" />
//         </Column>

//         <Column width={100} fixed="right">
//           <HeaderCell>ACTION</HeaderCell>
//           <ActionCell />
//         </Column>
//       </Table>
//     </div>
//   )
// }
