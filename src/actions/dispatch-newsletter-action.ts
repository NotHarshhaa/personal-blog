'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { db } from '@/db'
import { posts, subscribers } from '@/db/schema'
import { sendNewsletterDispatch } from '@/lib/email-dispatch'
import { authenticatedActionClient } from '@/lib/safe-action'

const dispatchNewsletterSchema = z.object({
  postId: z.string().min(1, 'Post ID is required')
})

export const dispatchNewsletterAction = authenticatedActionClient
  .schema(dispatchNewsletterSchema)
  .action(async ({ parsedInput: { postId }, ctx: { user } }) => {
    if (user.role !== 'admin') {
      throw new Error('Unauthorized: Admin privileges required to dispatch newsletter')
    }

    // 1. Fetch target post
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      with: {
        user: {
          columns: {
            name: true
          }
        }
      }
    })

    if (!post) {
      throw new Error('Post not found')
    }

    if (!post.published) {
      throw new Error('Cannot dispatch draft posts. Please publish the post first.')
    }

    // 2. Fetch all active subscribers
    const activeSubscribers = await db.query.subscribers.findMany({
      where: eq(subscribers.subscribed, true),
      columns: {
        email: true
      }
    })

    const emails = activeSubscribers.map((s) => s.email)

    const siteUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

    // 3. Dispatch via email engine
    const result = await sendNewsletterDispatch(
      {
        id: post.id,
        title: post.title,
        description: post.description,
        content: post.content,
        tags: post.tags,
        createdAt: post.createdAt,
        author: {
          name: post.user.name
        }
      },
      emails,
      {
        siteUrl
      }
    )

    revalidatePath('/admin')
    revalidatePath('/newsletter')

    return result
  })
