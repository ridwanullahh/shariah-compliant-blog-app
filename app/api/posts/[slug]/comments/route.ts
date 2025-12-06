// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"

// GET - Fetch comments for a post
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const db = getDB()
    await db.init()

    // Find post by slug first
    const posts = await db.collection("posts")
    const allPosts = await posts.find({})
    const post = allPosts.find((p: any) => p.slug === slug || p.id === slug)

    if (!post) {
      return NextResponse.json({ comments: [] })
    }

    // Get comments for this post
    const comments = await db.collection("comments")
    const postComments = await comments.find({ postId: post.id })

    return NextResponse.json({ comments: postComments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ comments: [] })
  }
}

// POST - Submit a new comment
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await request.json()
    const { name, email, content, parentId, visitorId } = body

    if (!name || !email || !content) {
      return NextResponse.json({ error: "Name, email, and content are required" }, { status: 400 })
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

    // Create comment
    const comments = await db.collection("comments")
    const newComment = await comments.create({
      postId: post.id,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      content: content.trim(),
      parentId: parentId || null,
      visitorId: visitorId || null,
      status: "pending", // Comments require moderation
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: "Comment submitted for moderation",
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to submit comment" }, { status: 500 })
  }
}
