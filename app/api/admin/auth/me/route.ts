// Bismillah Ar-Rahman Ar-Roheem
// Get current admin user

import { NextResponse } from "next/server"
import { getAdminFromCookies } from "@/lib/admin-auth"

export async function GET() {
  try {
    const admin = await getAdminFromCookies()

    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({ user: admin })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
