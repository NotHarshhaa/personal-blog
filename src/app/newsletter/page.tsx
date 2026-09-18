import type { Metadata } from 'next'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import NewsletterCard from '@/components/newsletter-card'

export const metadata: Metadata = {
  title: 'DevOps & AI Newsletter Dispatch',
  description:
    'Subscribe to the bi-weekly technical engineering dispatch on Kubernetes, Cloud Infrastructure, and LLMOps.'
}

const NewsletterPage = () => {
  return (
    <div className="relative z-10 w-full space-y-6 sm:space-y-8">
      <Frame as="header">
        <FrameHeader label="Community" />
        <FrameBody className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Technical Engineering Dispatch
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Detailed architectures, system diagrams, and real-world post-mortems
            delivered directly to your inbox.
          </p>
        </FrameBody>
      </Frame>

      <NewsletterCard />
    </div>
  )
}

export default NewsletterPage
