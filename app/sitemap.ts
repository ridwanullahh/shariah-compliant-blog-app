// Bismillah Ar-Rahman Ar-Roheem

import type { MetadataRoute } from "next"
import { getDB } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shariahblog.com"

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/series`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/tags`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ]

  try {
    const db = getDB()
    await db.init()

    // Dynamic pages - Posts
    const posts = await db
      .collection("posts")
      .query()
      .where((p: any) => p.status === "published")
      .exec()

    const postPages = posts.map((post: any) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))

    // Dynamic pages - Categories
    const categories = await db.collection("categories").query().exec()
    const categoryPages = categories.map((cat: any) => ({
      url: `${baseUrl}/categories/${cat.slug}`,
      lastModified: new Date(cat.updatedAt || cat.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))

    // Dynamic pages - Series
    const series = await db.collection("series").query().exec()
    const seriesPages = series.map((s: any) => ({
      url: `${baseUrl}/series/${s.slug}`,
      lastModified: new Date(s.updatedAt || s.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    // Dynamic pages - Tags
    const tags = await db.collection("tags").query().exec()
    const tagPages = tags.map((tag: any) => ({
      url: `${baseUrl}/tags/${tag.slug}`,
      lastModified: new Date(tag.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }))

    return [...staticPages, ...postPages, ...categoryPages, ...seriesPages, ...tagPages]
  } catch (error) {
    console.error("Sitemap generation error:", error)
    return staticPages
  }
}
