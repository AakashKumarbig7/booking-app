"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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

interface EmployeeFormProps {
  formData: Employee
  handleInputChange: (id: string, value: string) => void
  isEdit?: boolean
}

const EmployeeForm = ({ formData, handleInputChange, isEdit = false }: EmployeeFormProps) => {
  return (
    <div className="pt-2 px-3 overflow-y-auto flex-1 pb-4">
      {/* Each row */}
      <div className="w-full flex flex-row justify-between gap-2">
        <div className="space-y-2 w-full">
          <Label htmlFor="emp_id">Employee ID</Label>
          <Input
            id="emp_id"
            placeholder="Employee ID"
            value={formData.emp_id || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="password">Pin</Label>
          <Input
            id="password"
            type="number"
            placeholder="123456"
            value={formData.password || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
      </div>

      <div className="w-full flex flex-row justify-between gap-2 mt-3">
        <div className="space-y-2 w-full">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            id="first_name"
            placeholder="First Name"
            value={formData.first_name || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            placeholder="Last Name"
            value={formData.last_name || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
      </div>

      {/* Email & Mobile */}
      <div className="w-full flex flex-row justify-between gap-2 mt-3">
        <div className="space-y-2 w-full">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Email"
            value={formData.email || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            placeholder="000 000 000"
            value={formData.mobile || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
      </div>

      {/* Joining Date, Designation, Blood Group */}
      <div className="w-full flex flex-row justify-between gap-2 mt-3">
        <div className="space-y-2 w-full">
          <Label htmlFor="joined_date">Joining Date</Label>
          <Input
            id="joined_date"
            type="date"
            value={formData.joined_date || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="designation">Designation</Label>
          <Input
            id="designation"
            placeholder="Designation"
            value={formData.designation || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="blood_group">Blood Group</Label>
          <Input
            id="blood_group"
            placeholder="O +ve"
            value={formData.blood_group || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
      </div>

      {/* Address */}
      <div className="w-full justify-between gap-2 mt-3">
        <div className="w-full space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Address"
            value={formData.address || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
            className="h-[60px]"
          />
        </div>
      </div>

      {/* City & State */}
      <div className="w-full flex flex-row justify-between gap-2 mt-3">
        <div className="space-y-2 w-full">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            placeholder="Sydney"
            value={formData.city || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            placeholder="Melbourne"
            value={formData.state || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
      </div>

      {/* Country & ZipCode */}
      <div className="w-full flex flex-row justify-between gap-2 mt-3">
        <div className="space-y-2 w-full">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="Australia"
            value={formData.country || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="zipcode">ZipCode</Label>
          <Input
            id="zipcode"
            placeholder="5678"
            value={formData.zipcode || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
      </div>

      {/* Emergency Mobile */}
      <div className="w-full flex flex-row justify-between gap-2 mt-3">
        <div className="space-y-2 w-full">
          <Label htmlFor="emergency_mobile">Emergency Mobile</Label>
          <Input
            id="emergency_mobile"
            placeholder="000 000 000"
            value={formData.emergency_mobile || ""}
            onChange={(e) => handleInputChange(e.target.id, e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export default EmployeeForm
