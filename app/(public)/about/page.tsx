// Bismillah Ar-Rahman Ar-Roheem

import type { Metadata } from "next"
import { BookOpen, Users, Heart, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "About Us | Shariah Blog",
  description: "Learn about our mission to provide authentic Islamic knowledge for modern Muslims.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Bismillah Ar-Rahman Ar-Roheem</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Spreading authentic Islamic knowledge with wisdom and beautiful preaching, following the Quran and Sunnah
              upon the understanding of the righteous predecessors.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We are dedicated to providing Shariah-compliant content that educates, inspires, and guides Muslims in
                  their daily lives. Our goal is to make authentic Islamic knowledge accessible to everyone.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Every article is carefully researched and reviewed to ensure it aligns with the teachings of the Quran
                  and authentic Sunnah, presented in a manner suitable for contemporary understanding.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl border border-border p-6 text-center">
                  <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold">100+</p>
                  <p className="text-sm text-muted-foreground">Articles</p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold">10K+</p>
                  <p className="text-sm text-muted-foreground">Readers</p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 text-center">
                  <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold">15+</p>
                  <p className="text-sm text-muted-foreground">Series</p>
                </div>
                <div className="bg-card rounded-2xl border border-border p-6 text-center">
                  <Star className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-sm text-muted-foreground">Topics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📖</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Authenticity</h3>
                <p className="text-muted-foreground text-sm">
                  All content is based on the Quran and authentic Hadith with proper references.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Clarity</h3>
                <p className="text-muted-foreground text-sm">
                  Complex topics explained in simple, understandable language for all.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💚</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">Compassion</h3>
                <p className="text-muted-foreground text-sm">
                  Gentle approach with wisdom, following the prophetic methodology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Journey</h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter and be part of our growing community of knowledge seekers.
            </p>
            <p className="text-sm text-muted-foreground">
              La hawla wa la quwwata illa billah
              <br />
              Hasbiyallahu la ilaha illa Huwa, alayhi tawakkaltu
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
