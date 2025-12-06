// Bismillah Ar-Rahman Ar-Roheem
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Settings, Globe, Bell, Shield, Palette, Loader2, Save } from "lucide-react"

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  authorName: string
  authorEmail: string
  socialLinks: {
    twitter?: string
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  seo: {
    defaultTitle: string
    titleTemplate: string
    defaultDescription: string
    keywords: string
  }
  features: {
    commentsEnabled: boolean
    reactionsEnabled: boolean
    newsletterEnabled: boolean
    searchEnabled: boolean
  }
}

const defaultSettings: SiteSettings = {
  siteName: "My Islamic Blog",
  siteDescription: "A Shariah-compliant blog sharing Islamic knowledge",
  siteUrl: "",
  authorName: "",
  authorEmail: "",
  socialLinks: {},
  seo: {
    defaultTitle: "My Islamic Blog",
    titleTemplate: "%s | My Islamic Blog",
    defaultDescription: "Sharing Islamic knowledge and guidance",
    keywords: "islam, islamic, blog, knowledge, shariah",
  },
  features: {
    commentsEnabled: true,
    reactionsEnabled: true,
    newsletterEnabled: true,
    searchEnabled: true,
  },
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        if (data.settings) {
          setSettings({ ...defaultSettings, ...data.settings })
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!res.ok) throw new Error("Failed to save")

      toast.success("Settings saved successfully!")
    } catch (error) {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  function updateSettings(path: string, value: any) {
    setSettings((prev) => {
      const keys = path.split(".")
      const updated = { ...prev }
      let current: any = updated

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return updated
    })
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
            <Settings className="h-6 w-6" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">Configure your blog settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4 hidden sm:block" />
            General
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Shield className="h-4 w-4 hidden sm:block" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Palette className="h-4 w-4 hidden sm:block" />
            Social
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Bell className="h-4 w-4 hidden sm:block" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic information about your blog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSettings("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    placeholder="https://yourblog.com"
                    value={settings.siteUrl}
                    onChange={(e) => updateSettings("siteUrl", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSettings("siteDescription", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="authorName">Author Name</Label>
                  <Input
                    id="authorName"
                    value={settings.authorName}
                    onChange={(e) => updateSettings("authorName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authorEmail">Author Email</Label>
                  <Input
                    id="authorEmail"
                    type="email"
                    value={settings.authorEmail}
                    onChange={(e) => updateSettings("authorEmail", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>Optimize your blog for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultTitle">Default Page Title</Label>
                <Input
                  id="defaultTitle"
                  value={settings.seo.defaultTitle}
                  onChange={(e) => updateSettings("seo.defaultTitle", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="titleTemplate">Title Template</Label>
                <Input
                  id="titleTemplate"
                  placeholder="%s | Site Name"
                  value={settings.seo.titleTemplate}
                  onChange={(e) => updateSettings("seo.titleTemplate", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Use %s as placeholder for page title</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultDescription">Default Meta Description</Label>
                <Textarea
                  id="defaultDescription"
                  value={settings.seo.defaultDescription}
                  onChange={(e) => updateSettings("seo.defaultDescription", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="keyword1, keyword2, keyword3"
                  value={settings.seo.keywords}
                  onChange={(e) => updateSettings("seo.keywords", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Connect your social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/username"
                    value={settings.socialLinks.twitter || ""}
                    onChange={(e) => updateSettings("socialLinks.twitter", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/page"
                    value={settings.socialLinks.facebook || ""}
                    onChange={(e) => updateSettings("socialLinks.facebook", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/username"
                    value={settings.socialLinks.instagram || ""}
                    onChange={(e) => updateSettings("socialLinks.instagram", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/username"
                    value={settings.socialLinks.linkedin || ""}
                    onChange={(e) => updateSettings("socialLinks.linkedin", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    placeholder="https://youtube.com/@channel"
                    value={settings.socialLinks.youtube || ""}
                    onChange={(e) => updateSettings("socialLinks.youtube", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>Enable or disable blog features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Comments</Label>
                  <p className="text-sm text-muted-foreground">Allow visitors to comment on posts</p>
                </div>
                <Switch
                  checked={settings.features.commentsEnabled}
                  onCheckedChange={(checked) => updateSettings("features.commentsEnabled", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reactions</Label>
                  <p className="text-sm text-muted-foreground">Allow visitors to react to posts</p>
                </div>
                <Switch
                  checked={settings.features.reactionsEnabled}
                  onCheckedChange={(checked) => updateSettings("features.reactionsEnabled", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter</Label>
                  <p className="text-sm text-muted-foreground">Show newsletter subscription forms</p>
                </div>
                <Switch
                  checked={settings.features.newsletterEnabled}
                  onCheckedChange={(checked) => updateSettings("features.newsletterEnabled", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Search</Label>
                  <p className="text-sm text-muted-foreground">Enable site search functionality</p>
                </div>
                <Switch
                  checked={settings.features.searchEnabled}
                  onCheckedChange={(checked) => updateSettings("features.searchEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
