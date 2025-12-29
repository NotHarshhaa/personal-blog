import EmptyState from '@/components/empty-state'
import PostsFilter from '@/components/posts-filter'
import { getCurrentUser } from '@/lib/auth'
import { getPosts } from '@/queries/get-posts'

const Posts = async () => {
  const user = await getCurrentUser()
  const { posts } = await getPosts()

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="Be the first to share your DevOps and Cloud insights with the community. Start writing and sharing your knowledge!"
        showAction={false}
      />
    )
  }

  // Convert dates for client component
  const postsWithDates = posts.map((post) => ({
    ...post,
    createdAt: new Date(post.createdAt)
  }))

  return (
    <PostsFilter
      posts={postsWithDates}
      user={
        user
          ? {
              ...user,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt)
            }
          : null
      }
    />
  )
}

export default Posts
