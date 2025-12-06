// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { validateAdminSession } from "@/lib/admin-auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await validateAdminSession(request)
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const data = await request.json()

    const db = getDB()
    await db.init()

    const seriesCollection = await db.collection("series")
    await seriesCollection.update(id, {
      title: data.title,
      slug: data.slug,
      description: data.description,
      status: data.status,
      updatedAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update series:", error)
    return NextResponse.json({ error: "Failed to update series" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await validateAdminSession(request)
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    const db = getDB()
    await db.init()

    const seriesCollection = await db.collection("series")
    await seriesCollection.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete series:", error)
    return NextResponse.json({ error: "Failed to delete series" }, { status: 500 })
  }
}
