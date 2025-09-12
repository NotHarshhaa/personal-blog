import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'
import { getPosts } from '@/queries/get-posts'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const { posts } = await getPosts()

    const staticPages = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${SITE_URL}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.5,
        },
    ]

    const postPages = posts.map((post) => ({
        url: `${SITE_URL}/posts/${post.id}`,
        lastModified: new Date(post.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const userPages = posts.map((post) => ({
        url: `${SITE_URL}/users/${post.user.id}`,
        lastModified: new Date(post.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...staticPages, ...postPages, ...userPages]
}
