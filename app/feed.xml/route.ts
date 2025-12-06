// Bismillah Ar-Rahman Ar-Roheem

import { NextResponse } from "next/server"
import { getDB } from "@/lib/db"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shariahblog.com"

  try {
    const db = getDB()
    await db.init()

    const posts = await db
      .collection("posts")
      .query()
      .where((p: any) => p.status === "published")
      .sort("publishedAt", "desc")
      .limit(20)
      .exec()

    const items = posts
      .map(
        (post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt || post.title}]]></description>
      <pubDate>${new Date(post.publishedAt || post.createdAt).toUTCString()}</pubDate>
    </item>`,
      )
      .join("")

    const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Shariah Blog</title>
    <link>${baseUrl}</link>
    <description>Authentic Islamic knowledge for modern Muslims</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

    return new NextResponse(feed, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (error) {
    console.error("RSS feed error:", error)
    return new NextResponse("Error generating feed", { status: 500 })
  }
}
