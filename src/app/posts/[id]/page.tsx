import type { Metadata } from 'next'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import readingTime from 'reading-time'

import Editor from '@/components/editor'
import UserAvatar from '@/components/user-avatar'
import ShareButtons from '@/components/share-buttons'
import TableOfContents from '@/components/table-of-contents'
import RelatedPosts from '@/components/related-posts'
import PostViews from '@/components/post-views'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { getCurrentUser } from '@/lib/auth'
import { SITE_URL, SITE_TITLE } from '@/lib/constants'
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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    image: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
    datePublished: createdAt.toISOString(),
    dateModified: createdAt.toISOString(),
    author: {
      '@type': 'Person',
      name: author.name,
      url: `${SITE_URL}/users/${author.id}`
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_TITLE,
      url: SITE_URL
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/posts/${id}`
    },
    wordCount: content?.split(' ').length || 0,
    articleSection: 'Technology',
    keywords: ['devops', 'cloud computing', 'technology']
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <article className="relative z-10 w-full space-y-6">
        <Frame as="header">
          <FrameHeader label="Article" />
          <FrameBody className="space-y-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <Link
                href={`/users/${author.id}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
                aria-label={`View posts by ${author.name}`}
              >
                <UserAvatar
                  width={24}
                  height={24}
                  src={author.image}
                  alt={author.name}
                  userId={author.id}
                  className="size-6 border border-border"
                />
                <span className="font-medium text-foreground">{author.name}</span>
              </Link>
              <span aria-hidden>·</span>
              <time dateTime={dateTime}>
                {formatPostDate(createdAt, { relative: true })}
              </time>
              <span aria-hidden>·</span>
              <span>{readingTime(content ?? '').text}</span>
              <span aria-hidden>·</span>
              <PostViews postId={id} />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </p>
            )}
          </FrameBody>
        </Frame>

        <Frame>
          <FrameHeader label="Content" />
          <FrameBody>
            <div className="flex gap-10">
              <div className="prose dark:prose-invert max-w-none min-w-0 flex-1">
                <Editor options={{ content, editable: false }} />
              </div>
              <TableOfContents content={content ?? ''} />
            </div>

            <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
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
              <ShareButtons
                title={title}
                description={description || undefined}
                postId={id}
              />
            </div>
          </FrameBody>
        </Frame>

        <RelatedPosts
          currentPostId={id}
          currentPostTitle={title}
          currentPostDescription={description}
        />
      </article>
    </>
  )
}

export default PostPage
