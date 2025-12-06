// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const db = getDB()
    await db.init()

    const seriesCollection = await db.collection("series")
    const posts = await db.collection("posts")

    let allSeries = await seriesCollection.find({})
    const allPosts = await posts.find({})

    // Enrich with post count and filter out drafts
    allSeries = allSeries
      .filter((s: any) => s.status !== "draft")
      .map((series: any) => {
        const seriesPosts = allPosts.filter((post: any) => post.seriesId === series.id && post.status === "published")
        return {
          ...series,
          postCount: seriesPosts.length,
        }
      })

    // Sort by order then by post count
    allSeries.sort((a: any, b: any) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order
      return b.postCount - a.postCount
    })

    // Limit results
    allSeries = allSeries.slice(0, limit)

    return NextResponse.json({ series: allSeries })
  } catch (error) {
    console.error("Error fetching series:", error)
    return NextResponse.json({ series: [] })
  }
}
