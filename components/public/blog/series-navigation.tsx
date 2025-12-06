"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, BookOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

interface SeriesNavigationProps {
  series: any
  posts: any[]
  currentPostId: string
}

export function SeriesNavigation({ series, posts, currentPostId }: SeriesNavigationProps) {
  const currentIndex = posts.findIndex((p) => p.id === currentPostId)
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null

  return (
    <div className="mb-8 bg-card rounded-2xl border border-border overflow-hidden">
      <Accordion type="single" collapsible defaultValue="series">
        <AccordionItem value="series" className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Part of series</p>
                <p className="font-semibold">{series.title}</p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            <p className="text-sm text-muted-foreground mb-4">{series.description}</p>
            <div className="space-y-1">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-colors",
                    post.id === currentPostId ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                      post.id === currentPostId ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    {index < currentIndex ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span className={cn("text-sm flex-1 truncate", post.id === currentPostId && "font-medium")}>
                    {post.title}
                  </span>
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2 p-4 border-t border-border">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled={!prevPost} asChild={!!prevPost}>
          {prevPost ? (
            <Link href={`/blog/${prevPost.slug}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Link>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </>
          )}
        </Button>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled={!nextPost} asChild={!!nextPost}>
          {nextPost ? (
            <Link href={`/blog/${nextPost.slug}`}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
