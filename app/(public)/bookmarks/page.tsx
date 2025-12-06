// Bismillah Ar-Rahman Ar-Roheem

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bookmark, Trash2, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

interface BookmarkedPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  createdAt: string
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookmarks()
  }, [])

  async function loadBookmarks() {
    try {
      const savedIds = JSON.parse(localStorage.getItem("bookmarked-posts") || "[]")

      if (savedIds.length === 0) {
        setBookmarks([])
        setLoading(false)
        return
      }

      // Fetch post details for bookmarked IDs
      const res = await fetch(`/api/posts?ids=${savedIds.join(",")}`)
      if (res.ok) {
        const posts = await res.json()
        setBookmarks(posts.posts || [])
      }
    } catch (error) {
      console.error("Failed to load bookmarks:", error)
    } finally {
      setLoading(false)
    }
  }

  function removeBookmark(id: string) {
    const savedIds = JSON.parse(localStorage.getItem("bookmarked-posts") || "[]")
    const updated = savedIds.filter((savedId: string) => savedId !== id)
    localStorage.setItem("bookmarked-posts", JSON.stringify(updated))
    setBookmarks(bookmarks.filter((b) => b.id !== id))
    toast.success("Bookmark removed")
  }

  function clearAll() {
    localStorage.setItem("bookmarked-posts", "[]")
    setBookmarks([])
    toast.success("All bookmarks cleared")
  }

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Bookmarks</h1>
              <p className="text-muted-foreground">
                {bookmarks.length} saved {bookmarks.length === 1 ? "article" : "articles"}
              </p>
            </div>
            {bookmarks.length > 0 && (
              <Button variant="outline" onClick={clearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Bookmarks List */}
          {bookmarks.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
                <p className="text-muted-foreground mb-6">
                  Start saving articles by clicking the bookmark icon on any post.
                </p>
                <Button asChild>
                  <Link href="/blog">
                    Browse Articles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((post) => (
                <Card key={post.id} className="group">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                        >
                          {post.title}
                        </Link>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Saved</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeBookmark(post.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
