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

    const comments = await db.collection("comments")
    const posts = await db.collection("posts")

    const allComments = await comments.find({})
    const allPosts = await posts.find({})

    // Attach post info to comments
    const commentsWithPosts = allComments.map((comment: any) => {
      const post = allPosts.find((p: any) => p.id === comment.postId)
      return {
        ...comment,
        post: post ? { title: post.title, slug: post.slug } : null,
      }
    })

    // Sort by date, pending first
    commentsWithPosts.sort((a: any, b: any) => {
      if (a.status === "pending" && b.status !== "pending") return -1
      if (a.status !== "pending" && b.status === "pending") return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({ comments: commentsWithPosts })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
