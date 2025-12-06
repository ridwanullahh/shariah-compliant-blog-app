// Bismillah Ar-Rahman Ar-Roheem
// Posts API Route

import { type NextRequest, NextResponse } from "next/server"
import { getAdminFromCookies } from "@/lib/admin-auth"
import { getDB } from "@/lib/db"

export async function GET() {
  try {
    const admin = await getAdminFromCookies()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getDB()
    const posts = await db.get("posts")

    return NextResponse.json(posts)
  } catch (error) {
    console.error("Failed to fetch posts:", error)
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
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

    // Check for duplicate slug
    const existing = await db.findOne("posts", (p: any) => p.slug === data.slug)
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Calculate reading time
    const wordsPerMinute = 200
    const wordCount = data.content.replace(/<[^>]*>/g, "").split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)

    const post = await db.insert("posts", {
      ...data,
      authorId: admin.email,
      authorName: admin.name,
      readingTime,
      views: 0,
      likes: 0,
    })

    // Update category and tag counts
    if (data.categories?.length) {
      for (const catSlug of data.categories) {
        const cat = await db.findOne("categories", (c: any) => c.slug === catSlug)
        if (cat) {
          await db.update("categories", cat.uid, { postCount: (cat.postCount || 0) + 1 })
        }
      }
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error("Failed to create post:", error)
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
  }
}
