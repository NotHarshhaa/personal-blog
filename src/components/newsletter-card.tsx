'use client'

import { CheckCircleIcon, MailIcon, SendIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { subscribeNewsletterAction } from '@/actions/subscribe-newsletter-action'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'

export const NewsletterCard = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return

    setLoading(true)
    try {
      const res = await subscribeNewsletterAction({ email })
      if (res?.data?.success) {
        setSubscribed(true)
        toast.success(res.data.message)
      } else {
        toast.error(res?.serverError ?? 'Failed to subscribe. Please try again.')
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Frame as="section" aria-label="Newsletter subscription">
      <FrameHeader label="Dispatch">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <MailIcon className="size-3.5" />
          <span>Bi-weekly Notes</span>
        </div>
      </FrameHeader>
      <FrameBody className="space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            DevOps & AI Architecture Dispatch
          </h2>
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Join engineers receiving hands-on writeups on Kubernetes clustering,
            Terraform GitOps, distributed ML infrastructure, and low-latency
            LLMOps. No marketing fluff—strictly technical notes.
          </p>
        </div>

        {subscribed ? (
          <div className="flex items-center gap-2 border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="size-4 shrink-0" />
            <span className="font-mono text-xs">
              Subscription verified! You are on the dispatch list.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@company.com"
                className="h-10 w-full border border-border bg-background px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-foreground"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 border border-border bg-foreground px-5 font-mono text-xs font-semibold uppercase tracking-wider text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
            >
              <SendIcon className="size-3.5" />
              <span>{loading ? 'Joining...' : 'Subscribe'}</span>
            </button>
          </form>
        )}
      </FrameBody>
    </Frame>
  )
}

export default NewsletterCard
