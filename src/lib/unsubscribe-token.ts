import { createHmac, timingSafeEqual } from 'node:crypto'

import { env } from '@/env'

export function createUnsubscribeToken(email: string): string {
  const normalized = email.trim().toLowerCase()
  return createHmac('sha256', env.AUTH_SECRET).update(`unsubscribe:${normalized}`).digest('hex')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!token) return false
  const expected = createUnsubscribeToken(email)
  const expectedBuf = Buffer.from(expected, 'utf8')
  const tokenBuf = Buffer.from(token.trim(), 'utf8')
  if (expectedBuf.length !== tokenBuf.length) return false
  return timingSafeEqual(expectedBuf, tokenBuf)
}
