import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const [tags, posts] = await Promise.all([db.collection("tags").getAll(), db.collection("posts").getAll()])

    // Count posts per tag
    const tagsWithCount = tags.map((tag: any) => ({
      ...tag,
      postCount: posts.filter((post: any) => post.tags?.includes(tag.id) && post.status === "published").length,
    }))

    // Sort by post count
    tagsWithCount.sort((a: any, b: any) => b.postCount - a.postCount)

    return NextResponse.json({ tags: tagsWithCount })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ tags: [] })
  }
}
