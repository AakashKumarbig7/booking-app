"use client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DatePickerComponent from "./datePicker"
import dayjs from "dayjs"
import { forwardRef, useImperativeHandle, useState } from "react"
import RoleSelector from "@/components/role-selector";

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
  mobile_country_code?: string
  emergency_mobile_country_code?: string
  role: string
}

interface EmployeeFormProps {
  formData: Employee
  handleInputChange: (id: string, value: string) => void
  isEdit?: boolean
}

interface ValidationErrors {
  [key: string]: string
}
const COUNTRY_CODES = [
  { code: "+61", name: "Australia", maxLength: 9 },
  { code: "+91", name: "India", maxLength: 10 },
  { code: "+1", name: "USA/Canada", maxLength: 10 },
  { code: "+44", name: "UK", maxLength: 10 },
  // Add more country codes as needed
];
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
          if (!value) {
            return "Mobile number is required"
          }
          const mobileCountryCode = formData.mobile_country_code || "+61";
          const countryData = COUNTRY_CODES.find(c => c.code === mobileCountryCode);
          if (countryData && value.length !== countryData.maxLength) {
            return `Mobile number must be ${countryData.maxLength} digits for ${countryData.name}`;
          }
          if (!value.match(/^\d+$/)) {
            return "Mobile number must contain only digits"
          }
          break
        case "emergency_mobile":
          if (!value) {
            return "Emergency mobile number is required"
          }
          const emergencyCountryCode = formData.emergency_mobile_country_code || "+61";
          const emergencyCountryData = COUNTRY_CODES.find(c => c.code === emergencyCountryCode);
          if (emergencyCountryData && value.length !== emergencyCountryData.maxLength) {
            return `Emergency mobile must be ${emergencyCountryData.maxLength} digits for ${emergencyCountryData.name}`;
          }
          if (!value.match(/^\d+$/)) {
            return "Emergency mobile must contain only digits"
          }
          break
        case "zipcode":
          if (!value) {
            return "zipcode is required"
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
        case "role":
          if (!value) {
            return "Role is required"
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
        // Skip validation for country code fields
        if (key === 'mobile_country_code' || key === 'emergency_mobile_country_code') continue;
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

    // Handle phone number input with validation
    const handlePhoneNumberChange = (field: 'mobile' | 'emergency_mobile', value: string) => {
      // Only allow numbers and limit length based on country code
      const countryCodeField = field === 'mobile' ? 'mobile_country_code' : 'emergency_mobile_country_code';
      const countryCode = formData[countryCodeField as keyof Employee] || "+61";
      const countryData = COUNTRY_CODES.find(c => c.code === countryCode);
      const maxLength = countryData?.maxLength || 10;
      
      if (value === '' || /^\d+$/.test(value)) {
        if (value.length <= maxLength) {
          handleInputChange(field, value);
          const error = validateField(field, value);
          if (error) {
            setErrors({ ...errors, [field]: error });
          } else {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
          }
        }
      }
    }
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
            <div className="flex gap-1">
              <select
                value={formData.mobile_country_code || "+61"}
                onChange={(e) => {
                  handleInputChange("mobile_country_code", e.target.value);
                  // Revalidate mobile number when country code changes
                  const error = validateField("mobile", formData.mobile || "");
                  if (error) {
                    setErrors({ ...errors, mobile: error });
                  } else {
                    const newErrors = { ...errors };
                    delete newErrors.mobile;
                    setErrors(newErrors);
                  }
                }}
                className="border rounded-md px-2 py-2 text-sm w-20"
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code}
                  </option>
                ))}
              </select>
              <Input
                id="mobile"
                placeholder="123456789"
                value={formData.mobile || ""}
                onChange={(e) => handlePhoneNumberChange("mobile", e.target.value)}
              />
            </div>
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
            <div className="flex gap-1">
              <select
                value={formData.emergency_mobile_country_code || "+61"}
                onChange={(e) => {
                  handleInputChange("emergency_mobile_country_code", e.target.value);
                  // Revalidate emergency mobile when country code changes
                  const error = validateField("emergency_mobile", formData.emergency_mobile || "");
                  if (error) {
                    setErrors({ ...errors, emergency_mobile: error });
                  } else {
                    const newErrors = { ...errors };
                    delete newErrors.emergency_mobile;
                    setErrors(newErrors);
                  }
                }}
                className="border rounded-md px-2 py-2 text-sm w-20"
              >
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code}
                  </option>
                ))}
              </select>
              <Input
                id="emergency_mobile"
                placeholder="123456789"
                value={formData.emergency_mobile || ""}
                onChange={(e) => handlePhoneNumberChange("emergency_mobile", e.target.value)}
              />
            </div>
            {errors.emergency_mobile && <p className="text-red-500 text-xs">{errors.emergency_mobile}</p>}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="role" className="text-gray-900 text-sm font-medium">
              Role
            </Label>
            <RoleSelector
              value={formData.role || ""}
              onChange={(value:any) => handleInputChange("role", value)}
              error={errors.role} 
            />
            {errors.role && <p className="text-red-500 text-xs">{errors.role}</p>}
          </div>
        </div>
      </div>
    )
  },
)

// Make sure this line is present and correct
EmployeeForm.displayName = "EmployeeForm"

export default EmployeeForm
