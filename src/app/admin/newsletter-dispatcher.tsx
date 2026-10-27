'use client'

import {
  CheckIcon,
  EyeIcon,
  Loader2Icon,
  SendIcon,
  UsersIcon
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { dispatchNewsletterAction } from '@/actions/dispatch-newsletter-action'
import { CornerBrackets } from '@/components/frame'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui'
import { compilePostToMonospaceEmail } from '@/lib/email-dispatch'

export type PublishedPostOption = {
  id: string
  title: string
  description?: string | null
  content?: string | null
  tags?: string[]
  createdAt: string
  author: {
    name: string
  }
}

type NewsletterDispatcherProps = {
  subscriberCount: number
  publishedPosts: PublishedPostOption[]
}

export function NewsletterDispatcher({
  subscriberCount,
  publishedPosts
}: Readonly<NewsletterDispatcherProps>) {
  const [selectedPostId, setSelectedPostId] = useState<string>(
    publishedPosts[0]?.id ?? ''
  )
  const [isSending, setIsSending] = useState(false)
  const [lastDispatchedId, setLastDispatchedId] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const selectedPost = publishedPosts.find((p) => p.id === selectedPostId)

  const handleDispatch = async () => {
    if (!selectedPostId) {
      toast.error('Please select an article to dispatch')
      return
    }

    if (subscriberCount === 0) {
      toast.error('Cannot dispatch: No active subscribers currently in database')
      return
    }

    const confirmed = globalThis.confirm(
      `Confirm Dispatch:\n\nArticle: "${selectedPost?.title}"\nRecipients: ${subscriberCount} active subscriber(s)\n\nProceed with automated delivery?`
    )

    if (!confirmed) return

    setIsSending(true)
    try {
      const res = await dispatchNewsletterAction({ postId: selectedPostId })

      if (res?.data?.success) {
        setLastDispatchedId(selectedPostId)
        toast.success(res.data.message)
      } else {
        toast.error(res?.data?.message ?? 'Failed to dispatch newsletter')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An unexpected dispatch error occurred'
      )
    } finally {
      setIsSending(false)
    }
  }

  const renderButtonContent = () => {
    if (isSending) {
      return (
        <>
          <Loader2Icon className="size-3.5 animate-spin" />
          <span>Dispatching to Subscribers...</span>
        </>
      )
    }

    if (lastDispatchedId === selectedPostId) {
      return (
        <>
          <CheckIcon className="size-3.5" />
          <span>Dispatch Sent Successfully</span>
        </>
      )
    }

    return (
      <>
        <SendIcon className="size-3.5" />
        <span>
          Dispatch to {subscriberCount.toLocaleString()} Subscribers ↘
        </span>
      </>
    )
  }

  // Generate preview email markup
  const previewEmail = selectedPost
    ? compilePostToMonospaceEmail(
        {
          ...selectedPost,
          createdAt: new Date(selectedPost.createdAt)
        },
        {
          siteUrl: 'https://prodevopsguy.com',
          unsubscribeUrl: 'https://prodevopsguy.com/api/newsletter/unsubscribe?email=test@example.com'
        }
      )
    : null

  return (
    <div className="space-y-4">
      {/* Telemetry Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/20 p-3.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <UsersIcon className="size-4 text-foreground" />
          <span className="font-semibold text-foreground">
            {subscriberCount.toLocaleString()}
          </span>
          <span className="text-muted-foreground uppercase">
            Active Newsletter Subscribers
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="size-1.5 bg-foreground" />
          <span className="text-muted-foreground">ENGINE:</span>
          <span className="font-bold text-foreground">RESEND / SES MONOSPACE COMPILER</span>
        </div>
      </div>

      {publishedPosts.length === 0 ? (
        <div className="border border-border/80 bg-background/50 p-6 text-center font-mono text-xs text-muted-foreground">
          No published posts found. Publish an article first to dispatch via the pipeline.
        </div>
      ) : (
        <div className="space-y-4 border border-border bg-card p-4 sm:p-5">
          <div className="space-y-1.5">
            <label
              htmlFor="post-selector"
              className="block font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Select Article to Dispatch:
            </label>
            <select
              id="post-selector"
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
              className="w-full border border-border bg-background p-2.5 font-mono text-xs text-foreground outline-none focus:border-foreground"
            >
              {publishedPosts.map((post) => (
                <option key={post.id} value={post.id}>
                  {post.title} (Published: {post.createdAt.split('T')[0]})
                </option>
              ))}
            </select>
          </div>

          {selectedPost && (
            <div className="space-y-2 border border-border/70 bg-muted/20 p-3 font-mono text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>POST ID // {selectedPost.id}</span>
                <span>BY: {selectedPost.author.name}</span>
              </div>
              {selectedPost.description && (
                <p className="line-clamp-2 text-foreground/80">
                  {selectedPost.description}
                </p>
              )}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-border/80 bg-background px-1.5 py-0.2 text-[10px] text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Email Preview Trigger */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" corners>
                  <EyeIcon className="size-3.5" />
                  <span>Preview Monospace Email</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto font-mono text-xs">
                <DialogHeader>
                  <DialogTitle className="font-mono text-sm uppercase">
                    Compiled Monospace HTML Dispatch Preview
                  </DialogTitle>
                  <DialogDescription className="font-mono text-xs">
                    Subject: {previewEmail?.subject}
                  </DialogDescription>
                </DialogHeader>

                <div className="relative border border-border bg-background p-2">
                  <CornerBrackets />
                  {previewEmail && (
                    <iframe
                      srcDoc={previewEmail.html}
                      title="Email Dispatch Preview"
                      className="h-[520px] w-full border-0 bg-background"
                      sandbox="allow-same-origin"
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Dispatch Action Button */}
            <Button
              variant="default"
              corners
              onClick={handleDispatch}
              disabled={isSending || subscriberCount === 0}
            >
              {renderButtonContent()}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
