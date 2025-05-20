"use client"
import { FilePlus, Search } from "lucide-react"
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
import { createUser1 } from "@/app/(admin)/staff-management/action"

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
  role: string
  mobile_country_code?: string
  userId?: string // Added userId field to store the auth user ID
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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  // const [isSubmitting, setIsSubmitting] = useState(false)
  // const [debugInfo, setDebugInfo] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]) 
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEmployees(employees)
      return
    }

    const lowercasedSearch = searchTerm.toLowerCase()
    const filtered = employees.filter(
      (employee) =>
        employee.first_name?.toLowerCase().includes(lowercasedSearch) ||
        employee.last_name?.toLowerCase().includes(lowercasedSearch) ||
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(lowercasedSearch) ||
        employee.emp_id?.toLowerCase().includes(lowercasedSearch),
    )

    setFilteredEmployees(filtered)
  }, [searchTerm, employees])

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
    // Get current authenticated user
    const { data: userData } = await supabase.auth.getUser()

    if (!userData?.user?.email) {
      return
    }

    // Fetch employees from the users table
    const { data, error } = await supabase.from("users").select("*")

    if (error) {
      console.error("Failed to fetch employees:", error.message)
    } else if (data) {
      setEmployees(data)
    }
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
    // setDebugInfo("")
  }

  const handleAddEmployee = async () => {
    // Validate all fields before submission
    if (formRef.current && !formRef.current.validateAllFields()) {
      notify("Please fix the validation errors", false)
      return
    }

    // setIsSubmitting(true)
    // setDebugInfo("")

    try {
      // Format mobile numbers by removing spaces for database
      const formattedData = {
        ...formData,
        mobile: formData.mobile.replace(/\s+/g, ""),
        emergency_mobile: formData.emergency_mobile.replace(/\s+/g, ""),
      }

      // First create the auth user
      console.log("Creating auth user with email:", formattedData.email)
      const signUpResponse = await createUser1(formattedData.email, formattedData.password || "")

      // Debug: Log the full response
      console.log("Auth user creation response:", JSON.stringify(signUpResponse, null, 2))
      // setDebugInfo(`Auth Response: ${JSON.stringify(signUpResponse, null, 2)}`)

      if (signUpResponse?.error) {
        console.error("Failed to create auth user:", signUpResponse.error)
        notify("Failed to create user account: " + signUpResponse.error.message, false)
        // setIsSubmitting(false)
        return
      }

      // Check if we have a valid user object
      if (!signUpResponse?.data?.user) {
        console.error("Auth user creation returned no user")
        notify("Failed to create user account: No user returned", false)
        // setIsSubmitting(false)
        return
      }

      // Get the user ID from the auth response
      const userId = signUpResponse.data.user.id
      console.log("Auth user created with ID:", userId)

      if (!userId) {
        console.error("Auth user ID is null or undefined")
        notify("Failed to get user ID from auth response", false)
        // setIsSubmitting(false)
        return
      }

      // Insert new employee with the userId
      const { data, error } = await supabase
        .from("users")
        .insert({
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
          userId: userId, // Store the auth user ID
        })
        .select()

      if (error) {
        console.error("Failed to add employee:", error.message)
        notify("Failed to add employee: " + error.message, false)
      } else {
        console.log("Employee added successfully with data:", data)
        notify("Employee added successfully", true)
        setOpenAdd(false)
        resetForm()
        fetchData()
      }
    } catch (error) {
      console.error("Error in employee creation:", error)
      // setDebugInfo(`Error: ${JSON.stringify(error)}`)
      notify("An unexpected error occurred", false)
    } finally {
      // setIsSubmitting(false)
    }
  }

  const handleEditClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormData({
      ...employee,
      mobile: employee.mobile?.toString() || "",
      emergency_mobile: employee.emergency_mobile?.toString() || "",
      employee_id: employee.employee_id || "",
      password: employee.password || "",
      emp_id: employee.emp_id || "",
    })
    setOpenEdit(true)
  }

  const handleEditEmployee = async () => {
    console.log(selectedEmployee?.emp_id, "working")
    if (!selectedEmployee?.emp_id) return

    // setIsSubmitting(true)

    try {
      // Validate all fields before submission
      if (formRef.current && !formRef.current.validateAllFields()) {
        notify("Please fix the validation errors", false)
        // setIsSubmitting(false)
        return
      }

      // Format mobile numbers by removing spaces for database
      const formattedData = {
        ...formData,
        mobile: (formData.mobile || "").toString().replace(/\s+/g, ""),
        emergency_mobile: (formData.emergency_mobile || "").toString().replace(/\s+/g, ""),
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
    } catch (error) {
      console.error("Error in employee update:", error)
      notify("An unexpected error occurred", false)
    } finally {
      // setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setOpenDelete(true)
  }

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee?.emp_id) return

    // setIsSubmitting(true)

    try {
      // Delete employee
      const { error } = await supabase.from("users").delete().eq("emp_id", selectedEmployee.emp_id)

      if (error) {
        console.error("Failed to delete employee:", error.message)
        notify("Failed to delete employee: " + error.message, false)
      } else {
        console.log("Employee deleted successfully")
        notify("Employee deleted successfully", true)
        setOpenDelete(false)
        fetchData()
      }
    } catch (error) {
      console.error("Error in employee deletion:", error)
      notify("An unexpected error occurred", false)
    } finally {
      // setIsSubmitting(false)
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
        <div className="flex justify-between mb-4 pt-3">
          <Toaster />
          <div className="w-[300px]">
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
              <Search className="relative left-[280px] bottom-7 z-10 text-gray-500" size={16} />
          </div>
          
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

          {/* Debug Info */}
          {/* {debugInfo && (
            <div className="px-3 mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              <p className="font-semibold">Debug Info:</p>
              <pre>{debugInfo}</pre>
            </div>
          )} */}

          {/* Footer: Save & Cancel */}
          <div className="mt-3 pt-3 flex gap-2 px-3 pb-2">
            <Button
              className="bg-teal-800 hover:bg-teal-700 text-white rounded-[12px] w-[100px] h-[40px] flex items-center justify-center text-xs"
              onClick={handleAddEmployee}
              // disabled={isSubmitting}
            >
              {/* {isSubmitting ? "Saving..." : "Save"} */}
              Save
            </Button>
            <Button variant="outline" onClick={() => setOpenAdd(false)} 
            // disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Employee Sheet */}
      <Sheet open={openEdit} onOpenChange={setOpenEdit}>
        <SheetContent className="bg-white border-border_color flex flex-col" style={{ maxWidth: "600px" }}>
          <SheetHeader>
            <SheetTitle className="text-gray-600 text-sm -mt-1 uppercase overflow-hidden">Edit Employee</SheetTitle>
          </SheetHeader>

          <EmployeeForm formData={formData} handleInputChange={handleInputChange} ref={formRef} />

          {/* Footer: Save & Cancel */}
          <div className="mt-3 pt-3 flex gap-2 px-3 pb-2">
            <Button className="bg-teal-800 hover:bg-teal-700" onClick={handleEditEmployee} 
            // disabled={isSubmitting}
            >
              {/* {isSubmitting ? "Updating..." : "Update"} */}
              Update
            </Button>

            <Button variant="outline" onClick={() => setOpenEdit(false)} 
            // disabled={isSubmitting}
            >
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
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-red-600 hover:bg-red-700"
              // disabled={isSubmitting}
            >
              {/* {isSubmitting ? "Deleting..." : "Delete"} */}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Employee Table */}
      <EmployeeTable employees={filteredEmployees} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
    </>
  )
}

export default EmployeeAdd
