import type { Metadata } from 'next'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import readingTime from 'reading-time'

import Editor from '@/components/editor'
import UserAvatar from '@/components/user-avatar'
import ReadingProgress from '@/components/reading-progress'
import ShareButtons from '@/components/share-buttons'
import TableOfContents from '@/components/table-of-contents'
import RelatedPosts from '@/components/related-posts'
import PostViews from '@/components/post-views'
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
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen w-full">
        {/* Hero section */}
        <div className="w-full from-primary/5 via-background to-background">
          <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 pt-8 pb-6 sm:pt-20 sm:pb-12">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-6">
              <Link
                href={`/users/${author.id}`}
                className="inline-flex items-center gap-2 hover:text-foreground transition-colors duration-200 group"
                aria-label={`View posts by ${author.name}`}
              >
                <UserAvatar
                  width={24}
                  height={24}
                  src={author.image}
                  alt={author.name}
                  userId={author.id}
                  className="border border-border/30 transition-transform duration-200 group-hover:scale-105"
                />
                <span className="font-medium">{author.name}</span>
              </Link>
              <span className="text-border/60" aria-hidden="true">•</span>
              <time dateTime={dateTime} className="text-sm">
                {formatPostDate(createdAt, { relative: true })}
              </time>
              <span className="text-border/60" aria-hidden="true">•</span>
              <span className="flex items-center gap-1">
                <span>{readingTime(content ?? '').text}</span>
                <span className="text-xs opacity-75">read</span>
              </span>
              <span className="text-border/60" aria-hidden="true">•</span>
              <PostViews postId={id} />
            </div>

            {/* Title & Description */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6 max-w-4xl leading-tight text-shadow-none">
              {title}
            </h1>
            {description && (
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Content section */}
        <div className="w-full border-t border-border/10">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
            <div className="py-6 sm:py-8">
              <div className="flex gap-8">
                {/* Main content */}
                <article className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none flex-1">
                  <Editor options={{ content, editable: false }} />
                </article>

                {/* Table of Contents */}
                <TableOfContents content={content ?? ''} />
              </div>

              {/* Like button and Share buttons */}
              <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-border/10 pt-6">
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

              {/* Related Posts */}
              <RelatedPosts
                currentPostId={id}
                currentPostTitle={title}
                currentPostDescription={description}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PostPage
