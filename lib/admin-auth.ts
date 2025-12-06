// Bismillah Ar-Rahman Ar-Roheem
// Environment-based Admin Authentication

import { cookies } from "next/headers"

export interface AdminUser {
  name: string
  email: string
  role: "admin" | "editor"
}

// Parse admin credentials from env
// Format: name:email:password,name:email:password,...
function parseAdminCredentials(): Map<string, { name: string; password: string; role: "admin" | "editor" }> {
  const credentials = process.env.ADMIN_CREDENTIALS || ""
  const admins = new Map<string, { name: string; password: string; role: "admin" | "editor" }>()

  if (!credentials) return admins

  credentials.split(",").forEach((entry, index) => {
    const parts = entry.trim().split(":")
    if (parts.length >= 3) {
      const [name, email, password, role = "editor"] = parts
      admins.set(email.toLowerCase(), {
        name,
        password,
        role: index === 0 || role === "admin" ? "admin" : "editor",
      })
    }
  })

  return admins
}

// Session store (in-memory for serverless, consider Redis for production scale)
const sessions = new Map<string, { user: AdminUser; expiresAt: number }>()

export function generateSessionToken(): string {
  return crypto.randomUUID() + "-" + Date.now().toString(36)
}

export async function authenticateAdmin(
  email: string,
  password: string,
): Promise<{ token: string; user: AdminUser } | null> {
  const admins = parseAdminCredentials()
  const admin = admins.get(email.toLowerCase())

  if (!admin || admin.password !== password) {
    return null
  }

  const token = generateSessionToken()
  const user: AdminUser = {
    name: admin.name,
    email: email.toLowerCase(),
    role: admin.role,
  }

  sessions.set(token, {
    user,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })

  return { token, user }
}

export function validateAdminSession(token: string): AdminUser | null {
  const session = sessions.get(token)

  if (!session) return null

  if (Date.now() > session.expiresAt) {
    sessions.delete(token)
    return null
  }

  return session.user
}

export function logoutAdmin(token: string): void {
  sessions.delete(token)
}

export async function getAdminFromCookies(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin_session")?.value

  if (!token) return null

  return validateAdminSession(token)
}

export function isAuthorized(user: AdminUser | null, requiredRole: "admin" | "editor" = "editor"): boolean {
  if (!user) return false
  if (requiredRole === "admin") return user.role === "admin"
  return true
}
