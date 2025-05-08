"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"

export interface RoleSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [roles, setRoles] = useState<{ name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  // Fetch roles from the database
  const fetchRoles = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("roles").select("name").order("name", { ascending: true })
      if (error) {
        console.error("Error fetching roles:", error)
        return
      }
      setRoles(data || [])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  // Add a new role to the database using a server action
  const addNewRole = async (roleName: string) => {
    try {
      // Check if role already exists in our local state
      if (!roles.some((role) => role.name.toLowerCase() === roleName.toLowerCase())) {
        setIsLoading(true)
        
        // First check if it exists in the database (double-check)
        const { data: existingRole } = await supabase
          .from("roles")
          .select("name")
          .ilike("name", roleName)
          .maybeSingle()

        if (!existingRole) {
          // Use the rpc function to insert the role (bypassing RLS)
          const { data, error } = await supabase.rpc("add_role", { role_name: roleName })

          if (error) {
            console.error("Error adding new role:", error)
            return false
          }

          // Refresh the roles list after adding a new one
          await fetchRoles()
          return true
        } else {
          console.log("Role already exists in database:", existingRole)
        }
      }
    } catch (err) {
      console.error("Exception when adding role:", err)
      return false
    } finally {
      setIsLoading(false)
    }
    return false
  }

  const handleRoleSelect = async (roleName: string) => {
    // First update the form value
    onChange(roleName)

    // If this is a new role (typed by user), add it to the roles table
    if (roleName && !roles.some((role) => role.name.toLowerCase() === roleName.toLowerCase())) {
      await addNewRole(roleName)
    }

    setInputValue("")
    setIsSelectOpen(false)
  }

  return (
    <Popover open={isSelectOpen} onOpenChange={setIsSelectOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn("w-full justify-between", !value && "text-muted-foreground", error )}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : value || "Select or enter role"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <div className="p-1">
          <Input
            placeholder="Search or enter role..."
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
            }}
            className="mb-2"
            disabled={isLoading}
          />
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-2 text-sm text-center">Loading roles...</div>
            ) : (
              <>
                {roles
                  .filter((role) => role.name.toLowerCase().includes(inputValue.toLowerCase()))
                  .map((role) => (
                    <div
                      key={role.name}
                      className={cn(
                        "p-2 hover:bg-accent text-sm hover:text-accent-foreground cursor-pointer",
                        value === role.name && "bg-accent",
                      )}
                      onClick={() => handleRoleSelect(role.name)}
                    >
                      {role.name}
                    </div>
                  ))}
                {inputValue && !roles.some((role) => role.name.toLowerCase() === inputValue.toLowerCase()) && (
                  <div
                    className="p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                    onClick={() => handleRoleSelect(inputValue)}
                  >
                    Use "{inputValue}"
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}