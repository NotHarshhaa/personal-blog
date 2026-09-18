'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '@/db'
import { subscribers } from '@/db/schema'
import { unauthenticatedActionClient } from '@/lib/safe-action'

const subscribeNewsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

export const subscribeNewsletterAction = unauthenticatedActionClient
  .schema(subscribeNewsletterSchema)
  .action(async ({ parsedInput: { email } }) => {
    const normalizedEmail = email.trim().toLowerCase()

    const existing = await db.query.subscribers.findFirst({
      where: eq(subscribers.email, normalizedEmail)
    })

    if (existing) {
      if (existing.subscribed) {
        return {
          success: true,
          message: "You're already subscribed to the dispatch!"
        }
      }

      await db
        .update(subscribers)
        .set({ subscribed: true })
        .where(eq(subscribers.id, existing.id))

      return {
        success: true,
        message: 'Welcome back! Your subscription has been reactivated.'
      }
    }

    await db.insert(subscribers).values({
      email: normalizedEmail,
      subscribed: true
    })

    return {
      success: true,
      message: 'Welcome to the DevOps & AI Dispatch! Verification confirmed.'
    }
  })
