"use client"

import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function LatestPosts() {
  const { data, isLoading } = useSWR("/api/posts?limit=6", fetcher)
  const posts = data?.posts || []

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No posts yet. Check back soon!</div>
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post: any) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
        >
          {post.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              {post.category.name}
            </span>
          )}

          <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>

          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(post.publishedAt || post.createdAt), { addSuffix: true })}
            </span>
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readingTime} min
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
