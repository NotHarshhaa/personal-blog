import { range } from '@/utils'
import { Suspense } from 'react'

import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'

const HomePage = () => {
  return (
    <div className="relative z-10 w-full space-y-6 sm:space-y-8">
      <Frame as="header">
        <FrameHeader label="Blog" />
        <FrameBody className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            DevOps & Cloud Space
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hands-on tutorials, engineering notes, and practical write-ups on
            Kubernetes, Terraform, Docker, AWS, and modern infrastructure.
          </p>
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
