// types/next-auth.d.ts

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string | null
      role: string
      bio: string | null
      createdAt: string
      updatedAt: string
    }
  }

  interface User {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    bio: string | null
    createdAt: Date
    updatedAt: Date
  }
}
