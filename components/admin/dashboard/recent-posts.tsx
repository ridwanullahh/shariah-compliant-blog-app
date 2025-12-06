import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDB } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, Eye } from "lucide-react"

export async function RecentPosts() {
  const db = getDB()
  let posts: any[] = []

  try {
    const allPosts = await db.get("posts")
    posts = allPosts
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  } catch (error) {
    console.error("Failed to fetch posts:", error)
  }

  const statusColors: Record<string, string> = {
    published: "bg-primary/10 text-primary",
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30",
    archived: "bg-gray-100 text-gray-600 dark:bg-gray-800",
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Posts</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/posts" className="gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No posts yet</p>
            <Button asChild className="mt-4">
              <Link href="/admin/posts/new">Create your first post</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post.uid}
                href={`/admin/posts/${post.uid}`}
                className="block p-3 -mx-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {post.views || 0}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className={statusColors[post.status]}>
                    {post.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
