'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'
import { cn } from '@/utils'

type PostViewsProps = {
  postId: string
  className?: string
}

const PostViews = ({ postId, className }: PostViewsProps) => {
  const [views, setViews] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const trackView = async () => {
      try {
        // Check if already viewed in this session
        const viewedKey = `viewed-${postId}`
        const hasViewed = sessionStorage.getItem(viewedKey)
        
        if (!hasViewed) {
          // Track view
          const response = await fetch(`/api/posts/${postId}/views`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            setViews(data.views)
            sessionStorage.setItem(viewedKey, 'true')
          }
        } else {
          // Just fetch current views
          const response = await fetch(`/api/posts/${postId}/views`)
          if (response.ok) {
            const data = await response.json()
            setViews(data.views)
          }
        }
      } catch (error) {
        console.error('Error tracking view:', error)
      } finally {
        setIsLoading(false)
      }
    }

    trackView()
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

