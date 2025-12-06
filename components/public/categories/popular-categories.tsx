"use client"

import Link from "next/link"
import { Folder } from "lucide-react"
import useSWR from "swr"
import { Skeleton } from "@/components/ui/skeleton"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function PopularCategories() {
  const { data, isLoading } = useSWR("/api/categories", fetcher)
  const categories = data?.categories || []

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.slice(0, 8).map((category: any) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className="group bg-card rounded-2xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
            <Folder className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
          <p className="text-sm text-muted-foreground">{category.postCount || 0} posts</p>
        </Link>
      ))}
    </div>
  )
}
