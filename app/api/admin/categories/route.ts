// Bismillah Ar-Rahman Ar-Roheem
// Categories API Route

import { type NextRequest, NextResponse } from "next/server"
import { getAdminFromCookies } from "@/lib/admin-auth"
import { getDB } from "@/lib/db"

export async function GET() {
  try {
    const db = getDB()
    const categories = await db.get("categories")
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getDB()
    const data = await request.json()

    const existing = await db.findOne("categories", (c: any) => c.slug === data.slug)
    if (existing) {
      return NextResponse.json({ error: "Category slug already exists" }, { status: 400 })
    }

    const category = await db.insert("categories", data)
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Failed to create category:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
