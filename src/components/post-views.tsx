'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { cn } from '@/utils'

type PostViewsProps = {
  postId: string
  initialViews?: number
  className?: string
}

const PostViews = ({ postId, initialViews, className }: PostViewsProps) => {
  const [views, setViews] = useState<number | null>(initialViews ?? null)
  const [isLoading, setIsLoading] = useState(initialViews == null)

  useEffect(() => {
    const viewedKey = `viewed-${postId}`
    let cancelled = false

    const trackView = async () => {
      const hasViewed = sessionStorage.getItem(viewedKey) === 'true'

      try {
        if (!hasViewed) {
          sessionStorage.setItem(viewedKey, 'true')
        }

        const response = await fetch(`/api/posts/${postId}/views`, {
          method: hasViewed ? 'GET' : 'POST'
        })

        if (!response.ok) {
          if (!hasViewed) {
            sessionStorage.removeItem(viewedKey)
          }
          return
        }

        const data = (await response.json()) as { views: number }
        if (!cancelled) {
          setViews(data.views)
        }
      } catch (error) {
        if (!hasViewed) {
          sessionStorage.removeItem(viewedKey)
        }
        console.error('Error tracking view:', error)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    trackView()

    return () => {
      cancelled = true
    }
  }, [postId])

  if (isLoading || views === null) {
    return (
      <div className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
        <Eye className="size-4" />
        <span>...</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
      <Eye className="size-4" />
      <span>{views.toLocaleString()} views</span>
    </div>
  )
}

export default PostViews
