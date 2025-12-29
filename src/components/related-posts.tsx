import PostCard from '@/components/post-card'
import { getCurrentUser } from '@/lib/auth'
import { getPosts } from '@/queries/get-posts'

type RelatedPostsProps = {
  currentPostId: string
  currentPostTitle: string
  currentPostDescription?: string | null
}

const RelatedPosts = async ({ currentPostId, currentPostTitle, currentPostDescription }: RelatedPostsProps) => {
  const user = await getCurrentUser()
  const { posts } = await getPosts()

  // Filter out current post and find related posts
  const relatedPosts = posts
    .filter((post) => post.id !== currentPostId)
    .map((post) => {
      // Simple similarity scoring based on title and description
      const titleWords = currentPostTitle.toLowerCase().split(/\s+/)
      const postTitleWords = post.title.toLowerCase().split(/\s+/)
      const commonTitleWords = titleWords.filter((word) => postTitleWords.includes(word)).length

      const description = currentPostDescription?.toLowerCase() || ''
      const postDescription = post.description?.toLowerCase() || ''
      const descriptionMatch = description && postDescription ? 
        (postDescription.includes(description.substring(0, 20)) ? 2 : 0) : 0

      return {
        post: {
          ...post,
          createdAt: new Date(post.createdAt)
        },
        score: commonTitleWords + descriptionMatch
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.post)

  if (relatedPosts.length === 0) return null

  return (
    <div className="mt-16 border-t border-border/10 pt-12">
      <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {relatedPosts.map((post) => (
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
    </div>
  )
}

export default RelatedPosts

