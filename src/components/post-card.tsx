'use client'

import type { Like, Post, User } from '@/db/schema'

import { HeartIcon } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

import { formatPostDate } from '@/utils/format-post-date'

import Controls from './controls'
import UserAvatar from './user-avatar'

export type PostCardProps = {
  post: Pick<Post, 'id' | 'title' | 'description' | 'published' | 'createdAt'> & {
    likes: Array<Pick<Like, 'id'>>
  } & {
    user: Pick<User, 'name' | 'image' | 'id'>
  }
  user: User | null
  showAuthor?: boolean
}

const PostCard = memo((props: PostCardProps) => {
  const { post, user, showAuthor = true } = props
  const { id, title, description, published, createdAt, likes, user: author } = post

  return (
    <article className='group relative rounded-xl border border-border/40 bg-white/90 p-0 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-[1.01] dark:bg-zinc-900/90 motion-reduce:transform-none overflow-hidden'>
      <div className='flex items-center justify-between px-4 pt-4 pb-2'>
        {showAuthor && (
          <Link
            href={`/users/${author.id}`}
            className='flex items-center gap-2 text-sm font-medium hover:underline transition-colors duration-200 flex-1 min-w-0'
            aria-label={`View posts by ${author.name}`}
          >
            <UserAvatar
              width={32}
              height={32}
              userId={author.id}
              src={author.image}
              alt={author.name}
              className='border border-border/30 shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0'
            />
            <span className='truncate'>{author.name}</span>
            <span className='mx-1 text-xs text-muted-foreground shrink-0' aria-hidden="true">·</span>
            <time className='text-xs text-muted-foreground shrink-0 whitespace-nowrap' dateTime={createdAt.toISOString()}>
              {formatPostDate(createdAt, { relative: true })}
            </time>
          </Link>
        )}
        <div className="shrink-0 ml-2">
          <Controls user={user} id={id} authorId={author.id} postTitle={title} />
        </div>
      </div>
      <Link
        href={`/${published ? 'posts' : 'editor'}/${id}`}
        className='block px-4 pb-4 transition-all duration-200 group-hover:bg-gray-50/50 dark:group-hover:bg-zinc-800/30 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-b-xl'
        tabIndex={0}
        aria-label={`Read post: ${title}`}
      >
        <h2 className='mb-2 text-lg sm:text-xl font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200'>{title}</h2>
        {description && (
          <p className='text-muted-foreground mb-3 line-clamp-3 text-sm sm:text-base leading-relaxed'>{description}</p>
        )}
        <div className='flex items-center justify-between pt-2'>
          <span className='flex items-center gap-1 text-sm text-muted-foreground hover:text-pink-500 transition-colors duration-200' aria-label={`${likes.length} likes`}>
            <HeartIcon className='size-4 text-pink-500 transition-transform duration-200 group-hover:scale-110' aria-hidden="true" />
            <span className='font-medium'>{likes.length}</span>
          </span>
          <span className='text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:inline'>
            Read more →
          </span>
        </div>
      </Link>
    </article>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard
