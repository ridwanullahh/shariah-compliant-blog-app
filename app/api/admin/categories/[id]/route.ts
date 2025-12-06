// Bismillah Ar-Rahman Ar-Roheem
// Single Category API Route

import { type NextRequest, NextResponse } from "next/server"
import { getAdminFromCookies } from "@/lib/admin-auth"
import { getDB } from "@/lib/db"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = getDB()
    const data = await request.json()

    const category = await db.update("categories", id, data)
    return NextResponse.json(category)
  } catch (error) {
    console.error("Failed to update category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = getDB()

    await db.delete("categories", id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete category:", error)
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 })
  }
}
