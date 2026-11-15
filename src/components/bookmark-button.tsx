'use client'

import { BookmarkIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui'
import { useBookmarks } from '@/hooks/use-bookmarks'
import { cn } from '@/utils'

type BookmarkButtonProps = {
  post: {
    id: string
    title: string
    description?: string | null
    createdAt?: string | Date
    tags?: string[]
  }
  userId?: string | null
  initiallyBookmarked?: boolean
}

export const BookmarkButton = ({
  post,
  userId,
  initiallyBookmarked = false
}: BookmarkButtonProps) => {
  const initialBookmarks = useMemo(
    () =>
      initiallyBookmarked
        ? [
            {
              ...post,
              description: post.description ?? null,
              createdAt: post.createdAt
                ? new Date(post.createdAt).toISOString()
                : new Date().toISOString(),
              tags: post.tags ?? []
            }
          ]
        : [],
    [initiallyBookmarked, post]
  )
  const { isBookmarked, toggleBookmark, isLoaded } = useBookmarks(userId, initialBookmarks)
  const [isAnimating, setIsAnimating] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const active = Boolean(userId && isBookmarked(post.id))

  const handleToggle = async () => {
    if (!userId) {
      toast.info('Please sign in to save articles to your bookmarks')
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    setIsAnimating(true)
    await toggleBookmark(post)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const getAriaLabel = () => {
    if (userId) {
      return active ? 'Remove bookmark' : 'Bookmark post'
    }
    return 'Sign in to bookmark post'
  }

  const getTooltip = () => {
    if (userId) {
      return active ? 'Remove bookmark' : 'Save for later'
    }
    return 'Sign in to bookmark'
  }

  return (
    <div className='group relative'>
      <Button
        corners
        variant='outline'
        className={cn(
          'flex cursor-pointer items-center gap-2 px-3.5 py-1.5 font-mono text-xs tracking-wider uppercase transition-all',
          active
            ? 'border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background'
            : 'border-border bg-background text-foreground hover:border-foreground/60 hover:bg-muted/40',
          isAnimating && 'scale-[1.02]'
        )}
        disabled={!isLoaded}
        onClick={handleToggle}
        aria-pressed={active}
        aria-label={getAriaLabel()}
        type='button'
      >
        <BookmarkIcon
          className={cn(
            'size-4 transition-all duration-200',
            active ? 'fill-current' : 'text-muted-foreground'
          )}
        />
        <span className='font-mono text-xs tracking-wider uppercase'>
          {active ? 'Saved' : 'Bookmark'}
        </span>
      </Button>

      {/* Tooltip */}
      <span className='border-border bg-card text-foreground pointer-events-none absolute top-full left-1/2 z-20 mt-1 w-max -translate-x-1/2 scale-95 border px-2 py-1 text-xs opacity-0 shadow transition-all group-focus-within:opacity-100 group-hover:opacity-100'>
        {getTooltip()}
      </span>
    </div>
  )
}

export default BookmarkButton
