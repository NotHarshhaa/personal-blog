// types/next-auth.d.ts

import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string
      email: string
      image: string | null
      role: string
      bio: string | null
      createdAt: string
      updatedAt: string
      emailVerified: Date | null
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    bio: string | null
    createdAt: string
    updatedAt: string
    emailVerified: Date | null
  }
}
