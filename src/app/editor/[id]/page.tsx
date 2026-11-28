import type { Metadata } from 'next'

import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'

import { db } from '@/db'
import { posts } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'

import Form from './form'

type EditorPageProps = {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: 'Editor'
}

const EditorPage = async (props: EditorPageProps) => {
  const { id } = await props.params

  const user = await getCurrentUser()

  // 🔒 If not logged in, redirect to login
  if (!user) {
    redirect(`/login?redirect=/editor/${id}`)
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id)
  })

  if (!post) {
    notFound()
  }

  // Admins can manage every post; authors can manage their own posts.
  if (user.role !== 'admin' && post.authorId !== user.id) {
    redirect('/')
  }

  return <Form post={post} isAdmin={user.role === 'admin'} />
}

export default EditorPage
