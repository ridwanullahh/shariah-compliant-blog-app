// Bismillah Ar-Rahman Ar-Roheem
import Link from "next/link"
import { FolderOpen, FileText, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Categories",
  description: "Browse all blog categories",
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/categories`, {
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      return data.categories || []
    }
  } catch (error) {
    console.error("Failed to fetch categories:", error)
  }
  return []
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <FolderOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Categories</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our content organized by topic. Each category contains articles on specific subjects to help you
            find what you are looking for.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No categories available yet</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category: any) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="h-full hover:border-primary/50 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="group-hover:text-primary transition-colors">{category.name}</span>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {category.description || "Explore articles in this category"}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        {category.postCount || 0} {category.postCount === 1 ? "article" : "articles"}
                      </span>
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
