// Bismillah Ar-Rahman Ar-Roheem
// Single Post API Route

import { type NextRequest, NextResponse } from "next/server"
import { getAdminFromCookies } from "@/lib/admin-auth"
import { getDB } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = getDB()
    const post = await db.findById("posts", id)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("Failed to fetch post:", error)
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = getDB()
    const data = await request.json()

    // Check for duplicate slug (excluding current post)
    const existing = await db.findOne("posts", (p: any) => p.slug === data.slug && p.uid !== id)
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Calculate reading time
    const wordsPerMinute = 200
    const wordCount = data.content.replace(/<[^>]*>/g, "").split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)

    const post = await db.update("posts", id, {
      ...data,
      readingTime,
    })

    return NextResponse.json(post)
  } catch (error) {
    console.error("Failed to update post:", error)
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
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

    await db.delete("posts", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete post:", error)
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
  }
}
