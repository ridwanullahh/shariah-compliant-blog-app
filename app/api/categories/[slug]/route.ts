// Bismillah Ar-Rahman Ar-Roheem
import { type NextRequest, NextResponse } from "next/server"
import { getDB } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    const db = getDB()
    await db.init()

    const categories = await db.collection("categories")
    const posts = await db.collection("posts")

    const allCategories = await categories.find({})
    const category = allCategories.find((c: any) => c.slug === slug)

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    const allPosts = await posts.find({})
    const postCount = allPosts.filter((p: any) => p.categoryId === category.id && p.status === "published").length

    return NextResponse.json({ ...category, postCount })
  } catch (error) {
    console.error("Failed to fetch category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}
