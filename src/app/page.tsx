import { range } from '@/utils'
import { Suspense } from 'react'

import HacktronHero from '@/components/hacktron-hero'
import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'
import TrendingPosts from '@/components/trending-posts'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'

const HomePage = () => {
  return (
    <div className="relative z-10 w-full space-y-6 sm:space-y-8">
      <HacktronHero />

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
