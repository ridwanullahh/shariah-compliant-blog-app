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

    const tags = await db.collection("tags")
    const posts = await db.collection("posts")

    const allTags = await tags.find({})
    const allPosts = await posts.find({})

    // Add post counts
    const tagsWithCounts = allTags.map((tag: any) => {
      const postCount = allPosts.filter((p: any) => p.tags?.includes(tag.id) || p.tags?.includes(tag.slug)).length
      return { ...tag, postCount }
    })

    return NextResponse.json({ tags: tagsWithCounts })
  } catch (error) {
    console.error("Failed to fetch tags:", error)
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await validateAdminSession(request)
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDB()
    await db.init()
    const data = await request.json()

    const tags = await db.collection("tags")
    const allTags = await tags.find({})

    const existing = allTags.find((t: any) => t.slug === data.slug)
    if (existing) {
      return NextResponse.json({ error: "Tag slug already exists" }, { status: 400 })
    }

    const tag = await tags.create({
      name: data.name,
      slug: data.slug,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error("Failed to create tag:", error)
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 })
  }
}
