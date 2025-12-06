import Link from "next/link"
import { getDB } from "@/lib/db"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import { Eye, MoreHorizontal, Pencil, Trash2, ExternalLink, Copy } from "lucide-react"

interface PostsTableProps {
  searchParams?: {
    status?: string
    search?: string
  }
}

export async function PostsTable({ searchParams }: PostsTableProps) {
  const db = getDB()
  let posts: any[] = []

  try {
    let allPosts = await db.get("posts")

    // Apply filters
    if (searchParams?.status && searchParams.status !== "all") {
      allPosts = allPosts.filter((p: any) => p.status === searchParams.status)
    }

    if (searchParams?.search) {
      const search = searchParams.search.toLowerCase()
      allPosts = allPosts.filter(
        (p: any) => p.title.toLowerCase().includes(search) || p.content?.toLowerCase().includes(search),
      )
    }

    posts = allPosts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Failed to fetch posts:", error)
  }

  const statusColors: Record<string, string> = {
    published: "bg-primary/10 text-primary border-primary/20",
    draft: "bg-muted text-muted-foreground border-border",
    scheduled: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
    archived: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:border-gray-700",
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No posts found</h3>
        <p className="text-muted-foreground mt-1">Create your first post to get started</p>
        <Button asChild className="mt-4">
          <Link href="/admin/posts/new">Create Post</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">Title</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Views</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.uid} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <Link
                    href={`/admin/posts/${post.uid}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                  {post.isPinned && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Pinned
                    </Badge>
                  )}
                </td>
                <td className="p-4">
                  <Badge variant="outline" className={statusColors[post.status]}>
                    {post.status}
                  </Badge>
                </td>
                <td className="p-4 text-muted-foreground">{post.categories?.[0] || "-"}</td>
                <td className="p-4 text-muted-foreground">{(post.views || 0).toLocaleString()}</td>
                <td className="p-4 text-muted-foreground text-sm">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </td>
                <td className="p-4 text-right">
                  <PostActions post={post} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile List */}
      <div className="md:hidden divide-y divide-border">
        {posts.map((post) => (
          <div key={post.uid} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <Link href={`/admin/posts/${post.uid}`} className="font-medium text-foreground hover:text-primary">
                  {post.title}
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={`text-xs ${statusColors[post.status]}`}>
                    {post.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {post.views || 0}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
              <PostActions post={post} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PostActions({ post }: { post: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-4 h-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin/posts/${post.uid}`} className="cursor-pointer">
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        {post.status === "published" && (
          <DropdownMenuItem asChild>
            <Link href={`/blog/${post.slug}`} target="_blank" className="cursor-pointer">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Post
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
