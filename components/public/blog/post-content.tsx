"use client"

import { useEffect, useRef } from "react"
import { marked } from "marked"
import DOMPurify from "dompurify"

interface PostContentProps {
  content: string
  contentType?: "html" | "markdown"
}

export function PostContent({ content, contentType = "html" }: PostContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return

    // Process the content
    let processedContent = content

    if (contentType === "markdown") {
      processedContent = marked.parse(content) as string
    }

    // Sanitize HTML
    const cleanContent = DOMPurify.sanitize(processedContent, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
    })

    contentRef.current.innerHTML = cleanContent

    // Add IDs to headings for TOC
    const headings = contentRef.current.querySelectorAll("h2, h3, h4, h5, h6")
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index}`
      }
    })

    // Add lazy loading to images
    const images = contentRef.current.querySelectorAll("img")
    images.forEach((img) => {
      img.loading = "lazy"
      img.classList.add("rounded-xl", "my-6")
    })

    // Style links
    const links = contentRef.current.querySelectorAll("a")
    links.forEach((link) => {
      link.classList.add("text-primary", "hover:underline")
      if (link.hostname !== window.location.hostname) {
        link.target = "_blank"
        link.rel = "noopener noreferrer"
      }
    })

    // Style code blocks
    const codeBlocks = contentRef.current.querySelectorAll("pre")
    codeBlocks.forEach((block) => {
      block.classList.add("bg-muted", "rounded-xl", "p-4", "overflow-x-auto", "my-6")
    })

    // Style inline code
    const inlineCodes = contentRef.current.querySelectorAll("code:not(pre code)")
    inlineCodes.forEach((code) => {
      code.classList.add("bg-muted", "px-1.5", "py-0.5", "rounded", "text-sm", "font-mono")
    })

    // Style blockquotes
    const blockquotes = contentRef.current.querySelectorAll("blockquote")
    blockquotes.forEach((quote) => {
      quote.classList.add("border-l-4", "border-primary", "pl-4", "italic", "my-6", "text-muted-foreground")
    })

    // Style lists
    const lists = contentRef.current.querySelectorAll("ul, ol")
    lists.forEach((list) => {
      list.classList.add("my-4", "ml-6")
      if (list.tagName === "UL") {
        list.classList.add("list-disc")
      } else {
        list.classList.add("list-decimal")
      }
    })

    // Style paragraphs
    const paragraphs = contentRef.current.querySelectorAll("p")
    paragraphs.forEach((p) => {
      p.classList.add("my-4", "leading-relaxed")
    })

    // Style headings
    const h2s = contentRef.current.querySelectorAll("h2")
    h2s.forEach((h) => {
      h.classList.add("text-2xl", "font-bold", "mt-10", "mb-4")
    })

    const h3s = contentRef.current.querySelectorAll("h3")
    h3s.forEach((h) => {
      h.classList.add("text-xl", "font-bold", "mt-8", "mb-3")
    })

    const h4s = contentRef.current.querySelectorAll("h4")
    h4s.forEach((h) => {
      h.classList.add("text-lg", "font-semibold", "mt-6", "mb-2")
    })
  }, [content, contentType])

  return <div ref={contentRef} className="prose prose-lg max-w-none dark:prose-invert" />
}
