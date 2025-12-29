import PostCard from '@/components/post-card'
import EmptyState from '@/components/empty-state'
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

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
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
      ))}
    </div>
  )
}

export default Posts
