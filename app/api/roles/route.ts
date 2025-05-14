"use server"
import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.from("roles").select("name")

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { name } = await request.json()

  if (!name) {
    return NextResponse.json({ error: "Role name is required" }, { status: 400 })
  }

  // Check if role already exists
  const { data: existingRole } = await supabase.from("roles").select("name").ilike("name", name).maybeSingle()

  if (existingRole) {
    return NextResponse.json({ message: "Role already exists", role: existingRole })
  }

  // Add new role
  const { data, error } = await supabase.from("roles").insert([{ name }]).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data[0])
}
