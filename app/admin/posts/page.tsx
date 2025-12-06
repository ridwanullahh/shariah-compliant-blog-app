// Bismillah Ar-Rahman Ar-Roheem
// Admin Posts List Page

import { Suspense } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PostsTable } from "@/components/admin/posts/posts-table"
import { PostsFilter } from "@/components/admin/posts/posts-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"

export default function AdminPostsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Posts</h1>
          <p className="text-muted-foreground mt-1">Manage your blog posts</p>
        </div>
        <Button asChild className="gap-2 w-full sm:w-auto">
          <Link href="/admin/posts/new">
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <PostsFilter />

      {/* Posts Table */}
      <Suspense fallback={<TableSkeleton />}>
        <PostsTable />
      </Suspense>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-lg" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}
