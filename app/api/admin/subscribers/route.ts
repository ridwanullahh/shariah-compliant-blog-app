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

    const subscribers = await db.collection("subscribers")
    const allSubscribers = await subscribers.find({})

    // Sort by date descending
    allSubscribers.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ subscribers: allSubscribers })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 })
  }
}
