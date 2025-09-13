'use client'

import type { Like, User } from '@/db/schema'

import { createId } from '@paralleldrive/cuid2'
import { Button, toast } from '@/components/ui'
import { cn } from '@/utils'
import { Heart } from 'lucide-react'
import { useOptimisticAction } from 'next-safe-action/hooks'
import { useState } from 'react'

import { togglePostLikeAction } from '@/actions/toggle-post-like-action'

type LikeButtonProps = {
  likes: Like[]
  user: User | null
  postId: string
}

const LikeButton = (props: LikeButtonProps) => {
  const { likes, user, postId } = props
  const [isAnimating, setIsAnimating] = useState(false)
  const action = useOptimisticAction(togglePostLikeAction, {
    currentState: { likes },
    updateFn: (state) => {
      if (!user) return state
      const existingLike = state.likes.find((like) => like.userId === user.id)

      if (existingLike) {
        return {
          likes: state.likes.filter((like) => like.id !== existingLike.id)
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
        ]
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError)
    }
  })

  const isUserLiked = action.optimisticState.likes.some((like) => like.userId === user?.id)
  const likeCount = action.optimisticState.likes.length

  const handleLike = async () => {
    setIsAnimating(true)
    await action.executeAsync({ postId })
    setTimeout(() => setIsAnimating(false), 400)
  }

  return (
    <div className='relative group'>
      <Button
        className={cn(
          'flex items-center gap-2 rounded-full border border-border/40 bg-white/80 px-3 py-1.5 text-sm font-medium shadow-sm transition-all duration-150 hover:bg-pink-50 focus-visible:ring-2 focus-visible:ring-pink-400 dark:bg-zinc-900/80',
          !user && 'cursor-not-allowed opacity-60',
          isUserLiked && 'text-pink-600 border-pink-200 dark:border-pink-400',
          isAnimating && 'scale-105'
        )}
        variant='ghost'
        disabled={!user || action.isExecuting}
        onClick={handleLike}
        aria-pressed={isUserLiked}
        aria-label={isUserLiked ? 'Unlike post' : 'Like post'}
        tabIndex={0}
        type='button'
      >
        <span className='relative flex items-center'>
          <Heart
            className={cn(
              'size-5 transition-all duration-200',
              isUserLiked
                ? 'fill-pink-500 text-pink-500 drop-shadow-pink animate-heart-pop'
                : 'text-gray-400 group-hover:text-pink-400',
              isAnimating && 'animate-heart-pop'
            )}
          />
        </span>
        <span
          className={cn(
            'transition-all duration-200',
            isAnimating && 'font-bold text-pink-600 scale-110'
          )}
          aria-live='polite'
        >
          {likeCount}
        </span>
      </Button>
      {/* Tooltip */}
      <span className='pointer-events-none absolute left-1/2 top-full z-20 mt-1 w-max -translate-x-1/2 scale-95 rounded bg-black/90 px-2 py-1 text-xs text-white opacity-0 shadow transition-all group-hover:opacity-100 group-focus-within:opacity-100'>
        {isUserLiked ? 'Unlike' : 'Like'}
      </span>
      {/* Loading spinner */}
      {action.isExecuting && (
        <span className='absolute right-0 top-0 flex h-full items-center pr-2'>
          <svg className='size-4 animate-spin text-pink-400' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' fill='none' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z' />
          </svg>
        </span>
      )}
      <style jsx>{`
        .animate-heart-pop {
          animation: heart-pop 0.4s cubic-bezier(.36,1.56,.64,1) both;
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
