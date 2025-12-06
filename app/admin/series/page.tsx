// Bismillah Ar-Rahman Ar-Roheem
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Layers, Loader2, BookOpen } from "lucide-react"

interface Series {
  id: string
  title: string
  slug: string
  description?: string
  coverImage?: string
  status: "active" | "completed" | "draft"
  postCount?: number
  order?: number
  createdAt: string
}

export default function SeriesPage() {
  const [series, setSeries] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState<"active" | "completed" | "draft">("active")

  useEffect(() => {
    fetchSeries()
  }, [])

  async function fetchSeries() {
    try {
      const res = await fetch("/api/admin/series")
      if (res.ok) {
        const data = await res.json()
        setSeries(data.series || [])
      }
    } catch (error) {
      console.error("Failed to fetch series:", error)
    } finally {
      setLoading(false)
    }
  }

  function generateSlug(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  function openDialog(item?: Series) {
    if (item) {
      setEditingSeries(item)
      setTitle(item.title)
      setSlug(item.slug)
      setDescription(item.description || "")
      setStatus(item.status)
    } else {
      setEditingSeries(null)
      setTitle("")
      setSlug("")
      setDescription("")
      setStatus("active")
    }
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required")
      return
    }

    setSaving(true)
    try {
      const url = editingSeries ? `/api/admin/series/${editingSeries.id}` : "/api/admin/series"
      const res = await fetch(url, {
        method: editingSeries ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, description, status }),
      })

      if (!res.ok) throw new Error("Failed to save series")

      toast.success(editingSeries ? "Series updated!" : "Series created!")
      setDialogOpen(false)
      fetchSeries()
    } catch (error) {
      toast.error("Failed to save series")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: Series) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/series/${item.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Series deleted")
      fetchSeries()
    } catch (error) {
      toast.error("Failed to delete series")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="h-6 w-6" />
            Series
          </h1>
          <p className="text-muted-foreground mt-1">Group related posts into series</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => openDialog()}>
              <Plus className="w-4 h-4" />
              New Series
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSeries ? "Edit Series" : "New Series"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="seriesTitle">Title</Label>
                <Input
                  id="seriesTitle"
                  placeholder="Series title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value)
                    if (!editingSeries) setSlug(generateSlug(e.target.value))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seriesSlug">Slug</Label>
                <Input
                  id="seriesSlug"
                  placeholder="series-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seriesDesc">Description</Label>
                <Textarea
                  id="seriesDesc"
                  placeholder="Brief description of the series"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-2">
                  {(["active", "completed", "draft"] as const).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={status === s ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatus(s)}
                      className="capitalize"
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingSeries ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {series.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No series yet</h3>
            <p className="text-muted-foreground mt-1">Create a series to group related posts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{item.title}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">/{item.slug}</p>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {item.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4" />
                    <span>{item.postCount || 0} posts</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
