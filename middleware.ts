// Bismillah Ar-Rahman Ar-Roheem
// Middleware for admin authentication

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes protection
  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get("admin_session")?.value
    const isLoginPage = pathname === "/admin/login"

    // If no session and not on login page, redirect to login
    if (!sessionToken && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If has session and on login page, redirect to dashboard
    if (sessionToken && isLoginPage) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
