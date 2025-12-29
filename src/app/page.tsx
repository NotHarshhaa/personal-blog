import { range } from '@/utils'
import { Suspense } from 'react'

import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'

const HomePage = () => {
  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="space-y-4">
            {(range(10) as number[]).map((i) => (
              <PostsPlaceholder key={i} />
            ))}
          </div>
        }
      >
        <Posts />
      </Suspense>
    </div>
  )
}

export default HomePage
