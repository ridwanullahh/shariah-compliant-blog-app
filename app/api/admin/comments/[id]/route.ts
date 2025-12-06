// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"
import { validateAdminSession } from "@/lib/admin-auth"

// PATCH - Update comment status
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await validateAdminSession(request)
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const db = getDB()
    await db.init()

    const comments = await db.collection("comments")
    await comments.update(id, { status, moderatedAt: new Date().toISOString() })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

// DELETE - Delete comment
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await validateAdminSession(request)
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params

    const db = getDB()
    await db.init()

    const comments = await db.collection("comments")
    await comments.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
