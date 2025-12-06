// Bismillah Ar-Rahman Ar-Roheem
// Edit Post Page

import { notFound } from "next/navigation"
import { getDB } from "@/lib/db"
import { PostEditor } from "@/components/admin/posts/post-editor"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const db = getDB()

  let post = null
  try {
    post = await db.findById("posts", id)
  } catch (error) {
    console.error("Failed to fetch post:", error)
  }

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PostEditor post={post} />
    </div>
  )
}
