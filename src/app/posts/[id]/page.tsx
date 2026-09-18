import type { Metadata } from 'next'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import readingTime from 'reading-time'

import { ArrowLeft, Calendar, Clock, Sparkles } from 'lucide-react'
import BookmarkButton from '@/components/bookmark-button'
import Editor from '@/components/editor'
import { CornerBrackets, Frame, FrameBody, FrameHeader } from '@/components/frame'
import GiscusComments from '@/components/giscus-comments'
import HeadingAnchors from '@/components/heading-anchors'
import NewsletterCard from '@/components/newsletter-card'
import PostViews from '@/components/post-views'
import ReadingProgress from '@/components/reading-progress'
import ReadingResume from '@/components/reading-resume'
import RelatedPosts from '@/components/related-posts'
import SeriesNavigator from '@/components/series-navigator'
import ShareButtons from '@/components/share-buttons'
import TableOfContents from '@/components/table-of-contents'
import UserAvatar from '@/components/user-avatar'
import { getCurrentUser } from '@/lib/auth'
import { SITE_TITLE, SITE_URL } from '@/lib/constants'
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

  const descriptionQuery = post.description
    ? `&description=${encodeURIComponent(post.description)}`
    : ''
  const tagsQuery = post.tags.length > 0
    ? `&tags=${encodeURIComponent(post.tags.slice(0, 4).join(','))}`
    : ''
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}${descriptionQuery}${tagsQuery}`

  return {
    title: post.title,
    description: post.description ?? undefined,
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
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/png'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description ?? undefined,
      images: [ogImageUrl]
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

  const {
    title,
    description,
    content,
    createdAt,
    user: author,
    likes,
    likeCount,
    views,
    tags
  } = post
  const dateTime = formatPostDate(createdAt, {
    format: 'YYYY-MM-DD'
  })

  const readStats = readingTime(content ?? '')
  const minutes = Math.ceil(readStats.minutes)
  const technicalDepth =
    minutes <= 3 ? 'QUICK GUIDE' : minutes <= 7 ? 'TUTORIAL' : 'DEEP DIVE'

  const wordCount = content
    ? content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
    : 0

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
    wordCount,
    articleSection: 'Technology',
    keywords: [
      'devops',
      'cloud computing',
      'platform engineering',
      'ai',
      'machine learning',
      'mlops',
      'llmops',
      'genai',
      'ai infrastructure',
      'technology',
      ...tags
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ReadingProgress />
      <ReadingResume postId={id} />
      <HeadingAnchors />

      <article className="relative z-10 w-full space-y-6 sm:space-y-8">
        {/* Top Breadcrumb Bar */}
        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back to all articles</span>
          </Link>

          {tags && tags.length > 0 && (
            <Link
              href={`/?tag=${encodeURIComponent(tags[0]!)}`}
              className="hidden sm:inline-flex items-center gap-1 border border-border bg-background px-2 py-0.5 uppercase tracking-wider text-[11px] hover:border-foreground hover:text-foreground transition-colors"
            >
              <span>Topic: #{tags[0]}</span>
            </Link>
          )}
        </div>

        {/* 1. Article Header Frame */}
        <Frame as="header">
          <FrameHeader label="Technical Guide">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-muted-foreground">
              <span className="hidden sm:inline-flex items-center gap-1 text-foreground/80 font-medium">
                <Sparkles className="size-3 text-amber-500" />
                {technicalDepth}
              </span>
              <span className="hidden sm:inline" aria-hidden>·</span>
              <span>{readStats.text}</span>
            </div>
          </FrameHeader>

          <FrameBody className="space-y-5">
            {/* Metadata Badges Strip */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 sm:gap-2.5">
              {/* Author Chip */}
              <Link
                href={`/users/${author.id}`}
                className="inline-flex items-center gap-2 border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:border-foreground"
                aria-label={`View posts by ${author.name}`}
              >
                <UserAvatar
                  width={18}
                  height={18}
                  src={author.image}
                  alt={author.name}
                  userId={author.id}
                  className="size-4.5 border border-border"
                />
                <span className="font-medium">{author.name}</span>
              </Link>

              {/* Date Chip */}
              <div className="inline-flex items-center gap-1.5 border border-border bg-background/80 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                <Calendar className="size-3" />
                <time dateTime={dateTime}>
                  {formatPostDate(createdAt, { relative: true })}
                </time>
              </div>

              {/* Reading Time Chip */}
              <div className="inline-flex items-center gap-1.5 border border-border bg-background/80 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                <Clock className="size-3" />
                <span>{readStats.text}</span>
              </div>

              {/* Views Chip */}
              <div className="inline-flex items-center gap-1.5 border border-border bg-background/80 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                <PostViews postId={id} initialViews={views} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl leading-tight">
              {title}
            </h1>

            {/* Description Subtitle */}
            {description && (
              <div className="border-l-2 border-foreground/30 pl-3.5 py-0.5">
                <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {description}
                </p>
              </div>
            )}

            {/* Tags Pills */}
            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Article topics">
                {tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/?tag=${encodeURIComponent(tag)}`}
                      className="inline-block border border-border bg-background px-2.5 py-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase transition-colors hover:border-foreground hover:text-foreground"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </FrameBody>
        </Frame>

        {/* Series Navigation (if part of a series) */}
        {post.series && (
          <SeriesNavigator
            series={post.series}
            currentPostId={id}
            currentOrder={post.seriesOrder}
          />
        )}

        {/* 2. Main Content & TOC Frame */}
        <Frame>
          <FrameHeader label="Article Content">
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase">
              <span>{wordCount.toLocaleString()} words</span>
            </div>
          </FrameHeader>

          <FrameBody>
            <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-start">
              <div className="prose dark:prose-invert max-w-none min-w-0 flex-1">
                <Editor options={{ content, editable: false }} />
              </div>
              <TableOfContents content={content ?? ''} />
            </div>

            {/* 3. Author Attribution & Community Engagement Section */}
            <div className="mt-14 space-y-5 border-t border-border pt-8">
              {/* Author Attribution Card */}
              <div className="relative border border-border bg-muted/20 p-4 sm:p-5">
                <CornerBrackets className="size-2" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <Link href={`/users/${author.id}`} className="shrink-0">
                      <UserAvatar
                        width={48}
                        height={48}
                        src={author.image}
                        alt={author.name}
                        userId={author.id}
                        className="size-12 border border-border"
                      />
                    </Link>
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Written by
                      </p>
                      <Link
                        href={`/users/${author.id}`}
                        className="text-base font-semibold tracking-tight text-foreground hover:underline"
                      >
                        {author.name}
                      </Link>
                      {author.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                          {author.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/users/${author.id}`}
                    className="inline-flex items-center gap-1.5 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-foreground hover:border-foreground transition-colors"
                  >
                    <span>View Profile</span>
                  </Link>
                </div>
              </div>

              {/* Engagement Actions Bar */}
              <div className="flex flex-col items-start justify-between gap-4 border border-border bg-card/60 p-3 sm:flex-row sm:items-center sm:p-4">
                <div className="flex items-center gap-2.5">
                  <LikeButton
                    likes={likes}
                    likeCount={likeCount}
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
                  <BookmarkButton
                    post={{
                      id,
                      title,
                      description,
                      createdAt,
                      tags
                    }}
                    userId={user?.id}
                  />
                </div>

                <div className="flex items-center gap-3 w-full justify-between sm:w-auto sm:justify-end">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-wider">
                    Share article:
                  </span>
                  <ShareButtons
                    title={title}
                    description={description ?? undefined}
                    postId={id}
                  />
                </div>
              </div>
            </div>
          </FrameBody>
        </Frame>

        <NewsletterCard />

        <GiscusComments postId={id} postTitle={title} />

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
