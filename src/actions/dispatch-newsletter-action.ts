'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { db } from '@/db'
import { posts, subscribers } from '@/db/schema'
import { SITE_URL } from '@/lib/constants'
import { sendNewsletterDispatch } from '@/lib/email-dispatch'
import { ActionError, authenticatedActionClient } from '@/lib/safe-action'
import { createUnsubscribeToken } from '@/lib/unsubscribe-token'

const dispatchNewsletterSchema = z.object({
  postId: z.string().min(1, 'Post ID is required')
})

export const dispatchNewsletterAction = authenticatedActionClient
  .schema(dispatchNewsletterSchema)
  .action(async ({ parsedInput: { postId }, ctx: { user } }) => {
    if (user.role !== 'admin') {
      throw new ActionError('Unauthorized: Admin privileges required to dispatch newsletter')
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
      throw new ActionError('Post not found')
    }

    if (!post.published) {
      throw new ActionError('Cannot dispatch draft posts. Please publish the post first.')
    }

    if (post.visibility !== 'public') {
      throw new ActionError('Cannot dispatch private posts to subscribers.')
    }

    // 2. Fetch all active subscribers
    const activeSubscribers = await db.query.subscribers.findMany({
      where: eq(subscribers.subscribed, true),
      columns: {
        email: true
      }
    })

    const emails = activeSubscribers.map((s) => s.email)

    const siteUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL

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
        siteUrl,
        buildUnsubscribeUrl: (email) =>
          `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(createUnsubscribeToken(email))}`
      }
    )

    revalidatePath('/admin')
    revalidatePath('/newsletter')

    return result
  })
