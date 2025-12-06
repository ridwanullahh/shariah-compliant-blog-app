// Bismillah Ar-Rahman Ar-Roheem
import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"

export async function GET() {
  try {
    const db = getDB()
    await db.init()

    const categories = await db.collection("categories")
    const posts = await db.collection("posts")

    const allCategories = await categories.find({})
    const allPosts = await posts.find({})

    // Count posts per category
    const categoriesWithCount = allCategories.map((category: any) => ({
      ...category,
      postCount: allPosts.filter((post: any) => post.categoryId === category.id && post.status === "published").length,
    }))

    // Sort by order then by post count
    categoriesWithCount.sort((a: any, b: any) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order
      return b.postCount - a.postCount
    })

    return NextResponse.json({ categories: categoriesWithCount })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ categories: [] })
  }
}
