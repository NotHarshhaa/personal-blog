'use client'

import type { Like, User } from '@/db/schema'

import { createId } from '@paralleldrive/cuid2'
import { Heart, Loader2Icon } from 'lucide-react'
import { useOptimisticAction } from 'next-safe-action/hooks'
import { useState } from 'react'

import { togglePostLikeAction } from '@/actions/toggle-post-like-action'
import { Button, toast } from '@/components/ui'
import { cn } from '@/utils'

type LikeButtonProps = {
  likes: Like[]
  likeCount: number
  user: User | null
  postId: string
}

const LikeButton = (props: LikeButtonProps) => {
  const { likes, likeCount, user, postId } = props
  const [isAnimating, setIsAnimating] = useState(false)
  const action = useOptimisticAction(togglePostLikeAction, {
    currentState: { likes, likeCount },
    updateFn: (state) => {
      if (!user) return state
      const existingLike = state.likes.find((like) => like.userId === user.id)

      if (existingLike) {
        return {
          likes: state.likes.filter((like) => like.id !== existingLike.id),
          likeCount: Math.max(0, state.likeCount - 1)
        }
      }

      return {
        likes: [
          ...state.likes,
          {
            id: createId(),
            userId: user.id,
            postId: postId
          }
        ],
        likeCount: state.likeCount + 1
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Failed to update like')
    }
  })

  const isUserLiked = action.optimisticState.likes.some((like) => like.userId === user?.id)
  const displayedLikeCount = action.optimisticState.likeCount

  const handleLike = async () => {
    setIsAnimating(true)
    await action.executeAsync({ postId })
    setTimeout(() => setIsAnimating(false), 400)
  }

  let tooltipLabel = 'Sign in to like'
  let ariaLabel = 'Sign in to like post'
  if (user) {
    tooltipLabel = isUserLiked ? 'Unlike' : 'Like'
    ariaLabel = isUserLiked ? 'Unlike post' : 'Like post'
  }

  return (
    <div className='group relative'>
      <Button
        corners
        variant='outline'
        className={cn(
          'flex items-center gap-2 px-3.5 py-1.5 font-mono text-xs tracking-wider uppercase transition-all',
          !user && 'cursor-not-allowed opacity-60',
          isUserLiked
            ? 'border-destructive/50 bg-destructive/12 text-destructive hover:bg-destructive/20 hover:border-destructive/75'
            : 'border-border bg-background text-foreground hover:border-foreground/60 hover:bg-muted/40',
          isAnimating && 'scale-[1.02]'
        )}
        disabled={!user || action.isExecuting}
        onClick={handleLike}
        aria-pressed={isUserLiked}
        aria-label={ariaLabel}
        tabIndex={0}
        type='button'
      >
        <span className='relative flex items-center'>
          {action.isExecuting ? (
            <Loader2Icon className='text-muted-foreground size-4 animate-spin' />
          ) : (
            <Heart
              className={cn(
                'size-5 transition-all duration-200',
                isUserLiked ? 'fill-current' : 'text-muted-foreground',
                isAnimating && 'animate-heart-pop'
              )}
            />
          )}
        </span>
        <span
          className={cn('transition-all duration-200', isAnimating && 'scale-110 font-bold')}
          aria-live='polite'
        >
          {displayedLikeCount.toLocaleString()}
        </span>
      </Button>
      {/* Tooltip */}
      <span className='border-border bg-card text-foreground pointer-events-none absolute top-full left-1/2 z-20 mt-1 w-max -translate-x-1/2 scale-95 border px-2 py-1 text-xs opacity-0 shadow transition-all group-focus-within:opacity-100 group-hover:opacity-100'>
        {tooltipLabel}
      </span>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .animate-heart-pop {
            animation: heart-pop 0.4s cubic-bezier(.36,1.56,.64,1) both;
          }
        }
        @keyframes heart-pop {
          0% { transform: scale(1); }
          30% { transform: scale(1.3); }
          60% { transform: scale(0.95); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default LikeButton
