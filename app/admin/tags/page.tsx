// Bismillah Ar-Rahman Ar-Roheem
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Pencil, Tags, Loader2, X } from "lucide-react"

interface Tag {
  id: string
  name: string
  slug: string
  postCount?: number
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    try {
      const res = await fetch("/api/admin/tags")
      if (res.ok) {
        const data = await res.json()
        setTags(data.tags || [])
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error)
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

  function openDialog(tag?: Tag) {
    if (tag) {
      setEditingTag(tag)
      setName(tag.name)
      setSlug(tag.slug)
    } else {
      setEditingTag(null)
      setName("")
      setSlug("")
    }
    setDialogOpen(true)
  }

  async function handleSave() {
    if (!name.trim() || !slug.trim()) {
      toast.error("Name and slug are required")
      return
    }

    setSaving(true)
    try {
      const url = editingTag ? `/api/admin/tags/${editingTag.id}` : "/api/admin/tags"
      const res = await fetch(url, {
        method: editingTag ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      })

      if (!res.ok) throw new Error("Failed to save tag")

      toast.success(editingTag ? "Tag updated!" : "Tag created!")
      setDialogOpen(false)
      fetchTags()
    } catch (error) {
      toast.error("Failed to save tag")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(tag: Tag) {
    if (!confirm(`Delete "${tag.name}"?`)) return

    try {
      const res = await fetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Tag deleted")
      fetchTags()
    } catch (error) {
      toast.error("Failed to delete tag")
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
            <Tags className="h-6 w-6" />
            Tags
          </h1>
          <p className="text-muted-foreground mt-1">Manage post tags for better organization</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => openDialog()}>
              <Plus className="w-4 h-4" />
              Add Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTag ? "Edit Tag" : "New Tag"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="tagName">Name</Label>
                <Input
                  id="tagName"
                  placeholder="Tag name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!editingTag) setSlug(generateSlug(e.target.value))
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagSlug">Slug</Label>
                <Input id="tagSlug" placeholder="tag-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {editingTag ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tags.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tags className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No tags yet</h3>
            <p className="text-muted-foreground mt-1">Create tags to label your posts</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-sm py-2 px-3 gap-2">
                  #{tag.name}
                  {tag.postCount !== undefined && (
                    <span className="text-xs text-muted-foreground">({tag.postCount})</span>
                  )}
                  <button onClick={() => openDialog(tag)} className="hover:text-primary transition-colors">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => handleDelete(tag)} className="hover:text-destructive transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
