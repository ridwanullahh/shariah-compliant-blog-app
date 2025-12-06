import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const featured = searchParams.get("featured") === "true"
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const series = searchParams.get("series")

    let posts = await db.collection("posts").getAll()
    const categories = await db.collection("categories").getAll()

    // Filter published only
    posts = posts.filter((post: any) => post.status === "published")

    // Apply filters
    if (featured) {
      posts = posts.filter((post: any) => post.featured)
    }
    if (category) {
      posts = posts.filter((post: any) => post.categoryId === category)
    }
    if (tag) {
      posts = posts.filter((post: any) => post.tags?.includes(tag))
    }
    if (series) {
      posts = posts.filter((post: any) => post.seriesId === series)
    }

    // Sort by date (newest first)
    posts.sort(
      (a: any, b: any) =>
        new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime(),
    )

    // Enrich with category data
    posts = posts.map((post: any) => ({
      ...post,
      category: categories.find((c: any) => c.id === post.categoryId) || null,
    }))

    // Pagination
    const total = posts.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    posts = posts.slice(start, start + limit)

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ posts: [], error: "Failed to fetch posts" }, { status: 500 })
  }
}
