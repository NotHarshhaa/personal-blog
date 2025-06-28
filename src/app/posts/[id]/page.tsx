import type { Metadata } from 'next'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import readingTime from 'reading-time'

import Editor from '@/components/editor'
import UserAvatar from '@/components/user-avatar'
import { getCurrentUser } from '@/lib/auth'
import { SITE_URL } from '@/lib/constants'
import { getPostById } from '@/queries/get-post-by-id'
import { getPostMetadataById } from '@/queries/get-post-metadata-by-id'
import { formatPostDate } from '@/utils/format-post-date'

import LikeButton from './like-button'

type PostPageProps = {
  params: Promise<{
    id: string
  }>
}

export const generateMetadata = async (props: PostPageProps): Promise<Metadata> => {
  const { id } = await props.params
  const { post } = await getPostMetadataById(id)

  if (!post) return {}

  const ISOPublishedTime = new Date(post.createdAt).toISOString()
  const ISOModifiedTime = new Date(post.updatedAt).toISOString()

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      url: `${SITE_URL}/posts/${id}`,
      type: 'article',
      title: post.title,
      description: post.description ?? undefined,
      publishedTime: ISOPublishedTime,
      modifiedTime: ISOModifiedTime,
      authors: `${SITE_URL}/users/${post.authorId}`,
      images: [
        {
          url: `${SITE_URL}/api/og?title=${post.title}`,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/png'
        }
      ]
    }
  }
}

const PostPage = async (props: PostPageProps) => {
  const { id } = await props.params

  const user = await getCurrentUser()
  const { post } = await getPostById(id)

  if (!post) {
    notFound()
  }

  const { title, description, content, createdAt, user: author, likes } = post
  const dateTime = formatPostDate(createdAt, {
    format: 'YYYY-MM-DD'
  })

  return (
    <div className="mx-auto w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl rounded-2xl border border-border/40 bg-white/90 p-4 md:p-8 shadow-lg dark:bg-zinc-900/90 my-8">
      {/* Meta info bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-medium">
          <time dateTime={dateTime}>{formatPostDate(createdAt, { relative: true })}</time>
        </span>
        <span>·</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-medium">
          {readingTime(content ?? '').text}
        </span>
      </div>
      {/* Title & Description */}
      <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">{title}</h1>
      <p className="mb-6 text-muted-foreground text-lg md:text-xl">{description}</p>
      {/* Author card */}
      <Link href={`/users/${author.id}`} className="mb-8 flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3 transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-primary">
        <UserAvatar
          width={40}
          height={40}
          src={author.image}
          alt={author.name}
          userId={author.id}
        />
        <div className="flex flex-col">
          <span className="font-semibold text-base text-foreground">{author.name}</span>
          <span className="text-xs text-muted-foreground">Author</span>
        </div>
      </Link>
      {/* Content */}
      <article className="prose dark:prose-invert mx-auto max-w-none py-6">
        <Editor options={{ content, editable: false }} />
      </article>
      {/* Like button centered */}
      <div className="flex justify-center mt-8">
        <LikeButton
          likes={likes}
          user={
            user
              ? {
                  ...user,
                  createdAt: new Date(user.createdAt),
                  updatedAt: new Date(user.updatedAt)
                }
              : null
          }
          postId={id}
        />
      </div>
    </div>
  )
}

export default PostPage
