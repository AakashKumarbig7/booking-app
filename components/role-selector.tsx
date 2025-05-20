"use client"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { cn } from "@/lib/utils"

export interface RoleSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [roles, setRoles] = useState<{ name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  const fetchRoles = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("name")
        .order("name", { ascending: true })

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

  const addNewRole = async (roleName: string) => {
    try {
      if (!roles.some((role) => role.name.toLowerCase() === roleName.toLowerCase())) {
        const { data: existingRole } = await supabase
          .from("roles")
          .select("name")
          .ilike("name", roleName)
          .maybeSingle()

        if (!existingRole) {
          const { error } = await supabase.rpc("add_role", { role_name: roleName })
          if (error) {
            console.error("Error adding new role:", error)
            return false
          }
          await fetchRoles()
          return true
        }
      }
    } catch (err) {
      console.error("Exception when adding role:", err)
      return false
    }
    return false
  }

  const handleSelect = async (selected: string) => {
    onChange(selected)
    if (
      selected &&
      !roles.some((role) => role.name.toLowerCase() === selected.toLowerCase())
    ) {
      await addNewRole(selected)
    }
    setInputValue("")
    setOpen(false)
  }

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-between", !value && "text-muted-foreground", error)}>
          {value || "Select or enter role"}
        </Button>
      </DialogTrigger>
      <DialogContent className="ml-40 overflow-hidden max-w-md">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or enter role..."
            value={inputValue}
            onValueChange={setInputValue}
            disabled={isLoading}
          />
          <CommandEmpty>
            {inputValue ? (
              <div
                className="p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground text-sm"
                onClick={() => handleSelect(inputValue)}
              >
                Use "{inputValue}"
              </div>
            ) : (
              "No roles found."
            )}
          </CommandEmpty>
          <CommandGroup>
            {filteredRoles.map((role) => (
              <CommandItem
                key={role.name}
                onSelect={() => handleSelect(role.name)}
              >
                <Check
                  className={cn("mr-2 h-4 w-4", value === role.name ? "opacity-100" : "opacity-0")}
                />
                {role.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
