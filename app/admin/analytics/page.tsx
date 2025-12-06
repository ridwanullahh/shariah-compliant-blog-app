// Bismillah Ar-Rahman Ar-Roheem
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Eye, FileText, MessageSquare, TrendingUp, Users, Heart, Loader2, Calendar } from "lucide-react"

interface AnalyticsData {
  totalPosts: number
  totalViews: number
  totalComments: number
  totalReactions: number
  totalSubscribers: number
  publishedPosts: number
  draftPosts: number
  topPosts: Array<{ id: string; title: string; slug: string; views: number }>
  recentComments: number
  recentSubscribers: number
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("30")

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const stats = [
    {
      title: "Total Posts",
      value: data?.totalPosts || 0,
      subtitle: `${data?.publishedPosts || 0} published, ${data?.draftPosts || 0} drafts`,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Views",
      value: data?.totalViews || 0,
      subtitle: "All-time page views",
      icon: Eye,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Comments",
      value: data?.totalComments || 0,
      subtitle: `${data?.recentComments || 0} in last ${period} days`,
      icon: MessageSquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Reactions",
      value: data?.totalReactions || 0,
      subtitle: "Total post reactions",
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Subscribers",
      value: data?.totalSubscribers || 0,
      subtitle: `${data?.recentSubscribers || 0} new this month`,
      icon: Users,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Track your blog performance</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground truncate">{stat.title}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Posts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.topPosts && data.topPosts.length > 0 ? (
            <div className="space-y-4">
              {data.topPosts.map((post, index) => (
                <div key={post.id} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{post.title}</p>
                    <p className="text-sm text-muted-foreground">/{post.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">{post.views.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data available yet</p>
              <p className="text-sm">Start publishing posts to see analytics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Engagement Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Content Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Published Posts</span>
                <span className="font-medium">{data?.publishedPosts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Draft Posts</span>
                <span className="font-medium">{data?.draftPosts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg. Views per Post</span>
                <span className="font-medium">
                  {data?.totalPosts ? Math.round((data.totalViews || 0) / data.totalPosts) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Avg. Comments per Post</span>
                <span className="font-medium">
                  {data?.totalPosts ? ((data.totalComments || 0) / data.totalPosts).toFixed(1) : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audience Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Subscribers</span>
                <span className="font-medium">{data?.totalSubscribers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New This Period</span>
                <span className="font-medium text-green-500">+{data?.recentSubscribers || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Engagement Rate</span>
                <span className="font-medium">
                  {data?.totalViews
                    ? ((((data.totalComments || 0) + (data.totalReactions || 0)) / data.totalViews) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
