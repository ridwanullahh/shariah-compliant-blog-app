"use client"

import Link from "next/link"
import { BookOpen, ArrowRight, Clock } from "lucide-react"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function TrendingSeries() {
  const { data, isLoading } = useSWR("/api/series?limit=4", fetcher)
  const seriesList = data?.series || []

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (seriesList.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No series available yet.</div>
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {seriesList.map((series: any) => (
        <Link
          key={series.id}
          href={`/series/${series.slug}`}
          className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{series.title}</h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{series.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {series.postCount || 0} parts
                </span>
                {series.estimatedTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {series.estimatedTime}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                series.status === "completed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {series.status === "completed" ? "Completed" : "In Progress"}
            </span>
            <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              Start Reading
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
