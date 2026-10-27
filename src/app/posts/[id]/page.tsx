import type { Metadata } from 'next'

import { ArrowLeft, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import readingTime from 'reading-time'

import {
  AudioDispatchHero,
  AudioDispatchProvider,
  AudioDispatchTopBar
} from '@/components/audio-dispatch-player'
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
import { RunbookProvider, RunbookVariablesBar } from '@/components/runbook-variables'
import SeriesNavigator from '@/components/series-navigator'
import ShareButtons from '@/components/share-buttons'
import TableOfContents from '@/components/table-of-contents'
import UserAvatar from '@/components/user-avatar'
import { getCurrentUser } from '@/lib/auth'
import { SITE_TITLE, SITE_URL } from '@/lib/constants'
import { getPostById } from '@/queries/get-post-by-id'
import { getPostMetadataById } from '@/queries/get-post-metadata-by-id'
import { cn } from '@/utils'
import { formatPostDate } from '@/utils/format-post-date'

import LikeButton from './like-button'

const getTechnicalDepth = (minutes: number): string => {
  if (minutes <= 3) return 'QUICK GUIDE'
  if (minutes <= 7) return 'TUTORIAL'
  return 'DEEP DIVE'
}

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
  const tagsQuery =
    post.tags.length > 0 ? `&tags=${encodeURIComponent(post.tags.slice(0, 4).join(','))}` : ''
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
  const technicalDepth = getTechnicalDepth(minutes)

  const strippedContent = content ? content.replaceAll(/<[^>]*>?/g, ' ') : ''
  const wordCount = strippedContent.split(/\s+/).filter(Boolean).length

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
    <AudioDispatchProvider
      postId={id}
      title={title}
      description={description}
      content={content}
      minutes={minutes}
    >
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ReadingProgress />
      <AudioDispatchTopBar />
      <ReadingResume postId={id} />
      <HeadingAnchors />

      <article
        className={cn(
          'relative z-10 w-full space-y-6 sm:space-y-8',
          // Clear the fixed audio dispatch bar that docks over the header on deep dives
          minutes >= 7 && 'pt-11'
        )}
      >
        {/* Top Breadcrumb Bar */}
        <div className='text-muted-foreground flex items-center justify-between font-mono text-xs'>
          <Link
            href='/'
            className='group hover:text-foreground inline-flex items-center gap-1.5 transition-colors'
          >
            <ArrowLeft className='size-3.5 transition-transform group-hover:-translate-x-1' />
            <span>Back to all articles</span>
          </Link>

          {tags.length > 0 && (
            <Link
              href={`/?tag=${encodeURIComponent(tags[0]!)}`}
              className='border-border bg-background hover:border-foreground hover:text-foreground hidden items-center gap-1 border px-2 py-0.5 text-[11px] tracking-wider uppercase transition-colors sm:inline-flex'
            >
              <span>Topic: #{tags[0]}</span>
            </Link>
          )}
        </div>

        {/* 1. Article Header Frame */}
        <Frame as='header'>
          {/* Blueprint status strip — mirrors the homepage post card */}
          <div className='border-border/80 bg-muted/30 relative overflow-hidden border-b'>
            <div
              aria-hidden
              className='absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)] [background-size:14px_14px] opacity-50'
            />
            <div className='text-muted-foreground relative flex items-center justify-between gap-2 px-4 py-2 font-mono text-[9px] tracking-widest uppercase sm:px-5'>
              <span className='truncate'>DOC // {id.slice(0, 8)}</span>
              <div className='flex shrink-0 items-center gap-2'>
                <span className='border-border bg-background/80 text-foreground inline-flex items-center gap-1 border px-1.5 py-px text-[8px] font-semibold'>
                  <Sparkles className='size-2.5' aria-hidden />
                  {technicalDepth}
                </span>
                <span className='inline-flex items-center gap-1'>
                  <Clock className='size-2.5' aria-hidden />
                  {readStats.text}
                </span>
              </div>
            </div>
          </div>

          <FrameBody className='space-y-5'>
            {/* Title */}
            <h1 className='font-heading text-foreground text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl'>
              {title}
            </h1>

            {/* Description Subtitle */}
            {description && (
              <div className='border-foreground/30 border-l-2 py-0.5 pl-3.5'>
                <p className='text-muted-foreground max-w-3xl text-base leading-relaxed sm:text-lg'>
                  {description}
                </p>
              </div>
            )}

            {/* Meta Row: author · date · views */}
            <div className='text-muted-foreground flex flex-wrap items-center gap-x-2.5 gap-y-2 font-mono text-xs'>
              <Link
                href={`/users/${author.id}`}
                className='text-foreground inline-flex items-center gap-2 font-medium transition-opacity hover:opacity-80'
                aria-label={`View posts by ${author.name}`}
              >
                <UserAvatar
                  width={18}
                  height={18}
                  src={author.image}
                  alt={author.name}
                  userId={author.id}
                  className='border-border size-4.5 border'
                />
                <span>{author.name}</span>
              </Link>
              <span aria-hidden>·</span>
              <time dateTime={dateTime}>{formatPostDate(createdAt, { relative: true })}</time>
              <span aria-hidden>·</span>
              <PostViews postId={id} initialViews={views} className='text-xs' />
            </div>

            {/* Tags Pills */}
            {tags.length > 0 && (
              <ul className='flex flex-wrap gap-1.5 pt-1' aria-label='Article topics'>
                {tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/?tag=${encodeURIComponent(tag)}`}
                      className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground inline-block border px-2.5 py-1 font-mono text-[11px] tracking-wide uppercase transition-colors'
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </FrameBody>
        </Frame>

        {/* Audio Briefing Hero (For Deep Dives >7 min) */}
        <AudioDispatchHero />

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
          <FrameHeader label='Article Content'>
            <div className='text-muted-foreground flex items-center gap-2 font-mono text-[10px] uppercase'>
              <span>{wordCount.toLocaleString()} words</span>
            </div>
          </FrameHeader>

          <FrameBody>
            <RunbookProvider content={content ?? ''}>
              <RunbookVariablesBar />
              <div className='flex flex-col gap-8 lg:flex-row lg:items-start xl:gap-12'>
                <div className='prose dark:prose-invert w-full max-w-full min-w-0 flex-1'>
                  <Editor options={{ content, editable: false }} />
                </div>
                <TableOfContents content={content ?? ''} />
              </div>
            </RunbookProvider>

            {/* 3. Author Attribution & Community Engagement Section */}
            <div className='border-border mt-14 space-y-5 border-t pt-8'>
              {/* Author Attribution Card */}
              <div className='border-border bg-muted/20 relative border p-4 sm:p-5'>
                <CornerBrackets className='size-2' />
                <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
                  <div className='flex items-center gap-3.5'>
                    <Link href={`/users/${author.id}`} className='shrink-0'>
                      <UserAvatar
                        width={48}
                        height={48}
                        src={author.image}
                        alt={author.name}
                        userId={author.id}
                        className='border-border size-12 border'
                      />
                    </Link>
                    <div className='min-w-0 space-y-0.5'>
                      <p className='text-muted-foreground font-mono text-[10px] tracking-widest uppercase'>
                        Written by
                      </p>
                      <Link
                        href={`/users/${author.id}`}
                        className='text-foreground text-base font-semibold tracking-tight hover:underline'
                      >
                        {author.name}
                      </Link>
                      {author.bio && (
                        <p className='text-muted-foreground line-clamp-2 max-w-md text-xs'>
                          {author.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/users/${author.id}`}
                    className='border-border bg-background text-foreground hover:border-foreground inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] tracking-wider uppercase transition-colors'
                  >
                    <span>View Profile</span>
                  </Link>
                </div>
              </div>

              {/* Engagement Actions Bar */}
              <div className='border-border bg-card/60 flex flex-col items-start justify-between gap-4 border p-3 sm:flex-row sm:items-center sm:p-4'>
                <div className='flex items-center gap-2.5'>
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

                <div className='flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end'>
                  <span className='text-muted-foreground font-mono text-[10px] tracking-wider uppercase'>
                    Share article:
                  </span>
                  <ShareButtons title={title} description={description ?? undefined} postId={id} />
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
    </AudioDispatchProvider>
  )
}

export default PostPage
