"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function FeaturedSlider() {
  const { data } = useSWR("/api/posts?featured=true&limit=5", fetcher)
  const posts = data?.posts || []
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % posts.length)
  }, [posts.length])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + posts.length) % posts.length)
  }, [posts.length])

  // Auto-advance
  useEffect(() => {
    if (posts.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, posts.length])

  if (posts.length === 0) return null

  const post = posts[current]

  return (
    <div className="relative rounded-3xl bg-card border border-border overflow-hidden">
      <div className="p-8 md:p-12">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">Featured</span>
          {post.category && (
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {post.category.name}
            </span>
          )}
        </div>

        <Link href={`/blog/${post.slug}`} className="group">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors text-balance">
            {post.title}
          </h2>
        </Link>

        <p className="text-muted-foreground text-lg mb-6 line-clamp-2 max-w-2xl">{post.excerpt}</p>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {formatDistanceToNow(new Date(post.publishedAt || post.createdAt), { addSuffix: true })}
          </span>
          {post.readingTime && (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.readingTime} min read
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      {posts.length > 1 && (
        <>
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-transparent" onClick={prev}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-transparent" onClick={next}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Indicators */}
          <div className="absolute bottom-4 left-8 flex items-center gap-2">
            {posts.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === current ? "w-6 bg-primary" : "bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
