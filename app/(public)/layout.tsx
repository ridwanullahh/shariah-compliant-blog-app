import type React from "react"
import type { Metadata } from "next"
import { PublicHeader } from "@/components/public/layout/header"
import { PublicFooter } from "@/components/public/layout/footer"
import { NewsletterPopup } from "@/components/public/engagement/newsletter-popup"

export const metadata: Metadata = {
  title: {
    default: "Shariah Compliant Blog",
    template: "%s | Shariah Compliant Blog",
  },
  description: "Authentic Islamic knowledge and guidance for modern Muslims",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Shariah Compliant Blog",
  },
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <NewsletterPopup />
    </div>
  )
}
