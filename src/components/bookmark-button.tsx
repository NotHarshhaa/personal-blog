'use client'

import { BookmarkIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
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
}

export const BookmarkButton = ({ post, userId }: BookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark, isLoaded } = useBookmarks(userId)
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
    <div className="group relative">
      <Button
        className={cn(
          'flex items-center gap-2 border border-border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted cursor-pointer',
          active &&
            'bg-foreground text-background hover:bg-foreground/90 hover:text-background',
          isAnimating && 'scale-[1.02]'
        )}
        variant="ghost"
        disabled={!isLoaded}
        onClick={handleToggle}
        aria-pressed={active}
        aria-label={getAriaLabel()}
        type="button"
      >
        <BookmarkIcon
          className={cn(
            'size-4 transition-all duration-200',
            active ? 'fill-current' : 'text-muted-foreground'
          )}
        />
        <span className="font-mono text-xs uppercase tracking-wider">
          {active ? 'Saved' : 'Bookmark'}
        </span>
      </Button>

      {/* Tooltip */}
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-max -translate-x-1/2 scale-95 border border-border bg-card px-2 py-1 text-xs text-foreground opacity-0 shadow transition-all group-hover:opacity-100 group-focus-within:opacity-100">
        {getTooltip()}
      </span>
    </div>
  )
}

export default BookmarkButton
