// Bismillah Ar-Rahman Ar-Roheem
import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight, FolderOpen } from "lucide-react"
import { BlogArchive } from "@/components/public/blog/blog-archive"
import { Skeleton } from "@/components/ui/skeleton"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/categories/${slug}`, {
      cache: "no-store",
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (error) {
    console.error("Failed to fetch category:", error)
  }
  return null
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: "Category Not Found" }
  }

  return {
    title: `${category.name} - Categories`,
    description: category.description || `Browse articles in ${category.name}`,
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
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
          <Link href="/categories" className="hover:text-primary transition-colors">
            Categories
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">{category.name}</h1>
          </div>
          {category.description && <p className="text-muted-foreground max-w-2xl">{category.description}</p>}
          <p className="text-sm text-muted-foreground mt-2">
            {category.postCount || 0} {category.postCount === 1 ? "article" : "articles"}
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
