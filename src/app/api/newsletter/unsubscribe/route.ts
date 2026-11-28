import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

import { db } from '@/db'
import { subscribers } from '@/db/schema'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token') ?? ''

  if (!email) {
    return NextResponse.redirect(new URL('/newsletter', request.url))
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!verifyUnsubscribeToken(normalizedEmail, token)) {
    return NextResponse.redirect(
      new URL('/newsletter/unsubscribed?error=invalid_token', request.url)
    )
  }

  try {
    await db
      .update(subscribers)
      .set({ subscribed: false })
      .where(eq(subscribers.email, normalizedEmail))
  } catch (error) {
    console.error('[NEWSLETTER:UNSUBSCRIBE_ERROR]', error)
  }

  return NextResponse.redirect(
    new URL(`/newsletter/unsubscribed?email=${encodeURIComponent(normalizedEmail)}`, request.url)
  )
}
