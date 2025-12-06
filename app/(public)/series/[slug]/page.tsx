import Link from "next/link"
import { ChevronRight, Layers, BookOpen, CheckCircle, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { notFound } from "next/navigation"
import { format } from "date-fns"

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getSeriesWithPosts(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/series/${slug}`, {
      cache: "no-store",
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (error) {
    console.error("Failed to fetch series:", error)
  }
  return null
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const data = await getSeriesWithPosts(slug)

  if (!data?.series) {
    return { title: "Series Not Found" }
  }

  return {
    title: `${data.series.title} - Series`,
    description: data.series.description || `Read the ${data.series.title} series`,
  }
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { slug } = await params
  const data = await getSeriesWithPosts(slug)

  if (!data?.series) {
    notFound()
  }

  const { series, posts } = data

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/series" className="hover:text-primary transition-colors">
            Series
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{series.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{series.title}</h1>
              <div className="flex items-center gap-2 mt-1">
                {series.status === "completed" ? (
                  <Badge className="bg-blue-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge className="bg-green-500">
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {posts.length} {posts.length === 1 ? "part" : "parts"}
                </span>
              </div>
            </div>
          </div>
          {series.description && <p className="text-muted-foreground max-w-3xl text-lg">{series.description}</p>}
        </div>

        {/* Series Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No articles in this series yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any, index: number) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-2">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{format(new Date(post.publishedAt || post.createdAt), "MMM d, yyyy")}</span>
                          {post.readingTime && <span>{post.readingTime} min read</span>}
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
