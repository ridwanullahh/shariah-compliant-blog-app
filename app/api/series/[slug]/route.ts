// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const db = getDB()
    await db.init()

    const seriesCollection = await db.collection("series")
    const posts = await db.collection("posts")

    const allSeries = await seriesCollection.find({})
    const series = allSeries.find((s: any) => s.slug === slug)

    if (!series) {
      return NextResponse.json({ error: "Series not found" }, { status: 404 })
    }

    // Get posts in this series
    const allPosts = await posts.find({})
    const seriesPosts = allPosts
      .filter((p: any) => p.seriesId === series.id && p.status === "published")
      .sort((a: any, b: any) => (a.seriesOrder || 0) - (b.seriesOrder || 0))

    return NextResponse.json({
      series: { ...series, postCount: seriesPosts.length },
      posts: seriesPosts,
    })
  } catch (error) {
    console.error("Failed to fetch series:", error)
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}
