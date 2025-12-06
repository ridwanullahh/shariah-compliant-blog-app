"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, X, Grid, List, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import useSWR from "swr"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type LayoutType = "grid" | "masonry" | "list"

export function ArchiveFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")

  const { data: categoriesData } = useSWR("/api/categories", fetcher)
  const { data: tagsData } = useSWR("/api/tags", fetcher)

  const categories = categoriesData?.categories || []
  const tags = tagsData?.tags || []

  const currentCategory = searchParams.get("category") || ""
  const currentTag = searchParams.get("tag") || ""
  const currentSort = searchParams.get("sort") || "newest"
  const currentLayout = (searchParams.get("layout") || "grid") as LayoutType

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/blog?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/blog")
    setSearchQuery("")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams("q", searchQuery)
  }

  const hasFilters = currentCategory || currentTag || searchParams.get("q")

  return (
    <div className="bg-card rounded-2xl border border-border p-6 sticky top-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </h2>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="pl-10 rounded-xl"
          />
        </div>
      </form>

      {/* Layout Toggle */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">Layout</Label>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
          {[
            { value: "grid", icon: Grid, label: "Grid" },
            { value: "masonry", icon: LayoutGrid, label: "Masonry" },
            { value: "list", icon: List, label: "List" },
          ].map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant="ghost"
              size="sm"
              className={cn("flex-1 rounded-lg", currentLayout === value && "bg-background shadow-sm")}
              onClick={() => updateParams("layout", value)}
            >
              <Icon className="h-4 w-4" />
              <span className="sr-only">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="mb-6">
        <Label className="text-sm text-muted-foreground mb-2 block">Sort By</Label>
        <Select value={currentSort} onValueChange={(v) => updateParams("sort", v)}>
          <SelectTrigger className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="az">A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "tags"]} className="space-y-2">
        {/* Categories */}
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 pt-2">
              <button
                onClick={() => updateParams("category", "")}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  !currentCategory ? "bg-primary/10 text-primary" : "hover:bg-muted",
                )}
              >
                All Categories
              </button>
              {categories.map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => updateParams("category", category.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between",
                    currentCategory === category.id ? "bg-primary/10 text-primary" : "hover:bg-muted",
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-muted-foreground">{category.postCount}</span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tags */}
        <AccordionItem value="tags" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">Tags</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-2">
              {tags.slice(0, 15).map((tag: any) => (
                <button
                  key={tag.id}
                  onClick={() => updateParams("tag", tag.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs transition-colors",
                    currentTag === tag.id ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
                  )}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
