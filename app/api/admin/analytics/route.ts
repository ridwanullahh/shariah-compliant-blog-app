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
    const { searchParams } = new URL(request.url)
    const period = Number.parseInt(searchParams.get("period") || "30")
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - period)

    const db = getDB()
    await db.init()

    const posts = await db.collection("posts")
    const comments = await db.collection("comments")
    const reactions = await db.collection("reactions")
    const subscribers = await db.collection("subscribers")

    const allPosts = await posts.find({})
    const allComments = await comments.find({})
    const allReactions = await reactions.find({})
    const allSubscribers = await subscribers.find({})

    // Calculate stats
    const publishedPosts = allPosts.filter((p: any) => p.status === "published")
    const draftPosts = allPosts.filter((p: any) => p.status === "draft")

    const totalViews = allPosts.reduce((sum: number, p: any) => sum + (p.views || 0), 0)

    const recentComments = allComments.filter((c: any) => new Date(c.createdAt) >= cutoffDate).length

    const recentSubscribers = allSubscribers.filter((s: any) => new Date(s.createdAt) >= cutoffDate).length

    // Top posts by views
    const topPosts = [...publishedPosts]
      .sort((a: any, b: any) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        views: p.views || 0,
      }))

    return NextResponse.json({
      totalPosts: allPosts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      totalViews,
      totalComments: allComments.length,
      totalReactions: allReactions.length,
      totalSubscribers: allSubscribers.filter((s: any) => s.status === "active").length,
      recentComments,
      recentSubscribers,
      topPosts,
    })
  } catch (error) {
    console.error("Failed to fetch analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
