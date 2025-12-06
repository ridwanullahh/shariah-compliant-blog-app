// Bismillah Ar-Rahman Ar-Roheem
// Admin Logout API Route

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { logoutAdmin } from "@/lib/admin-auth"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_session")?.value

    if (token) {
      logoutAdmin(token)
    }

    cookieStore.delete("admin_session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "An error occurred during logout" }, { status: 500 })
  }
}
