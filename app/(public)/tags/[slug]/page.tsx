// Bismillah Ar-Rahman Ar-Roheem
import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight, Hash } from "lucide-react"
import { BlogArchive } from "@/components/public/blog/blog-archive"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getTag(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/tags/${slug}`, {
      cache: "no-store",
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (error) {
    console.error("Failed to fetch tag:", error)
  }
  return null
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const tag = await getTag(slug)

  if (!tag) {
    return { title: "Tag Not Found" }
  }

  return {
    title: `#${tag.name} - Tags`,
    description: `Browse articles tagged with #${tag.name}`,
  }
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params
  const tag = await getTag(slug)

  if (!tag) {
    notFound()
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/tags" className="hover:text-primary transition-colors">
            Tags
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">#{tag.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">#{tag.name}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {tag.postCount || 0} {tag.postCount === 1 ? "article" : "articles"} with this tag
          </p>
        </div>

        {/* Posts */}
        <Suspense
          fallback={
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          }
        >
          <BlogArchive />
        </Suspense>
      </div>
    </div>
  )
}
