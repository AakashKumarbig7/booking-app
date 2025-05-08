"use client"
import { FilePlus } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import EmployeeForm from "./empForm"
import EmployeeTable from "./empTable"
import toast, { Toaster } from "react-hot-toast"

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
  role: string // Made optional to match the expected type
  mobile_country_code?: string
}

// Define the validation interface
interface FormValidation {
  validateAllFields: () => boolean
  errors: {
    [key: string]: string
  }
}

const notify = (message: string, success: boolean) =>
  toast[success ? "success" : "error"](message, {
    style: {
      borderRadius: "10px",
      background: "#fff",
      color: "#000",
    },
    position: "top-right",
    duration: 3000,
  })

const EmployeeAdd = () => {
  const supabase = createClient()
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Form state
  const [formData, setFormData] = useState<Employee>({
    employee_id: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    joined_date: "",
    designation: "",
    blood_group: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    emergency_mobile: "",
    emp_id: "",
    role: "",
  })

  // Add a ref to access the form validation methods
  const formRef = useRef<FormValidation | null>(null)

  // Fetch employees on component mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    // Get current authenticated user
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user?.email) {
      setLoading(false)
      return
    }

    setCurrentUser(userData.user)

    // Fetch employees from the users table
    const { data, error } = await supabase.from("users").select("*")

    if (error) {
      console.error("Failed to fetch employees:", error.message)
    } else if (data) {
      setEmployees(data)
    }

    setLoading(false)
  }

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      employee_id: "",
      password: "",
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      joined_date: "",
      designation: "",
      blood_group: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
      emergency_mobile: "",
      emp_id: "",
      role: "",
    })
  }

  const handleAddEmployee = async () => {
    // Validate all fields before submission
    if (formRef.current && !formRef.current.validateAllFields()) {
      notify("Please fix the validation errors", false)
      return
    }

    // Format mobile numbers by removing spaces for database
    const formattedData = {
      ...formData,
      mobile: formData.mobile.replace(/\s+/g, ""),
      emergency_mobile: formData.emergency_mobile.replace(/\s+/g, ""),
    }

    // Insert new employee
    const { data, error } = await supabase.from("users").insert([formattedData]).select()

    if (error) {
      console.error("Failed to add employee:", error.message)
      notify("Failed to add employee: " + error.message, false)
    } else {
      console.log("Employee added successfully")
      notify("Employee added successfully", true)
      setOpenAdd(false)
      resetForm()
      fetchData()
    }
  }

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      ...employee,
      employee_id: employee.employee_id || "",
      password: employee.password || "",
      emp_id: employee.emp_id || "",
    })
    setOpenEdit(true)
  }

  const handleEditEmployee = async () => {
    console.log(selectedEmployee?.emp_id, "working")
    if (!selectedEmployee?.emp_id) return

    // Validate all fields before submission
    if (formRef.current && !formRef.current.validateAllFields()) {
      notify("Please fix the validation errors", false)
      return
    }

    // Format mobile numbers by removing spaces for database
    const formattedData = {
      ...formData,
      mobile: formData.mobile.replace(/\s+/g, ""),
      emergency_mobile: formData.emergency_mobile.replace(/\s+/g, ""),
    }

    // Update employee
    const { error } = await supabase
      .from("users")
      .update({
        employee_id: formattedData.employee_id,
        password: formattedData.password,
        first_name: formattedData.first_name,
        last_name: formattedData.last_name,
        email: formattedData.email,
        mobile: formattedData.mobile,
        joined_date: formattedData.joined_date,
        designation: formattedData.designation,
        blood_group: formattedData.blood_group,
        address: formattedData.address,
        city: formattedData.city,
        state: formattedData.state,
        country: formattedData.country,
        zipcode: formattedData.zipcode,
        emergency_mobile: formattedData.emergency_mobile,
        emp_id: formattedData.emp_id,
        role: formattedData.role,
      })
      .eq("emp_id", selectedEmployee.emp_id)

    if (error) {
      console.error("Failed to update employee:", error.message)
      notify("Failed to update employee: " + error.message, false)
    } else {
      console.log("Employee updated successfully")
      notify("Employee updated successfully", true)
      setOpenEdit(false)
      resetForm()
      fetchData()
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setOpenDelete(true)
  }

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee?.emp_id) return

    // Delete employee
    const { error } = await supabase.from("users").delete().eq("emp_id", selectedEmployee.emp_id)

    if (error) {
      console.error("Failed to delete employee:", error.message)
    } else {
      console.log("Employee deleted successfully")
      notify("Employee deleted successfully", true)

      setOpenDelete(false)
      fetchData()
    }
  }

  // Open add employee sheet and reset form
  const handleOpenAddSheet = () => {
    resetForm()
    setOpenAdd(true)
  }

  return (
    <>
      {/* Add Employee Sheet */}
      <Sheet open={openAdd} onOpenChange={setOpenAdd}>
        <div className="flex justify-end mb-4">
          <Toaster />
          <SheetTrigger asChild>
            <div
              className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] w-[130px] h-[40px] flex items-center justify-center text-xs cursor-pointer"
              onClick={handleOpenAddSheet}
            >
              <FilePlus size={14} className="mr-1" />
              <span>Add New Staff</span>
            </div>
          </SheetTrigger>
        </div>
        <SheetContent className="bg-white border-border_color flex flex-col" style={{ maxWidth: "600px" }}>
          <SheetHeader>
            <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase overflow-hidden">Add Employee</SheetTitle>
          </SheetHeader>

          <EmployeeForm formData={formData} handleInputChange={handleInputChange} ref={formRef} />

          {/* Footer: Save & Cancel */}
          <div className="mt-3 pt-3 flex  gap-2 px-3 pb-2">
            <Button variant="outline" onClick={() => setOpenAdd(false)}>
              Cancel
            </Button>
            <div
              className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] w-[100px] h-[40px] flex items-center justify-center text-xs cursor-pointer"
              onClick={handleAddEmployee}
            >
              Save
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Employee Sheet */}
      <Sheet open={openEdit} onOpenChange={setOpenEdit}>
        <SheetContent className="bg-white border-border_color flex flex-col" style={{ maxWidth: "600px" }}>
          <SheetHeader>
            <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase overflow-hidden">Edit Employee</SheetTitle>
          </SheetHeader>

          <EmployeeForm formData={formData} handleInputChange={handleInputChange} isEdit={true} ref={formRef} />

          {/* Footer: Save & Cancel */}
          <div className="mt-3 pt-3 flex  gap-2 px-3 pb-2">
            <Button className="bg-teal-800" onClick={handleEditEmployee}>
              Update
            </Button>

            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              {selectedEmployee && ` ${selectedEmployee.first_name} ${selectedEmployee.last_name}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEmployee} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Employee Table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />
    </>
  )
}

export default EmployeeAdd
