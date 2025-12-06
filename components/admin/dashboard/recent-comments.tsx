import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDB } from "@/lib/db"
import { formatDistanceToNow } from "date-fns"
import { ArrowRight, CheckCircle, XCircle } from "lucide-react"

export async function RecentComments() {
  const db = getDB()
  let comments: any[] = []

  try {
    const allComments = await db.get("comments")
    comments = allComments
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  } catch (error) {
    console.error("Failed to fetch comments:", error)
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30",
    approved: "bg-primary/10 text-primary",
    rejected: "bg-destructive/10 text-destructive",
    spam: "bg-gray-100 text-gray-600 dark:bg-gray-800",
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Recent Comments</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/comments" className="gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground mt-1">Comments will appear here when readers engage</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.uid} className="p-3 -mx-3 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{comment.authorName}</span>
                      <Badge variant="secondary" className={statusColors[comment.status]}>
                        {comment.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{comment.content}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {comment.status === "pending" && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-primary">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
