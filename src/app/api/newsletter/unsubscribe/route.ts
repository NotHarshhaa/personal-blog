import { eq } from 'drizzle-orm'
import { type NextRequest, NextResponse } from 'next/server'

import { db } from '@/db'
import { subscribers } from '@/db/schema'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.redirect(new URL('/newsletter', request.url))
  }

  const normalizedEmail = email.trim().toLowerCase()

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
