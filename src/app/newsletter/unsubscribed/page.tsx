'use client'

import { CheckCircle2Icon, MailXIcon } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

import { subscribeNewsletterAction } from '@/actions/subscribe-newsletter-action'
import { CornerBrackets, Frame, FrameBody, FrameHeader } from '@/components/frame'
import { Button, toast } from '@/components/ui'

function UnsubscribedContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resubscribed, setResubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResubscribe = async () => {
    if (!email) return
    setLoading(true)
    try {
      const res = await subscribeNewsletterAction({ email })
      if (res?.data?.success) {
        setResubscribed(true)
        toast.success(res.data.message)
      } else {
        toast.error('Failed to reactivate subscription')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getConfirmationMessage = () => {
    if (resubscribed) {
      return `You are once again subscribed with ${email}.`
    }
    if (email) {
      return `${email} has been safely removed from our automated dispatch list.`
    }
    return 'Your email address has been safely removed from our dispatch list.'
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-12">
      <Frame>
        <CornerBrackets />
        <FrameHeader label="DISPATCH PROTOCOL // STATUS">
          <span className="font-mono text-[10px] text-muted-foreground uppercase">
            STATUS: 200 OK
          </span>
        </FrameHeader>
        <FrameBody className="space-y-4 text-center">
          <div className="mx-auto flex size-12 items-center justify-center border border-border bg-muted/30">
            {resubscribed ? (
              <CheckCircle2Icon className="size-6 text-foreground" />
            ) : (
              <MailXIcon className="size-6 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-1">
            <h1 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {resubscribed ? 'Subscription Reactivated' : 'Unsubscribe Confirmed'}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">
              {getConfirmationMessage()}
            </p>
          </div>

          <div className="border-t border-border/80 pt-4">
            {resubscribed ? (
              <Button asChild variant="default" corners>
                <Link href="/">Return to Homepage ↘</Link>
              </Button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {email && (
                  <Button
                    variant="outline"
                    corners
                    onClick={handleResubscribe}
                    disabled={loading}
                  >
                    {loading ? 'Reactivating...' : 'Did this by mistake? Resubscribe'}
                  </Button>
                )}
                <Button asChild variant="ghost">
                  <Link href="/">Back to Blog ↗</Link>
                </Button>
              </div>
            )}
          </div>
        </FrameBody>
      </Frame>
    </div>
  )
}

export default function UnsubscribedPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center font-mono text-xs text-muted-foreground">
          CALIBRATING STATUS...
        </div>
      }
    >
      <UnsubscribedContent />
    </Suspense>
  )
}
