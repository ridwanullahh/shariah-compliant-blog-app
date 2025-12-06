// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { validateAdminSession } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const session = await validateAdminSession(request)
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDB()
    await db.init()

    const settings = await db.collection("settings")
    const allSettings = await settings.find({})

    // Get the first (and should be only) settings document
    const siteSettings = allSettings[0] || null

    return NextResponse.json({ settings: siteSettings })
  } catch (error) {
    console.error("Failed to fetch settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await validateAdminSession(request)
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()

    const db = getDB()
    await db.init()

    const settings = await db.collection("settings")
    const allSettings = await settings.find({})

    if (allSettings.length > 0) {
      // Update existing settings
      await settings.update(allSettings[0].id, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
    } else {
      // Create new settings
      await settings.create({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to save settings:", error)
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
