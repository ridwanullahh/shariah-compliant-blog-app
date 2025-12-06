"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Tag, Folder, Clock, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import useSWR from "swr"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchResult {
  id: string
  type: "post" | "category" | "tag" | "series"
  title: string
  excerpt?: string
  slug: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()

  const { data, isLoading } = useSWR<{ results: SearchResult[] }>(
    debouncedQuery.length >= 2 ? `/api/search?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher,
  )

  const results = data?.results || []

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onOpenChange(false)
      setQuery("")

      switch (result.type) {
        case "post":
          router.push(`/blog/${result.slug}`)
          break
        case "category":
          router.push(`/categories/${result.slug}`)
          break
        case "tag":
          router.push(`/tags/${result.slug}`)
          break
        case "series":
          router.push(`/series/${result.slug}`)
          break
      }
    },
    [router, onOpenChange],
  )

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "post":
        return FileText
      case "category":
        return Folder
      case "tag":
        return Tag
      case "series":
        return Clock
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts, categories, tags..."
            className="border-0 focus-visible:ring-0 h-14 text-base"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 hover:bg-muted rounded">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Searching...
            </div>
          )}

          {!isLoading && debouncedQuery.length >= 2 && results.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">No results found for "{debouncedQuery}"</div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-1">
              {results.map((result) => {
                const Icon = getIcon(result.type)
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-muted transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.excerpt && <p className="text-sm text-muted-foreground truncate">{result.excerpt}</p>}
                      <p className="text-xs text-muted-foreground capitalize mt-1">{result.type}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {!debouncedQuery && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Start typing to search...</p>
              <p className="text-xs mt-2">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> +{" "}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">K</kbd> anytime
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
