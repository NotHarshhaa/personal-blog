import type { Metadata } from 'next'

import { Suspense } from 'react'

import { Frame, FrameHeader } from '@/components/frame'
import Snippets from '@/components/snippets/snippets'
import SnippetsPlaceholder from '@/components/snippets/snippets-placeholder'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Snippet Vault',
  description:
    'A lightweight feed of 30-second, battle-tested configs — kubectl JSONPath queries, Terraform state surgery, GPG/Git signing fixes, and Docker multi-stage optimizations. Copy raw or pipe straight into your shell with curl.',
  alternates: {
    canonical: `${SITE_URL}/snippets`,
    types: {
      'application/rss+xml': [{ url: '/snippets/feed.xml', title: 'Snippet Vault RSS Feed' }]
    }
  }
}

type SnippetsPageProps = {
  searchParams: Promise<{
    tag?: string
  }>
}

const SnippetsPage = async (props: SnippetsPageProps) => {
  const { tag } = await props.searchParams

  return (
    <div className='relative z-10 w-full space-y-6 sm:space-y-8'>
      <section aria-label='Snippet vault'>
        <Suspense
          fallback={
            <Frame>
              <FrameHeader label='CLI Vault // Micro-dispatches' />
              <SnippetsPlaceholder />
            </Frame>
          }
        >
          <Frame>
            <FrameHeader label='CLI Vault // Micro-dispatches'>
              <p className='text-muted-foreground hidden font-mono text-[10px] tracking-wider uppercase md:block'>
                30-second fixes · copy raw · curl-ready
              </p>
            </FrameHeader>
            <div className='p-4 sm:p-5'>
              <Snippets tag={tag} />
            </div>
          </Frame>
        </Suspense>
      </section>
    </div>
  )
}

export default SnippetsPage
