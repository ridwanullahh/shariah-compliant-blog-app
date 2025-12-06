"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { getVisitorId } from "@/lib/utils/visitor"

const reactions = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "insightful", emoji: "💡", label: "Insightful" },
  { type: "mashallah", emoji: "🤲", label: "Masha'Allah" },
  { type: "jazak", emoji: "🙏", label: "Jazak'Allah" },
]

interface ReactionsBarProps {
  postId: string
}

export function ReactionsBar({ postId }: ReactionsBarProps) {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [userReaction, setUserReaction] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [visitorId, setVisitorId] = useState<string>("")

  useEffect(() => {
    // Get visitor ID on client
    const id = getVisitorId()
    setVisitorId(id)

    // Load reaction counts
    fetch(`/api/posts/${postId}/reactions`, {
      headers: { "x-visitor-id": id },
    })
      .then((res) => res.json())
      .then((data) => {
        setCounts(data.counts || {})
        setUserReaction(data.userReaction || null)
      })
      .catch(console.error)
  }, [postId])

  const handleReaction = async (type: string) => {
    if (isLoading) return

    // Optimistic update
    const prevCounts = { ...counts }
    const prevReaction = userReaction

    if (userReaction === type) {
      // Removing reaction
      setCounts((prev) => ({
        ...prev,
        [type]: Math.max(0, (prev[type] || 0) - 1),
      }))
      setUserReaction(null)
    } else {
      // Adding or changing reaction
      if (userReaction) {
        setCounts((prev) => ({
          ...prev,
          [userReaction]: Math.max(0, (prev[userReaction] || 0) - 1),
          [type]: (prev[type] || 0) + 1,
        }))
      } else {
        setCounts((prev) => ({
          ...prev,
          [type]: (prev[type] || 0) + 1,
        }))
      }
      setUserReaction(type)
    }

    setIsLoading(true)
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, visitorId }),
      })

      if (!res.ok) throw new Error("Failed")

      const data = await res.json()
      setCounts(data.counts)
      setUserReaction(data.userReaction)
    } catch (error) {
      // Revert on error
      setCounts(prevCounts)
      setUserReaction(prevReaction)
      toast.error("Failed to save reaction")
    } finally {
      setIsLoading(false)
    }
  }

  const totalReactions = Object.values(counts).reduce((sum, count) => sum + count, 0)

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {reactions.map((reaction) => {
        const count = counts[reaction.type] || 0
        const isSelected = userReaction === reaction.type

        return (
          <Button
            key={reaction.type}
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 px-3 rounded-full transition-all",
              isSelected && "bg-primary/10 ring-1 ring-primary/20",
              count > 0 && !isSelected && "bg-muted/50",
            )}
            onClick={() => handleReaction(reaction.type)}
            disabled={isLoading}
            title={reaction.label}
          >
            <span className="text-base mr-1">{reaction.emoji}</span>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </Button>
        )
      })}

      {totalReactions > 0 && (
        <span className="text-xs text-muted-foreground ml-2">
          {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
        </span>
      )}
    </div>
  )
}
