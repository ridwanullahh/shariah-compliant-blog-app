"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Calendar, Clock, Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import useSWRInfinite from "swr/infinite"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type LayoutType = "grid" | "masonry" | "list"

export function BlogArchive() {
  const searchParams = useSearchParams()
  const layout = (searchParams.get("layout") || "grid") as LayoutType
  const category = searchParams.get("category") || ""
  const tag = searchParams.get("tag") || ""
  const sort = searchParams.get("sort") || "newest"
  const query = searchParams.get("q") || ""

  const observerRef = useRef<HTMLDivElement>(null)
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([])

  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.posts?.length) return null
    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: "9",
    })
    if (category) params.set("category", category)
    if (tag) params.set("tag", tag)
    if (sort) params.set("sort", sort)
    if (query) params.set("q", query)
    return `/api/posts?${params.toString()}`
  }

  const { data, size, setSize, isLoading, isValidating } = useSWRInfinite(getKey, fetcher)

  const posts = data ? data.flatMap((page) => page.posts || []) : []
  const hasMore = data?.[data.length - 1]?.posts?.length === 9

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bookmarked-posts")
    if (saved) {
      setBookmarkedPosts(JSON.parse(saved))
    }
  }, [])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isValidating) {
          setSize(size + 1)
        }
      },
      { threshold: 0.1 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isValidating, setSize, size])

  const toggleBookmark = useCallback((postId: string) => {
    setBookmarkedPosts((prev) => {
      const updated = prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
      localStorage.setItem("bookmarked-posts", JSON.stringify(updated))
      toast.success(prev.includes(postId) ? "Removed from bookmarks" : "Added to bookmarks")
      return updated
    })
  }, [])

  const handleShare = useCallback(async (post: any) => {
    const url = `${window.location.origin}/blog/${post.slug}`
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url,
      })
    } else {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard")
    }
  }, [])

  if (isLoading) {
    return (
      <div
        className={cn(
          layout === "list" ? "space-y-4" : "grid gap-6",
          layout === "grid" && "md:grid-cols-2 lg:grid-cols-3",
          layout === "masonry" && "md:columns-2 lg:columns-3",
        )}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton
            key={i}
            className={cn(
              "rounded-2xl",
              layout === "list" ? "h-32" : "h-64",
              layout === "masonry" && "mb-6 break-inside-avoid",
            )}
          />
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg mb-4">No posts found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or search query</p>
      </div>
    )
  }

  return (
    <div>
      <div
        className={cn(
          layout === "list" ? "space-y-4" : "grid gap-6",
          layout === "grid" && "md:grid-cols-2",
          layout === "masonry" && "md:columns-2",
        )}
      >
        {posts.map((post: any) => (
          <PostCard
            key={post.id}
            post={post}
            layout={layout}
            isBookmarked={bookmarkedPosts.includes(post.id)}
            onBookmark={() => toggleBookmark(post.id)}
            onShare={() => handleShare(post)}
          />
        ))}
      </div>

      {/* Load more trigger */}
      <div ref={observerRef} className="py-8 text-center">
        {isValidating && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading more...
          </div>
        )}
        {!hasMore && posts.length > 0 && <p className="text-muted-foreground text-sm">You have reached the end</p>}
      </div>
    </div>
  )
}

function PostCard({
  post,
  layout,
  isBookmarked,
  onBookmark,
  onShare,
}: {
  post: any
  layout: LayoutType
  isBookmarked: boolean
  onBookmark: () => void
  onShare: () => void
}) {
  if (layout === "list") {
    return (
      <article className="group bg-card rounded-2xl border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all duration-300">
        <div className="flex gap-4">
          <div className="flex-1 min-w-0">
            {post.category && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
                {post.category.name}
              </span>
            )}
            <Link href={`/blog/${post.slug}`}>
              <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>
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
          </div>
          <div className="flex flex-col gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBookmark}>
              <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className={cn(
        "group bg-card rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300",
        layout === "masonry" && "mb-6 break-inside-avoid",
      )}
    >
      {post.category && (
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
          {post.category.name}
        </span>
      )}

      <Link href={`/blog/${post.slug}`}>
        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
      </Link>

      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
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

      {/* Quick Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Heart className="h-4 w-4 mr-1" />
            <span className="text-xs">{post.likeCount || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">{post.commentCount || 0}</span>
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBookmark}>
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}
