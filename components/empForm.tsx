"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DatePickerComponent from "./datePicker"
import dayjs from "dayjs"
import { forwardRef, useImperativeHandle, useState } from "react"

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

interface ValidationErrors {
  [key: string]: string
}

const EmployeeForm = forwardRef<{ validateAllFields: () => boolean; errors: ValidationErrors }, EmployeeFormProps>(
  ({ formData, handleInputChange, isEdit = false }, ref) => {
    const [errors, setErrors] = useState<ValidationErrors>({})

    const validateField = (fieldId: string, value: string): string | undefined => {
      switch (fieldId) {
        case "email":
          if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return "Invalid email format"
          }
          break
        case "mobile":
          if (!value.match(/^\d{10}$/)) {
            return "Mobile number must be 10 digits"
          }
          break
        case "emergency_mobile":
          if (!value.match(/^\d{10}$/)) {
            return "Emergency mobile number must be 10 digits"
          }
          break
        case "zipcode":
          if (!value.match(/^\d{4}$/)) {
            return "Invalid zip code format. Use 5678"
          }
          break
        case "password":
          if (!value) {
            return "Pin is required"
          }
          if (!value.match(/^\d{6}$/)) {
            return "Pin must be 6 digits"
          }
          break
        case "emp_id":
          if (!value) {
            return "Employee ID is required"
          }
          break
        case "first_name":
          if (!value) {
            return "First Name is required"
          }
          break
        case "last_name":
          if (!value) {
            return "Last Name is required"
          }
          break
        case "designation":
          if (!value) {
            return "Designation is required"
          }
          break
        case "blood_group":
          if (!value) {
            return "Blood Group is required"
          }
          break
        case "address":
          if (!value) {
            return "Address is required"
          }
          break
        case "city":
          if (!value) {
            return "City is required"
          }
          break
        case "state":
          if (!value) {
            return "State is required"
          }
          break
        case "country":
          if (!value) {
            return "Country is required"
          }
          break
        default:
          return undefined
      }
      return undefined
    }

    const validateAllFields = (): boolean => {
      const newErrors: ValidationErrors = {}
      for (const key in formData) {
        const error = validateField(key, formData[key as keyof Employee] || "")
        if (error) {
          newErrors[key] = error
        }
      }
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      validateAllFields,
      errors,
    }))

    return (
      <div className="pt-2 px-3 overflow-y-auto flex-1 pb-4">
        {/* Each row */}
        <div className="w-full flex flex-row justify-between gap-2">
          <div className="space-y-2 w-full">
            <Label htmlFor="emp_id" className="text-gray-900 text-sm font-medium">
              Employee ID
            </Label>
            <Input
              id="emp_id"
              placeholder="Employee ID"
              value={formData.emp_id || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.emp_id && <p className="text-red-500 text-xs">{errors.emp_id}</p>}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="password" className="text-gray-900 text-sm font-medium">
              Pin
            </Label>
            <Input
              id="password"
              type="number"
              placeholder="123456"
              value={formData.password || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>
        </div>

        <div className="w-full flex flex-row justify-between gap-2 mt-3">
          <div className="space-y-2 w-full">
            <Label htmlFor="first_name" className="text-gray-900 text-sm font-medium">
              First Name
            </Label>
            <Input
              id="first_name"
              placeholder="First Name"
              value={formData.first_name || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="last_name" className="text-gray-900 text-sm font-medium">
              Last Name
            </Label>
            <Input
              id="last_name"
              placeholder="Last Name"
              value={formData.last_name || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name}</p>}
          </div>
        </div>

        {/* Email & Mobile */}
        <div className="w-full flex flex-row justify-between gap-2 mt-3">
          <div className="space-y-2 w-full">
            <Label htmlFor="email" className="text-gray-900 text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="mobile" className="text-gray-900 text-sm font-medium">
              Mobile
            </Label>
            <Input
              id="mobile"
              placeholder="0000000000"
              value={formData.mobile || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.mobile && <p className="text-red-500 text-xs">{errors.mobile}</p>}
          </div>
        </div>

        {/* Joining Date, Designation, Blood Group */}
        <div className="w-full flex flex-row justify-between gap-2 mt-3">
          <div className="space-y-2 w-full">
            <Label htmlFor="joined_date" className="text-gray-900 text-sm font-medium">
              Joining Date
            </Label>
            <DatePickerComponent
              id="joined_date"
              placeholder="Joining Date"
              value={formData.joined_date ? dayjs(formData.joined_date) : null}
              onChange={(date) => handleInputChange("joined_date", date?.toString() || "")}
            />
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="designation" className="text-gray-900 text-sm font-medium">
              Designation
            </Label>
            <Input
              id="designation"
              placeholder="Designation"
              value={formData.designation || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.designation && <p className="text-red-500 text-xs">{errors.designation}</p>}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="blood_group" className="text-gray-900 text-sm font-medium">
              Blood Group
            </Label>
            <Input
              id="blood_group"
              placeholder="O +ve"
              value={formData.blood_group || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.blood_group && <p className="text-red-500 text-xs">{errors.blood_group}</p>}
          </div>
        </div>

        {/* Address */}
        <div className="w-full justify-between gap-2 mt-3">
          <div className="w-full space-y-2">
            <Label htmlFor="address" className="text-gray-900 text-sm font-medium">
              Address
            </Label>
            <Input
              id="address"
              placeholder="Address"
              value={formData.address || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
              className="h-[60px]"
            />
            {errors.address && <p className="text-red-500 text-xs">{errors.address}</p>}
          </div>
        </div>

        {/* City & State */}
        <div className="w-full flex flex-row justify-between gap-2 mt-3">
          <div className="space-y-2 w-full">
            <Label htmlFor="city" className="text-gray-900 text-sm font-medium">
              City
            </Label>
            <Input
              id="city"
              placeholder="Sydney"
              value={formData.city || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.city && <p className="text-red-500 text-xs">{errors.city}</p>}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="state" className="text-gray-900 text-sm font-medium">
              State
            </Label>
            <Input
              id="state"
              placeholder="Melbourne"
              value={formData.state || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.state && <p className="text-red-500 text-xs">{errors.state}</p>}
          </div>
        </div>

        {/* Country & ZipCode */}
        <div className="w-full flex flex-row justify-between gap-2 mt-3">
          <div className="space-y-2 w-full">
            <Label htmlFor="country" className="text-gray-900 text-sm font-medium">
              Country
            </Label>
            <Input
              id="country"
              placeholder="Australia"
              value={formData.country || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.country && <p className="text-red-500 text-xs">{errors.country}</p>}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="zipcode" className="text-gray-900 text-sm font-medium">
              ZipCode
            </Label>
            <Input
              id="zipcode"
              placeholder="5678"
              value={formData.zipcode || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.zipcode && <p className="text-red-500 text-xs">{errors.zipcode}</p>}
          </div>
        </div>

        {/* Emergency Mobile */}
        <div className="w-full flex flex-row justify-between gap-2 mt-3">
          <div className="space-y-2 w-full">
            <Label htmlFor="emergency_mobile" className="text-gray-900 text-sm font-medium">
              Emergency Mobile
            </Label>
            <Input
              id="emergency_mobile"
              placeholder="0000000000"
              value={formData.emergency_mobile || ""}
              onChange={(e) => {
                handleInputChange(e.target.id, e.target.value)
                const error = validateField(e.target.id, e.target.value)
                if (error) {
                  setErrors({ ...errors, [e.target.id]: error })
                } else {
                  const newErrors = { ...errors }
                  delete newErrors[e.target.id]
                  setErrors(newErrors)
                }
              }}
            />
            {errors.emergency_mobile && <p className="text-red-500 text-xs">{errors.emergency_mobile}</p>}
          </div>
        </div>
      </div>
    )
  },
)

// Make sure this line is present and correct
EmployeeForm.displayName = "EmployeeForm"

export default EmployeeForm
