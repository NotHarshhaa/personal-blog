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
    <article className='group relative rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 p-0 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 dark:hover:shadow-primary/10 motion-reduce:transform-none overflow-hidden'>
      {/* Decorative accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className='flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-3'>
        {showAuthor && (
          <Link
            href={`/users/${author.id}`}
            className='flex items-center gap-2.5 text-sm font-medium hover:underline transition-colors duration-200 flex-1 min-w-0'
            aria-label={`View posts by ${author.name}`}
          >
            <UserAvatar
              width={36}
              height={36}
              userId={author.id}
              src={author.image}
              alt={author.name}
              className='border-2 border-border/30 shadow-sm transition-transform duration-200 group-hover:scale-110 shrink-0'
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
              <span className='truncate font-medium'>{author.name}</span>
              <span className='hidden sm:inline text-xs text-muted-foreground shrink-0' aria-hidden="true">·</span>
              <time className='text-xs text-muted-foreground shrink-0 whitespace-nowrap' dateTime={createdAt.toISOString()}>
                {formatPostDate(createdAt, { relative: true })}
              </time>
            </div>
          </Link>
        )}
        <div className="shrink-0 ml-2">
          <Controls user={user} id={id} authorId={author.id} postTitle={title} />
        </div>
      </div>
      <Link
        href={`/${published ? 'posts' : 'editor'}/${id}`}
        className='block px-5 sm:px-6 pb-5 sm:pb-6 transition-all duration-200 group-hover:bg-gradient-to-br group-hover:from-gray-50/50 group-hover:to-transparent dark:group-hover:from-zinc-800/20 dark:group-hover:to-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-b-2xl'
        tabIndex={0}
        aria-label={`Read post: ${title}`}
      >
        <h2 className='mb-3 text-xl sm:text-2xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200'>{title}</h2>
        {description && (
          <p className='text-muted-foreground mb-4 line-clamp-3 text-sm sm:text-base leading-relaxed'>{description}</p>
        )}
        <div className='flex items-center justify-between pt-3 border-t border-border/20'>
          <span className='flex items-center gap-1.5 text-sm text-muted-foreground hover:text-pink-500 transition-colors duration-200' aria-label={`${likes.length} likes`}>
            <HeartIcon className='size-4 text-pink-500 transition-transform duration-200 group-hover:scale-110' aria-hidden="true" />
            <span className='font-medium'>{likes.length}</span>
            <span className="hidden sm:inline text-xs">likes</span>
          </span>
          <span className='text-xs sm:text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1'>
            Read more
            <span className="hidden sm:inline">→</span>
          </span>
        </div>
      </Link>
    </article>
  )
})

PostCard.displayName = 'PostCard'

export default PostCard
