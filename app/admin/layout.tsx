import type React from "react"
// Bismillah Ar-Rahman Ar-Roheem
// Admin Layout with Sidebar Navigation

import { redirect } from "next/navigation"
import { getAdminFromCookies } from "@/lib/admin-auth"
import { AdminSidebar } from "@/components/admin/layout/sidebar"
import { AdminHeader } from "@/components/admin/layout/header"
import { AdminMobileNav } from "@/components/admin/layout/mobile-nav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminFromCookies()

  // Check if we're on the login page
  const isLoginPage = false // This will be handled by middleware

  if (!admin && !isLoginPage) {
    redirect("/admin/login")
  }

  // If on login page and already authenticated, redirect to dashboard
  if (admin && isLoginPage) {
    redirect("/admin")
  }

  // If not authenticated, just render children (login page)
  if (!admin) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <AdminSidebar admin={admin} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <AdminHeader admin={admin} />
        <main className="p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <AdminMobileNav />
    </div>
  )
}
