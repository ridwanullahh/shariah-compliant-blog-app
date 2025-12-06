"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Save, Loader2, FileText, Search, Layers } from "lucide-react"
import Link from "next/link"
import type { BlogPost } from "@/lib/github-db-sdk"

// Dynamic import for rich text editor
const RichTextEditor = dynamic(() => import("./rich-text-editor"), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />,
})

interface PostEditorProps {
  post?: BlogPost
}

export function PostEditor({ post }: PostEditorProps) {
  const router = useRouter()
  const isEditing = !!post

  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [series, setSeries] = useState<any[]>([])

  // Form state
  const [title, setTitle] = useState(post?.title || "")
  const [slug, setSlug] = useState(post?.slug || "")
  const [content, setContent] = useState(post?.content || "")
  const [excerpt, setExcerpt] = useState(post?.excerpt || "")
  const [contentType, setContentType] = useState<"richtext" | "markdown">(post?.contentType || "richtext")
  const [status, setStatus] = useState<string>(post?.status || "draft")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(post?.categories || [])
  const [selectedTags, setSelectedTags] = useState<string[]>(post?.tags || [])
  const [selectedSeries, setSelectedSeries] = useState(post?.seriesId || "")
  const [seriesOrder, setSeriesOrder] = useState(post?.seriesOrder || 1)
  const [allowComments, setAllowComments] = useState(post?.allowComments ?? true)
  const [isPinned, setIsPinned] = useState(post?.isPinned ?? false)

  // SEO state
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "")
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "")
  const [metaKeywords, setMetaKeywords] = useState(post?.metaKeywords?.join(", ") || "")
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || "")

  // Generate slug from title
  useEffect(() => {
    if (!isEditing && title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(generatedSlug)
    }
  }, [title, isEditing, slug])

  // Fetch categories, tags, and series
  useEffect(() => {
    async function fetchData() {
      try {
        const [catsRes, tagsRes, seriesRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/tags"),
          fetch("/api/admin/series"),
        ])

        if (catsRes.ok) setCategories(await catsRes.json())
        if (tagsRes.ok) setTags(await tagsRes.json())
        if (seriesRes.ok) setSeries(await seriesRes.json())
      } catch (error) {
        console.error("Failed to fetch data:", error)
      }
    }
    fetchData()
  }, [])

  async function handleSave(saveStatus?: string) {
    if (!title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!slug.trim()) {
      toast.error("Slug is required")
      return
    }
    if (!content.trim()) {
      toast.error("Content is required")
      return
    }

    setLoading(true)

    try {
      const postData = {
        title,
        slug,
        content,
        excerpt,
        contentType,
        status: saveStatus || status,
        categories: selectedCategories,
        tags: selectedTags,
        seriesId: selectedSeries || undefined,
        seriesOrder: selectedSeries ? seriesOrder : undefined,
        allowComments,
        isPinned,
        metaTitle,
        metaDescription,
        metaKeywords: metaKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        canonicalUrl,
        publishedAt:
          (saveStatus === "published" || status === "published") && !post?.publishedAt
            ? new Date().toISOString()
            : post?.publishedAt,
      }

      const res = await fetch(isEditing ? `/api/admin/posts/${post.uid}` : "/api/admin/posts", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to save post")
      }

      toast.success(isEditing ? "Post updated!" : "Post created!")
      router.push("/admin/posts")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save post")
    } finally {
      setLoading(false)
    }
  }

  function calculateReadingTime(text: string): number {
    const wordsPerMinute = 200
    const wordCount = text.replace(/<[^>]*>/g, "").split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/posts">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{isEditing ? "Edit Post" : "New Post"}</h1>
            <p className="text-sm text-muted-foreground">{content && `${calculateReadingTime(content)} min read`}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave("draft")} disabled={loading}>
            Save Draft
          </Button>
          <Button onClick={() => handleSave("published")} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Slug */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input id="slug" placeholder="post-url-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Content</CardTitle>
                <Tabs value={contentType} onValueChange={(v) => setContentType(v as "richtext" | "markdown")}>
                  <TabsList className="h-8">
                    <TabsTrigger value="richtext" className="text-xs">
                      Rich Text
                    </TabsTrigger>
                    <TabsTrigger value="markdown" className="text-xs">
                      Markdown
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {contentType === "richtext" ? (
                <RichTextEditor value={content} onChange={setContent} />
              ) : (
                <Textarea
                  placeholder="Write your content in Markdown..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                />
              )}
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Brief summary of the post (optional)..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Tabs defaultValue="publish">
            <TabsList className="w-full">
              <TabsTrigger value="publish" className="flex-1 gap-1">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Publish</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex-1 gap-1">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
              <TabsTrigger value="series" className="flex-1 gap-1">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Series</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="publish" className="space-y-4 mt-4">
              {/* Status */}
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categories */}
                  <div className="space-y-2">
                    <Label>Categories</Label>
                    <Select
                      value={selectedCategories[0] || "default"}
                      onValueChange={(v) => setSelectedCategories([v])}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.uid} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input
                      placeholder="tag1, tag2, tag3"
                      value={selectedTags.join(", ")}
                      onChange={(e) =>
                        setSelectedTags(
                          e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground">Separate with commas</p>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="comments">Allow Comments</Label>
                      <Switch id="comments" checked={allowComments} onCheckedChange={setAllowComments} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="pinned">Pin Post</Label>
                      <Switch id="pinned" checked={isPinned} onCheckedChange={setIsPinned} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <Input
                      id="metaTitle"
                      placeholder={title || "SEO title..."}
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">{metaTitle.length || title.length}/60 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaDesc">Meta Description</Label>
                    <Textarea
                      id="metaDesc"
                      placeholder="SEO description..."
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">{metaDescription.length}/160 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metaKeywords">Keywords</Label>
                    <Input
                      id="metaKeywords"
                      placeholder="keyword1, keyword2..."
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="canonical">Canonical URL</Label>
                    <Input
                      id="canonical"
                      placeholder="https://..."
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="series" className="space-y-4 mt-4">
              <Card>
                <CardContent className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Series</Label>
                    <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select series (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {series.map((s) => (
                          <SelectItem key={s.uid} value={s.uid}>
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSeries && (
                    <div className="space-y-2">
                      <Label htmlFor="seriesOrder">Order in Series</Label>
                      <Input
                        id="seriesOrder"
                        type="number"
                        min={1}
                        value={seriesOrder}
                        onChange={(e) => setSeriesOrder(Number.parseInt(e.target.value) || 1)}
                      />
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Add this post to a series for course-like sequential reading.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
