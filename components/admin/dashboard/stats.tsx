import { Card, CardContent } from "@/components/ui/card"
import { getDB } from "@/lib/db"
import { FileText, Eye, MessageSquare, TrendingUp } from "lucide-react"

export async function DashboardStats() {
  const db = getDB()

  let stats = {
    totalPosts: 0,
    publishedPosts: 0,
    totalViews: 0,
    pendingComments: 0,
    subscribers: 0,
  }

  try {
    const [posts, comments, newsletter] = await Promise.all([db.get("posts"), db.get("comments"), db.get("newsletter")])

    stats = {
      totalPosts: posts.length,
      publishedPosts: posts.filter((p: any) => p.status === "published").length,
      totalViews: posts.reduce((acc: number, p: any) => acc + (p.views || 0), 0),
      pendingComments: comments.filter((c: any) => c.status === "pending").length,
      subscribers: newsletter.filter((n: any) => n.status === "active").length,
    }
  } catch (error) {
    console.error("Failed to fetch stats:", error)
  }

  const statItems = [
    {
      label: "Total Posts",
      value: stats.totalPosts,
      subValue: `${stats.publishedPosts} published`,
      icon: FileText,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Total Views",
      value: stats.totalViews.toLocaleString(),
      subValue: "All time",
      icon: Eye,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Pending Comments",
      value: stats.pendingComments,
      subValue: "Awaiting approval",
      icon: MessageSquare,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Subscribers",
      value: stats.subscribers,
      subValue: "Newsletter",
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.subValue}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
