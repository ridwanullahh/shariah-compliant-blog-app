// Bismillah Ar-Rahman Ar-Roheem
// Visitor identification utilities

export function getVisitorId(): string {
  if (typeof window === "undefined") return ""

  let visitorId = localStorage.getItem("blog_visitor_id")

  if (!visitorId) {
    visitorId = crypto.randomUUID()
    localStorage.setItem("blog_visitor_id", visitorId)
  }

  return visitorId
}

export function getVisitorPreferences(): {
  theme: "light" | "dark" | "system"
  fontSize: "small" | "medium" | "large"
  layout: "grid" | "list" | "masonry"
} {
  if (typeof window === "undefined") {
    return { theme: "system", fontSize: "medium", layout: "grid" }
  }

  const stored = localStorage.getItem("blog_preferences")
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Invalid stored data
    }
  }

  return { theme: "system", fontSize: "medium", layout: "grid" }
}

export function setVisitorPreferences(
  prefs: Partial<{
    theme: "light" | "dark" | "system"
    fontSize: "small" | "medium" | "large"
    layout: "grid" | "list" | "masonry"
  }>,
): void {
  if (typeof window === "undefined") return

  const current = getVisitorPreferences()
  const updated = { ...current, ...prefs }
  localStorage.setItem("blog_preferences", JSON.stringify(updated))
}
