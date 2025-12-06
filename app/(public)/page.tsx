import Link from "next/link"
import { ArrowRight, BookOpen, Users, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeaturedPosts } from "@/components/public/posts/featured-posts"
import { LatestPosts } from "@/components/public/posts/latest-posts"
import { PopularCategories } from "@/components/public/categories/popular-categories"
import { TrendingSeries } from "@/components/public/series/trending-series"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Star className="h-4 w-4" />
              Bismillah Ar-Rahman Ar-Roheem
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
              Authentic Islamic Knowledge for <span className="text-primary">Modern Muslims</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed text-pretty">
              Explore Shariah-compliant content that educates, inspires, and guides the Ummah with authentic knowledge
              rooted in the Quran and Sunnah.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="rounded-xl h-12 px-8">
                <Link href="/blog">
                  Explore Blog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl h-12 px-8 bg-transparent">
                <Link href="/series">Browse Series</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto mt-16">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl md:text-3xl font-bold">100+</p>
              <p className="text-sm text-muted-foreground">Articles</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-accent-foreground" />
              </div>
              <p className="text-2xl md:text-3xl font-bold">10K+</p>
              <p className="text-sm text-muted-foreground">Readers</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <p className="text-2xl md:text-3xl font-bold">15+</p>
              <p className="text-sm text-muted-foreground">Series</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Featured Posts</h2>
              <p className="text-muted-foreground mt-1">Hand-picked articles for you</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/blog?featured=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <FeaturedPosts />
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Categories</h2>
            <p className="text-muted-foreground mt-1">Browse by topic</p>
          </div>
          <PopularCategories />
        </div>
      </section>

      {/* Trending Series */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Trending Series</h2>
              <p className="text-muted-foreground mt-1">Deep dive into topics</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/series">
                All Series
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <TrendingSeries />
        </div>
      </section>

      {/* Latest Posts */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Latest Posts</h2>
              <p className="text-muted-foreground mt-1">Fresh content from our blog</p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href="/blog">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <LatestPosts />
          <div className="text-center mt-8 sm:hidden">
            <Button asChild variant="outline">
              <Link href="/blog">
                View All Posts
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-card rounded-3xl border border-border p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-6">
              Get weekly Islamic insights delivered straight to your inbox. Join thousands of Muslims on their journey
              of knowledge.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 h-12 px-4 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" className="h-12 px-6 rounded-xl">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
