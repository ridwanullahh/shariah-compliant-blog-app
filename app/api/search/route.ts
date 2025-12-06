import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")?.toLowerCase() || ""

    if (query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const [posts, categories, tags, series] = await Promise.all([
      db.collection("posts").getAll(),
      db.collection("categories").getAll(),
      db.collection("tags").getAll(),
      db.collection("series").getAll(),
    ])

    const results: Array<{
      id: string
      type: "post" | "category" | "tag" | "series"
      title: string
      excerpt?: string
      slug: string
    }> = []

    // Search posts
    posts
      .filter((post: any) => post.status === "published")
      .filter(
        (post: any) =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query) ||
          post.content?.toLowerCase().includes(query),
      )
      .slice(0, 5)
      .forEach((post: any) => {
        results.push({
          id: post.id,
          type: "post",
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
        })
      })

    // Search categories
    categories
      .filter((cat: any) => cat.name.toLowerCase().includes(query) || cat.description?.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach((cat: any) => {
        results.push({
          id: cat.id,
          type: "category",
          title: cat.name,
          excerpt: cat.description,
          slug: cat.slug,
        })
      })

    // Search tags
    tags
      .filter((tag: any) => tag.name.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach((tag: any) => {
        results.push({
          id: tag.id,
          type: "tag",
          title: tag.name,
          slug: tag.slug,
        })
      })

    // Search series
    series
      .filter((s: any) => s.title.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach((s: any) => {
        results.push({
          id: s.id,
          type: "series",
          title: s.title,
          excerpt: s.description,
          slug: s.slug,
        })
      })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ results: [] })
  }
}
