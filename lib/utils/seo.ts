// Bismillah Ar-Rahman Ar-Roheem
// SEO utilities for rich snippets and meta tags

import type { BlogPost, Series } from "../github-db-sdk"

export interface SEOData {
  title: string
  description: string
  keywords: string[]
  canonical?: string
  ogImage?: string
  ogType: "website" | "article"
  twitterCard: "summary" | "summary_large_image"
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export function generatePostSEO(post: BlogPost, siteUrl: string): SEOData {
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || post.content.slice(0, 160).replace(/<[^>]*>/g, ""),
    keywords: post.metaKeywords || post.tags,
    canonical: post.canonicalUrl || `${siteUrl}/blog/${post.slug}`,
    ogType: "article",
    twitterCard: "summary_large_image",
    author: post.authorName,
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    section: post.categories[0],
    tags: post.tags,
  }
}

export function generateArticleSchema(post: BlogPost, siteUrl: string, siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.metaDescription,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${post.slug}`,
    },
    articleSection: post.categories[0],
    keywords: post.tags.join(", "),
    wordCount: post.content.replace(/<[^>]*>/g, "").split(/\s+/).length,
    timeRequired: `PT${post.readingTime || 5}M`,
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateSeriesSchema(series: Series, posts: BlogPost[], siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: series.title,
    description: series.description,
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        headline: post.title,
        url: `${siteUrl}/blog/${post.slug}`,
      },
    })),
  }
}
