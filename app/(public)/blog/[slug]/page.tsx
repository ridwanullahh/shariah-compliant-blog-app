import { Suspense } from "react"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { SinglePost } from "@/components/public/blog/single-post"
import { RelatedPosts } from "@/components/public/blog/related-posts"
import { Skeleton } from "@/components/ui/skeleton"
import { generateArticleSchema, generateBreadcrumbSchema } from "@/lib/utils/seo"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const posts = await db.collection("posts").getAll()
  const post = posts.find((p: any) => p.slug === slug && p.status === "published")

  if (!post) {
    return { title: "Post Not Found" }
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/blog/${post.slug}`

  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    keywords: post.seoKeywords,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      type: "article",
      url,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const [posts, categories, series] = await Promise.all([
    db.collection("posts").getAll(),
    db.collection("categories").getAll(),
    db.collection("series").getAll(),
  ])

  const post = posts.find((p: any) => p.slug === slug && p.status === "published")

  if (!post) {
    notFound()
  }

  const category = categories.find((c: any) => c.id === post.categoryId)
  const postSeries = post.seriesId ? series.find((s: any) => s.id === post.seriesId) : null

  // Get series posts if part of a series
  const seriesPosts = postSeries
    ? posts
        .filter((p: any) => p.seriesId === postSeries.id && p.status === "published")
        .sort((a: any, b: any) => (a.seriesOrder || 0) - (b.seriesOrder || 0))
    : []

  const enrichedPost = {
    ...post,
    category,
    series: postSeries,
    seriesPosts,
  }

  // Generate structured data
  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    authorName: post.author || "Shariah Blog",
  })

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com" },
    { name: "Blog", url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/blog` },
    ...(category
      ? [
          {
            name: category.name,
            url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/categories/${category.slug}`,
          },
        ]
      : []),
    { name: post.title, url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"}/blog/${post.slug}` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article>
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
          <SinglePost post={enrichedPost} />
        </Suspense>
      </article>

      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <RelatedPosts currentPostId={post.id} categoryId={post.categoryId} tags={post.tags} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
