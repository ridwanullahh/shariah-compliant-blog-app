// Bismillah Ar-Rahman Ar-Roheem
import Link from "next/link"
import { Layers, BookOpen, ArrowRight, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Series",
  description: "Browse article series for in-depth learning",
}

async function getSeries() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/series`, {
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      return data.series || []
    }
  } catch (error) {
    console.error("Failed to fetch series:", error)
  }
  return []
}

export default async function SeriesPage() {
  const series = await getSeries()

  // Only show non-draft series
  const visibleSeries = series.filter((s: any) => s.status !== "draft")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-blue-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Article Series</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Deep-dive into topics with our curated article series. Each series covers a subject comprehensively across
            multiple connected articles.
          </p>
        </div>

        {/* Series Grid */}
        {visibleSeries.length === 0 ? (
          <div className="text-center py-16">
            <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No series available yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleSeries.map((item: any) => (
              <Link key={item.id} href={`/series/${item.slug}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-primary transition-colors">{item.title}</CardTitle>
                      {getStatusBadge(item.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {item.description || "Explore this series of connected articles"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>
                          {item.postCount || 0} {item.postCount === 1 ? "part" : "parts"}
                        </span>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
