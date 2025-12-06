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

    const seriesCollection = await db.collection("series")
    const posts = await db.collection("posts")

    const allSeries = await seriesCollection.find({})
    const allPosts = await posts.find({})

    // Add post counts
    const seriesWithCounts = allSeries.map((s: any) => {
      const postCount = allPosts.filter((p: any) => p.seriesId === s.id).length
      return { ...s, postCount }
    })

    // Sort by order then date
    seriesWithCounts.sort((a: any, b: any) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return NextResponse.json({ series: seriesWithCounts })
  } catch (error) {
    console.error("Failed to fetch series:", error)
    return NextResponse.json({ error: "Failed to fetch series" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await validateAdminSession(request)
  if (!session.valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDB()
    await db.init()
    const data = await request.json()

    const seriesCollection = await db.collection("series")
    const allSeries = await seriesCollection.find({})

    const existing = allSeries.find((s: any) => s.slug === data.slug)
    if (existing) {
      return NextResponse.json({ error: "Series slug already exists" }, { status: 400 })
    }

    const series = await seriesCollection.create({
      title: data.title,
      slug: data.slug,
      description: data.description || "",
      status: data.status || "active",
      order: allSeries.length,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json(series, { status: 201 })
  } catch (error) {
    console.error("Failed to create series:", error)
    return NextResponse.json({ error: "Failed to create series" }, { status: 500 })
  }
}
