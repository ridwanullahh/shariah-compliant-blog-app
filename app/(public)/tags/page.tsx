// Bismillah Ar-Rahman Ar-Roheem
import Link from "next/link"
import { Tags, Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Tags",
  description: "Browse all blog tags",
}

async function getTags() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tags`, {
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      return data.tags || []
    }
  } catch (error) {
    console.error("Failed to fetch tags:", error)
  }
  return []
}

export default async function TagsPage() {
  const tags = await getTags()

  // Sort by post count descending
  const sortedTags = [...tags].sort((a: any, b: any) => (b.postCount || 0) - (a.postCount || 0))

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Tags className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Tags</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse content by tags. Tags help you discover related articles across different categories.
          </p>
        </div>

        {/* Tags Cloud */}
        {sortedTags.length === 0 ? (
          <div className="text-center py-16">
            <Tags className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No tags available yet</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-3">
              {sortedTags.map((tag: any) => {
                // Size based on post count
                const count = tag.postCount || 0
                const size = count > 10 ? "lg" : count > 5 ? "md" : "sm"

                return (
                  <Link key={tag.id} href={`/tags/${tag.slug}`}>
                    <Badge
                      variant="secondary"
                      className={`
                        hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer
                        ${size === "lg" ? "text-base px-4 py-2" : size === "md" ? "text-sm px-3 py-1.5" : "text-xs px-2 py-1"}
                      `}
                    >
                      <Hash className={`mr-1 ${size === "lg" ? "h-4 w-4" : "h-3 w-3"}`} />
                      {tag.name}
                      {count > 0 && <span className="ml-1.5 opacity-70">({count})</span>}
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
