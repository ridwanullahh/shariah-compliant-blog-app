// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"

// GET - Fetch reactions for a post
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const visitorId = request.headers.get("x-visitor-id") || request.cookies.get("visitor_id")?.value

    const db = getDB()
    await db.init()

    // Find post
    const posts = await db.collection("posts")
    const allPosts = await posts.find({})
    const post = allPosts.find((p: any) => p.slug === slug || p.id === slug)

    if (!post) {
      return NextResponse.json({ counts: {}, userReaction: null })
    }

    // Get reactions
    const reactions = await db.collection("reactions")
    const postReactions = await reactions.find({ postId: post.id })

    // Count by type
    const counts: Record<string, number> = {}
    let userReaction: string | null = null

    for (const reaction of postReactions) {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1
      if (visitorId && reaction.visitorId === visitorId) {
        userReaction = reaction.type
      }
    }

    return NextResponse.json({ counts, userReaction })
  } catch (error) {
    console.error("Error fetching reactions:", error)
    return NextResponse.json({ counts: {}, userReaction: null })
  }
}

// POST - Add or toggle reaction
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { type, visitorId } = body

    if (!type) {
      return NextResponse.json({ error: "Reaction type is required" }, { status: 400 })
    }

    const db = getDB()
    await db.init()

    // Find post
    const posts = await db.collection("posts")
    const allPosts = await posts.find({})
    const post = allPosts.find((p: any) => p.slug === slug || p.id === slug)

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const reactions = await db.collection("reactions")
    const postReactions = await reactions.find({ postId: post.id })

    // Check if user already reacted
    const existingReaction = visitorId ? postReactions.find((r: any) => r.visitorId === visitorId) : null

    let userReaction: string | null = null

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction (toggle off)
        await reactions.delete(existingReaction.id)
        userReaction = null
      } else {
        // Change reaction type
        await reactions.update(existingReaction.id, { type })
        userReaction = type
      }
    } else {
      // Add new reaction
      await reactions.create({
        postId: post.id,
        type,
        visitorId: visitorId || null,
        createdAt: new Date().toISOString(),
      })
      userReaction = type
    }

    // Recalculate counts
    const updatedReactions = await reactions.find({ postId: post.id })
    const counts: Record<string, number> = {}
    for (const reaction of updatedReactions) {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1
    }

    return NextResponse.json({ counts, userReaction })
  } catch (error) {
    console.error("Error saving reaction:", error)
    return NextResponse.json({ error: "Failed to save reaction" }, { status: 500 })
  }
}
