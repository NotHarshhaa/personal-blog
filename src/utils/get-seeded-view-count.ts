const FNV_OFFSET = 2166136261
const FNV_PRIME = 16777619

const hashString = (value: string) => {
  let hash = FNV_OFFSET

  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, FNV_PRIME)
  }

  return hash >>> 0
}

export const getSeededViewCount = (postId: string, createdAt: Date) => {
  const hash = hashString(postId)
  const daysOnline = Math.max(
    1,
    Math.floor((Date.now() - createdAt.getTime()) / 86_400_000)
  )
  const base = 1800 + (hash % 6200)
  const daily = 9 + (hash % 22)

  return base + daysOnline * daily
}

export const getDisplayViewCount = (
  postId: string,
  createdAt: Date,
  storedViews: number,
  published = true
) => {
  if (storedViews > 0) {
    return storedViews
  }

  if (!published) {
    return 0
  }

  return getSeededViewCount(postId, createdAt)
}

export const getDisplayLikeCount = (
  postId: string,
  views: number,
  realLikes: number,
  published = true
) => {
  if (!published || views <= 0) {
    return realLikes
  }

  const hash = hashString(`likes-${postId}`)
  const rate = 0.08 + (hash % 70) / 1000

  return Math.round(views * rate) + realLikes
}

export const withPostEngagement = <
  T extends {
    id: string
    createdAt: Date
    views: number
    published?: boolean
    likes: Array<unknown>
  }
>(
  post: T
) => {
  const published = post.published ?? true
  const views = getDisplayViewCount(post.id, post.createdAt, post.views, published)
  const likeCount = getDisplayLikeCount(
    post.id,
    views,
    post.likes.length,
    published
  )

  return {
    ...post,
    views,
    likeCount
  }
}
