"use client"

import type React from "react"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { MessageCircle, Reply, ChevronDown, ChevronUp, Send, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { getVisitorId } from "@/lib/utils/visitor"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface Comment {
  id: string
  name: string
  email: string
  content: string
  createdAt: string
  status: "pending" | "approved" | "rejected"
  parentId?: string
  replies?: Comment[]
  visitorId?: string
}

interface CommentsSectionProps {
  postId: string
}

interface CommentFormProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  isReply?: boolean
}

function CommentForm({ postId, parentId, onSuccess, onCancel, isReply = false }: CommentFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveInfo, setSaveInfo] = useState(true)

  // Load saved commenter info
  useEffect(() => {
    const saved = localStorage.getItem("commenter_info")
    if (saved) {
      const { name: savedName, email: savedEmail } = JSON.parse(saved)
      setName(savedName || "")
      setEmail(savedEmail || "")
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !content.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      const visitorId = getVisitorId()

      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          content: content.trim(),
          parentId,
          visitorId,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to submit comment")
      }

      // Save commenter info if requested
      if (saveInfo) {
        localStorage.setItem("commenter_info", JSON.stringify({ name, email }))
      }

      toast.success("Comment submitted! It will appear after moderation.")
      setContent("")
      mutate(`/api/posts/${postId}/comments`)
      onSuccess?.()
    } catch (error) {
      toast.error("Failed to submit comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", isReply && "ml-8 mt-4 p-4 bg-muted/50 rounded-lg")}>
      {isReply && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Reply to comment</span>
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`name-${parentId || "main"}`}>Name</Label>
          <Input
            id={`name-${parentId || "main"}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`email-${parentId || "main"}`}>Email</Label>
          <Input
            id={`email-${parentId || "main"}`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`content-${parentId || "main"}`}>Comment</Label>
        <Textarea
          id={`content-${parentId || "main"}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={isReply ? 3 : 4}
          required
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={saveInfo}
            onChange={(e) => setSaveInfo(e.target.checked)}
            className="rounded border-border"
          />
          Remember my info
        </label>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {isReply ? "Reply" : "Post Comment"}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

interface CommentItemProps {
  comment: Comment & { replies?: Comment[] }
  postId: string
  depth?: number
}

function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(depth === 0)
  const [isReplying, setIsReplying] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0
  const maxDepth = 3

  return (
    <div className={cn("group", depth > 0 && "ml-8 pl-4 border-l-2 border-border")}>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{comment.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
            </div>

            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-2 mt-2">
              {depth < maxDepth && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setIsReplying(!isReplying)}
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}

              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowReplies(!showReplies)}
                >
                  {showReplies ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide replies
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      {comment.replies?.length} {comment.replies?.length === 1 ? "reply" : "replies"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {isReplying && (
          <CommentForm
            postId={postId}
            parentId={comment.id}
            isReply
            onSuccess={() => setIsReplying(false)}
            onCancel={() => setIsReplying(false)}
          />
        )}
      </div>

      {hasReplies && showReplies && (
        <div className="space-y-0">
          {comment.replies?.map((reply) => (
            <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { data, isLoading } = useSWR(`/api/posts/${postId}/comments`, fetcher)
  const [showForm, setShowForm] = useState(false)

  const comments: Comment[] = data?.comments || []
  const approvedComments = comments.filter((c) => c.status === "approved")

  // Build comment tree
  const commentTree = approvedComments.reduce(
    (acc, comment) => {
      if (!comment.parentId) {
        const replies = approvedComments.filter((c) => c.parentId === comment.id)
        acc.push({ ...comment, replies })
      }
      return acc
    },
    [] as (Comment & { replies: Comment[] })[],
  )

  return (
    <section id="comments" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          Comments
          {approvedComments.length > 0 && (
            <span className="text-lg font-normal text-muted-foreground">({approvedComments.length})</span>
          )}
        </h2>

        {!showForm && <Button onClick={() => setShowForm(true)}>Leave a Comment</Button>}
      </div>

      {showForm && (
        <div className="p-6 bg-muted/30 rounded-lg border border-border">
          <h3 className="font-semibold mb-4">Join the Discussion</h3>
          <CommentForm postId={postId} onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-2/3 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : commentTree.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No comments yet. Be the first to share your thoughts!</p>
          {!showForm && (
            <Button variant="outline" onClick={() => setShowForm(true)}>
              Write a Comment
            </Button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {commentTree.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </div>
      )}
    </section>
  )
}
