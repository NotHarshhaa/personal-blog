import { range } from '@/utils'
import Link from 'next/link'
import { Suspense } from 'react'

import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'
import TrendingPosts from '@/components/trending-posts'
import TypingAnimation from '@/components/typing-animation'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { SITE_NAME, SITE_TOPICS } from '@/lib/constants'

const TYPING_WORDS = [
  'Kubernetes',
  'Terraform',
  'LLMOps',
  'GenAI',
  'Docker',
  'MLOps',
  'Platform Eng',
  'AWS'
] as const

const HomePage = () => {
  return (
    <div className="relative z-10 w-full space-y-6 sm:space-y-8">
      <Frame as="header">
        <FrameHeader label="Blog" />
        <FrameBody className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {SITE_NAME}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hands-on tutorials and engineering notes on{' '}
            <TypingAnimation
              words={TYPING_WORDS}
              className="font-semibold text-foreground"
            />
          </p>
          <ul className="flex flex-wrap gap-2 pt-1" aria-label="Explore topics">
            {SITE_TOPICS.map((topic) => (
              <li key={topic}>
                <Link
                  href={`/?tag=${encodeURIComponent(topic)}`}
                  className="inline-block border border-border bg-background px-2.5 py-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase transition-colors hover:border-foreground hover:text-foreground"
                >
                  {topic}
                </Link>
              </li>
            ))}
          </ul>
        </FrameBody>
      </Frame>

      <Suspense
        fallback={
          <Frame>
            <FrameHeader label="Trending" />
            <FrameBody className="py-8 text-center text-sm text-muted-foreground">
              Loading trending posts...
            </FrameBody>
          </Frame>
        }
      >
        <TrendingPosts />
      </Suspense>

      <section aria-label="Posts">
        <Suspense
          fallback={
            <Frame>
              <FrameHeader label="Latest posts" />
              <div className="divide-y divide-border">
                {(range(6) as number[]).map((i) => (
                  <PostsPlaceholder key={i} />
                ))}
              </div>
            </Frame>
          }
        >
          <Posts />
        </Suspense>
      </section>
    </div>
  )
}

export default HomePage
