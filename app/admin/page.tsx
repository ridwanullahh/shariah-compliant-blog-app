// Bismillah Ar-Rahman Ar-Roheem
// Admin Dashboard Page

import { Suspense } from "react"
import { getAdminFromCookies } from "@/lib/admin-auth"
import { DashboardStats } from "@/components/admin/dashboard/stats"
import { RecentPosts } from "@/components/admin/dashboard/recent-posts"
import { RecentComments } from "@/components/admin/dashboard/recent-comments"
import { QuickActions } from "@/components/admin/dashboard/quick-actions"
import { Skeleton } from "@/components/ui/skeleton"

export default async function AdminDashboard() {
  const admin = await getAdminFromCookies()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {admin?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your blog today.</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <Suspense fallback={<StatsSkeletons />}>
        <DashboardStats />
      </Suspense>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ContentSkeleton />}>
          <RecentPosts />
        </Suspense>
        <Suspense fallback={<ContentSkeleton />}>
          <RecentComments />
        </Suspense>
      </div>
    </div>
  )
}

function StatsSkeletons() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  )
}

function ContentSkeleton() {
  return <Skeleton className="h-80 rounded-xl" />
}
