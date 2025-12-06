// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const db = getDB()
    await db.init()

    const tags = await db.collection("tags")
    const posts = await db.collection("posts")

    const allTags = await tags.find({})
    const tag = allTags.find((t: any) => t.slug === slug || t.id === slug)

    if (!tag) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 })
    }

    const allPosts = await posts.find({})
    const postCount = allPosts.filter(
      (p: any) => (p.tags?.includes(tag.id) || p.tags?.includes(tag.slug)) && p.status === "published",
    ).length

    return NextResponse.json({ ...tag, postCount })
  } catch (error) {
    console.error("Failed to fetch tag:", error)
    return NextResponse.json({ error: "Failed to fetch tag" }, { status: 500 })
  }
}
