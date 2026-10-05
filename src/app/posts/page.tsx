import type { Metadata } from 'next'

import { Suspense } from 'react'

import { Frame, FrameHeader } from '@/components/frame'
import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'
import { range } from '@/utils'

export const metadata: Metadata = {
  title: 'Posts',
  description:
    'Browse every dispatch across DevOps, cloud, platform engineering, AI/ML, MLOps, LLMOps, and GenAI — filter by topic or search the archive.'
}

const PostsPage = () => {
  return (
    <div className='relative z-10 w-full space-y-6 sm:space-y-8'>
      <section aria-label='All posts'>
        <Suspense
          fallback={
            <Frame>
              <FrameHeader label='Latest posts' />
              <div className='divide-border divide-y'>
                {range(9).map((i) => (
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

export default PostsPage
