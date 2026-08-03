import PostCard from '@/components/post-card'
import { Frame, FrameHeader } from '@/components/frame'
import { getCurrentUser } from '@/lib/auth'
import { getPosts } from '@/queries/get-posts'

type RelatedPostsProps = {
  currentPostId: string
  currentPostTitle: string
  currentPostDescription?: string | null
}

const RelatedPosts = async ({
  currentPostId,
  currentPostTitle,
  currentPostDescription
}: RelatedPostsProps) => {
  const user = await getCurrentUser()
  const { posts } = await getPosts()

  const relatedPosts = posts
    .filter((post) => post.id !== currentPostId)
    .map((post) => {
      const titleWords = currentPostTitle.toLowerCase().split(/\s+/)
      const postTitleWords = post.title.toLowerCase().split(/\s+/)
      const commonTitleWords = titleWords.filter((word) =>
        postTitleWords.includes(word)
      ).length

      const description = currentPostDescription?.toLowerCase() || ''
      const postDescription = post.description?.toLowerCase() || ''
      const descriptionMatch =
        description && postDescription
          ? postDescription.includes(description.substring(0, 20))
            ? 2
            : 0
          : 0

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
    <Frame>
      <FrameHeader label="Related posts" />
      <div className="divide-y divide-border">
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
    </Frame>
  )
}

export default RelatedPosts
