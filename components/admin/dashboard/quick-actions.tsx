"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Settings, BarChart3 } from "lucide-react"

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild className="gap-2">
        <Link href="/admin/posts/new">
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </Button>
      <Button variant="outline" asChild className="gap-2 bg-transparent">
        <Link href="/admin/categories">
          <Upload className="w-4 h-4" />
          Categories
        </Link>
      </Button>
      <Button variant="outline" asChild className="gap-2 bg-transparent">
        <Link href="/admin/analytics">
          <BarChart3 className="w-4 h-4" />
          Analytics
        </Link>
      </Button>
      <Button variant="outline" asChild className="gap-2 bg-transparent">
        <Link href="/admin/settings">
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </Button>
    </div>
  )
}
