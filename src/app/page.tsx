import { range } from '@/utils'
import { Suspense } from 'react'

import Posts from '@/components/posts'
import PostsPlaceholder from '@/components/posts-placeholder'

const HomePage = () => {
  return (
    <Suspense
      fallback={(range(10) as number[]).map((i) => (
        <PostsPlaceholder key={i} />
      ))}
    >
      <Posts />
    </Suspense>
  )
}

export default HomePage
