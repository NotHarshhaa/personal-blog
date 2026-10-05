import { type MetadataRoute } from 'next'

import { SITE_URL } from '@/lib/constants'
import { getPosts } from '@/queries/get-posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts } = await getPosts()

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1
    },
    {
      url: `${SITE_URL}/posts`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9
    },
    {
      url: `${SITE_URL}/newsletter`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6
    },
    {
      url: `${SITE_URL}/roadmaps`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5
    }
  ]

  const postPages = posts.map((post) => ({
    url: `${SITE_URL}/posts/${post.id}`,
    lastModified: new Date(post.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  // One entry per author, not per post
  const authorIds = [...new Set(posts.map((post) => post.user.id))]
  const authorPages = authorIds.map((id) => ({
    url: `${SITE_URL}/users/${id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }))

  return [...staticPages, ...postPages, ...authorPages]
}
