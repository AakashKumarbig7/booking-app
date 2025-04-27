"use client"
import { Edit2, SquarePen, Trash2 } from "lucide-react"
import { Table } from "rsuite"
import { Button } from "@/components/ui/button"

interface Employee {
  employee_id?: string
  email: string
  password?: string
  mobile: string
  designation: string
  blood_group: string
  address: string
  city: string
  country: string
  state: string
  joined_date: string
  emergency_mobile: string
  first_name: string
  last_name: string
  zipcode: string
  emp_id?: string
}

interface EmployeeTableProps {
  employees: Employee[]
  loading: boolean
  onEditClick: (employee: Employee) => void
  onDeleteClick: (employee: Employee) => void
}

const EmployeeTable = ({ employees, loading, onEditClick, onDeleteClick }: EmployeeTableProps) => {
  const { Column, HeaderCell, Cell } = Table

  return (
    <div className="w-full border border-border_color rounded-[8px] bg-white text-sm my-2">
      <Table
        data={employees}
        loading={loading}
        height={400}
        rowHeight={60}
        onRowClick={(rowData) => {
          console.log(rowData)
        }}
      >
        <Column width={100} align="center">
          <HeaderCell
            className="uppercase select-none text-left font-bold bg-[#f2f2f2]"
            style={{ backgroundColor: "#f2f2f2" }}
          >
            Emp ID
          </HeaderCell>
          <Cell dataKey="emp_id" />
        </Column>
        <Column width={150} align="center">
          <HeaderCell
            className="uppercase select-none text-left font-bold bg-[#f2f2f2]"
            style={{ backgroundColor: "#f2f2f2" }}
          >
            Employee Name
          </HeaderCell>
          <Cell>{(rowData: Employee) => `${rowData.first_name} ${rowData.last_name}`}</Cell>
        </Column>
        <Column flexGrow={1} align="center">
          <HeaderCell
            className="uppercase select-none text-left font-bold bg-[#f2f2f2]"
            style={{ backgroundColor: "#f2f2f2" }}
          >
            Email
          </HeaderCell>
          <Cell dataKey="email" />
        </Column>
        <Column width={120} align="center">
          <HeaderCell
            className="uppercase select-none text-left font-bold bg-[#f2f2f2]"
            style={{ backgroundColor: "#f2f2f2" }}
          >
            Mobile
          </HeaderCell>
          <Cell dataKey="mobile" />
        </Column>
        <Column width={120} align="center">
          <HeaderCell
            className="uppercase select-none text-left font-bold bg-[#f2f2f2]"
            style={{ backgroundColor: "#f2f2f2" }}
          >
            Designation
          </HeaderCell>
          <Cell dataKey="designation" />
        </Column>
        <Column width={80} align="center">
          <HeaderCell
            className="uppercase select-none text-left font-bold bg-[#f2f2f2]"
            style={{ backgroundColor: "#f2f2f2" }}
          >
            PiN
          </HeaderCell>
          <Cell dataKey="password" />
        </Column>
        <Column width={120} fixed="right">
          <HeaderCell className="uppercase text-center font-bold pl-2" style={{ backgroundColor: "#f2f2f2" }}>
            Action
          </HeaderCell>
          <Cell style={{ padding: "6px" }} className="text-center">
            {(rowData: Employee) => (
              <div className="flex justify-evenly align-middle items-center text-gray-00" >
                <div
                 
                  
                  className="items-center hover:text-blue-700 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditClick(rowData)
                  }}
                >
                 <SquarePen width={16} />
                </div>
                <div
                
                  
                  className=" items-center hover:text-red-700 "
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteClick(rowData)
                  }}
                >
                  <Trash2 size={16} />
                </div>
              </div>
            )}
          </Cell>
        </Column>
      </Table>
    </div>
  )
}

export default EmployeeTable
