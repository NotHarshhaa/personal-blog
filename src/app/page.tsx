import { range } from '@/utils'
import { Suspense } from 'react'

import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { SITE_NAME, SITE_TOPICS } from '@/lib/constants'

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
            Hands-on tutorials and engineering notes on DevOps, cloud, platform
            engineering, AI/ML, MLOps, LLMOps, GenAI, and AI infrastructure —
            plus Kubernetes, Terraform, Docker, and AWS.
          </p>
          <ul className="flex flex-wrap gap-2 pt-1">
            {SITE_TOPICS.map((topic) => (
              <li
                key={topic}
                className="border border-border bg-background px-2.5 py-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase"
              >
                {topic}
              </li>
            ))}
          </ul>
        </FrameBody>
      </Frame>

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
