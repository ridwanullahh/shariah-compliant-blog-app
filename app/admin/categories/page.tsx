// Bismillah Ar-Rahman Ar-Roheem
// Categories Management Page

import { Suspense } from "react"
import { CategoriesManager } from "@/components/admin/categories/categories-manager"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-1">Organize your posts into categories</p>
      </div>

      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        <CategoriesManager />
      </Suspense>
    </div>
  )
}
