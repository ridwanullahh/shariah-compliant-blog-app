"use client"

import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function FeaturedPosts() {
  const { data, isLoading } = useSWR("/api/posts?featured=true&limit=3", fetcher)
  const posts = data?.posts || []

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No featured posts yet.</div>
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {posts.map((post: any, index: number) => (
        <Link
          key={post.id}
          href={`/blog/${post.slug}`}
          className={`group bg-card rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 ${
            index === 0 ? "md:col-span-2 md:row-span-2" : ""
          }`}
        >
          {/* Category badge */}
          {post.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              {post.category.name}
            </span>
          )}

          <h3
            className={`font-bold mb-3 group-hover:text-primary transition-colors ${
              index === 0 ? "text-2xl md:text-3xl" : "text-lg"
            }`}
          >
            {post.title}
          </h3>

          <p className={`text-muted-foreground mb-4 line-clamp-3 ${index === 0 ? "text-base" : "text-sm"}`}>
            {post.excerpt}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDistanceToNow(new Date(post.publishedAt || post.createdAt), { addSuffix: true })}
            </span>
            {post.readingTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime} min read
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
            Read More
            <ArrowRight className="h-4 w-4 ml-1" />
          </div>
        </Link>
      ))}
    </div>
  )
}
