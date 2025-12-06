// Bismillah Ar-Rahman Ar-Roheem

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface RelatedPostsProps {
  postId: string
  categories: string[]
  tags: string[]
}

interface Post {
  uid: string
  title: string
  slug: string
  excerpt?: string
}

export function RelatedPosts({ postId, categories, tags }: RelatedPostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRelated() {
      try {
        const params = new URLSearchParams()
        if (categories.length > 0) params.set("category", categories[0])
        params.set("limit", "3")
        params.set("exclude", postId)

        const res = await fetch(`/api/posts?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error("Failed to fetch related posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelated()
  }, [postId, categories, tags])

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Related Posts</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (posts.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Related Posts</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.uid} className="group hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <Link href={`/blog/${post.slug}`}>
                <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h4>
                {post.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{post.excerpt}</p>}
                <span className="inline-flex items-center gap-1 text-sm text-primary mt-3">
                  Read more
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
