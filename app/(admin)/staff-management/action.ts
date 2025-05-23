"use server"

import { createClient } from "@/utils/supabase/server"

export async function createUser1(email: string, password: string) {
  try {
    const supabase = await createClient()

    console.log("Creating user with email:", email)

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { status: "Active" },
      email_confirm: true,
    })

    console.log("Auth response data:", authData)

    if (authError) {
      console.error("Error during create user: ", authError)
      return { error: authError }
    }

    return { data: authData }
  } catch (error) {
    console.error("Unexpected error in createUser1:", error)
    return { error: { message: "Unexpected error occurred" } }
  }
}

export async function updateMetadata(status: string, id: string) {
  console.log("user status ", status, id)
  const supabase = await createClient()

  const { data: clientEmail, error: clientError } = await supabase
    .from("users")
    .select("email, userId")
    .eq("id", id)
    .single()
  if (clientError) {
    console.error("Error during update metadata 1: ", clientError.message)
    return { error: clientError.message }
  }
  console.log("clientEmail ", clientEmail.email, clientEmail.userId)

  const { data, error } = await supabase.auth.admin.updateUserById(clientEmail.userId, {
    user_metadata: { status: status },
  })
  console.log("meta data ", data)
  if (error) {
    console.error("Error during update metadata 2: ", error.message)
    return { error: error.message }
  }
  console.log("Metadata update successful:", data)
  return { success: true, data }
}
