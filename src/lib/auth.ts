import type { NextAuthConfig } from 'next-auth'

import { DrizzleAdapter } from '@auth/drizzle-adapter'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { cache } from 'react'

import { db } from '@/db'
import { accounts, sessions, users, verificationTokens } from '@/db/schema'
import { env } from '@/env'
import { getDefaultImage } from '@/utils/get-default-image'

// If you want to extend types, put them in types/next-auth.d.ts — not here.

const config: NextAuthConfig = {
  secret: env.AUTH_SECRET,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens
  }),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          bio: user.bio,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    }
  }
}

export const {
  handlers: { GET, POST },
  auth
} = NextAuth(config)

export const getCurrentUser = cache(async () => {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  const defaultImage = getDefaultImage(session.user.id)

  return {
    ...session.user,
    name: session.user.name,
    image: session.user.image ?? defaultImage
  }
})
