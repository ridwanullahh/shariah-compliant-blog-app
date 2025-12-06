"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Calendar, Clock, ChevronRight, Bookmark, Volume2, VolumeX, ChevronUp, List, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { PostContent } from "./post-content"
import { CommentsSection } from "./comments-section"
import { ReactionsBar } from "./reactions-bar"
import { SocialShareButtons } from "./social-share-buttons"
import { SeriesNavigation } from "./series-navigation"
import { TableOfContents } from "./table-of-contents"
import { RelatedPosts } from "./related-posts"

interface SinglePostProps {
  post: any
}

export function SinglePost({ post }: SinglePostProps) {
  const [progress, setProgress] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [copied, setCopied] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([])

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return
      const element = contentRef.current
      const rect = element.getBoundingClientRect()
      const scrolled = Math.max(0, -rect.top)
      const total = rect.height - window.innerHeight
      const percentage = Math.min(100, Math.max(0, (scrolled / total) * 100))
      setProgress(percentage)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Load bookmark state
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarked-posts") || "[]")
    setIsBookmarked(bookmarks.includes(post.id))
  }, [post.id])

  // Extract headings for TOC
  useEffect(() => {
    if (contentRef.current) {
      const elements = contentRef.current.querySelectorAll("h2, h3, h4")
      const extracted = Array.from(elements).map((el, index) => {
        const id = el.id || `heading-${index}`
        if (!el.id) el.id = id
        return {
          id,
          text: el.textContent || "",
          level: Number.parseInt(el.tagName.charAt(1)),
        }
      })
      setHeadings(extracted)
    }
  }, [post.content])

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("bookmarked-posts") || "[]")
    const updated = isBookmarked ? bookmarks.filter((id: string) => id !== post.id) : [...bookmarks, post.id]
    localStorage.setItem("bookmarked-posts", JSON.stringify(updated))
    setIsBookmarked(!isBookmarked)
    toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks")
  }

  const toggleSpeech = () => {
    if (isSpeaking) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const content = contentRef.current?.textContent || post.content
      const utterance = new SpeechSynthesisUtterance(content)
      utterance.onend = () => setIsSpeaking(false)
      speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    toast.success("Link copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div className="h-full bg-primary transition-all duration-150" style={{ width: `${progress}%` }} />
      </div>

      {/* Floating TOC button (mobile) */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg md:hidden bg-transparent"
        onClick={() => setShowToc(!showToc)}
      >
        <List className="h-5 w-5" />
      </Button>

      {/* Mobile TOC Sheet */}
      {showToc && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Table of Contents</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowToc(false)}>
                Close
              </Button>
            </div>
            <TableOfContents headings={headings} onSelect={() => setShowToc(false)} />
          </div>
        </div>
      )}

      {/* Scroll to top button */}
      {progress > 20 && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg bg-transparent"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            {post.category && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/categories/${post.category.slug}`} className="hover:text-primary transition-colors">
                  {post.category.name}
                </Link>
              </>
            )}
          </nav>

          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Link
                href={`/categories/${post.category.slug}`}
                className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 hover:bg-primary/20 transition-colors"
              >
                {post.category.name}
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-balance leading-tight">{post.title}</h1>

            {post.excerpt && <p className="text-xl text-muted-foreground mb-6 text-pretty">{post.excerpt}</p>}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(post.publishedAt || post.createdAt), "MMMM d, yyyy")}
              </span>
              {post.readingTime && (
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {post.readingTime} min read
                </span>
              )}
              {post.author && <span>By {post.author}</span>}
            </div>
          </header>

          {/* Action Bar */}
          <div className="flex items-center justify-between py-4 border-y border-border mb-8">
            <div className="flex items-center gap-2">
              <ReactionsBar postId={post.id} />
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={toggleSpeech}
                title={isSpeaking ? "Stop reading" : "Read aloud"}
              >
                {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleBookmark}>
                <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={copyLink}>
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Series Navigation (if part of series) */}
          {post.series && <SeriesNavigation series={post.series} posts={post.seriesPosts} currentPostId={post.id} />}

          {/* Main Content with Sidebar TOC */}
          <div className="lg:grid lg:grid-cols-[1fr_250px] lg:gap-12">
            <div ref={contentRef}>
              <PostContent content={post.content} contentType={post.contentType} />
            </div>

            {/* Desktop TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <h3 className="font-semibold mb-4 text-sm">On This Page</h3>
                <TableOfContents headings={headings} />
              </div>
            </aside>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tagId: string) => (
                  <Link
                    key={tagId}
                    href={`/tags/${tagId}`}
                    className="px-3 py-1 rounded-full bg-muted text-sm hover:bg-muted/80 transition-colors"
                  >
                    #{tagId}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Social Share */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-semibold mb-4">Share this article</h3>
            <SocialShareButtons
              url={typeof window !== "undefined" ? window.location.href : ""}
              title={post.title}
              description={post.excerpt}
            />
          </div>

          {/* Related Posts */}
          <div className="mt-12 pt-8 border-t border-border">
            <RelatedPosts postId={post.id} categories={post.categories || []} tags={post.tags || []} />
          </div>

          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <CommentsSection postId={post.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
