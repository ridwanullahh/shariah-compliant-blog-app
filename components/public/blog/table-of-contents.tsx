"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface Heading {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  headings: Heading[]
  onSelect?: () => void
}

export function TableOfContents({ headings, onSelect }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-100px 0% -80% 0%",
      },
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
      onSelect?.()
    }
  }

  if (headings.length === 0) {
    return <p className="text-sm text-muted-foreground">No headings found</p>
  }

  return (
    <nav className="space-y-1">
      {headings.map((heading) => (
        <button
          key={heading.id}
          onClick={() => handleClick(heading.id)}
          className={cn(
            "block w-full text-left text-sm py-1.5 transition-colors hover:text-primary",
            heading.level === 3 && "pl-4",
            heading.level === 4 && "pl-8",
            activeId === heading.id ? "text-primary font-medium" : "text-muted-foreground",
          )}
        >
          {heading.text}
        </button>
      ))}
    </nav>
  )
}
