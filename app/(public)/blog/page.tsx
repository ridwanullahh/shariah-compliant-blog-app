import { Suspense } from "react"
import { BlogArchive } from "@/components/public/blog/blog-archive"
import { ArchiveFilters } from "@/components/public/blog/archive-filters"
import { FeaturedSlider } from "@/components/public/blog/featured-slider"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Blog Archive",
  description: "Browse all articles on Shariah-compliant topics",
}

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      {/* Featured Slider */}
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-2xl" />}>
            <FeaturedSlider />
          </Suspense>
        </div>
      </section>

      {/* Archive */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-72 shrink-0">
              <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
                <ArchiveFilters />
              </Suspense>
            </aside>

            {/* Posts Grid */}
            <main className="flex-1">
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
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}
