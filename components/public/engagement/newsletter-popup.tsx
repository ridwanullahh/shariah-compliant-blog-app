"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Mail, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("newsletter-popup-seen")
    const lastSeen = localStorage.getItem("newsletter-popup-last-seen")

    // Show popup after 30 seconds if not dismissed or not seen in 7 days
    const shouldShow = !hasSeenPopup || (lastSeen && Date.now() - Number.parseInt(lastSeen) > 7 * 24 * 60 * 60 * 1000)

    if (shouldShow) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 30000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("newsletter-popup-seen", "true")
    localStorage.setItem("newsletter-popup-last-seen", Date.now().toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        toast.success("Jazakallahu Khairan! You have been subscribed.")
        handleDismiss()
      } else {
        toast.error("Failed to subscribe. Please try again.")
      }
    } catch {
      toast.error("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Popup */}
      <div
        className={cn(
          "relative w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border p-6",
          "animate-in slide-in-from-bottom-4 duration-300",
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Stay Connected</h3>
          <p className="text-muted-foreground text-sm">
            Subscribe to receive the latest Islamic insights and knowledge directly in your inbox.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="pl-10 h-12 rounded-xl"
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">We respect your privacy. Unsubscribe anytime.</p>
      </div>
    </div>
  )
}
