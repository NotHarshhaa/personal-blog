'use client'

import type { User } from '@/db/schema'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  buttonVariants,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  toast
} from '@/components/ui'
import { Loader2Icon, MoreVerticalIcon, PencilIcon, Share2Icon, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { useAction } from 'next-safe-action/hooks'
import { useState, useRef, useEffect } from 'react'

import { deletePostAction } from '@/actions/delete-post-action'
import { SITE_URL } from '@/lib/constants'
import { copyUrl } from '@/utils/copy-url'

type ControlsProps = {
  id: string
  user: User | null
  authorId: string
  postTitle: string
}

const Controls = (props: ControlsProps) => {
  const { id, user, authorId, postTitle } = props
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const isScrollingRef = useRef(false)

  const action = useAction(deletePostAction, {
    onSuccess: () => {
      toast.success('Post deleted')
    },
    onError: ({ error }) => {
      toast.error(error.serverError)
    }
  })

  const handleDelete = async () => {
    await action.executeAsync({ postId: id })
  }

  // Prevent dropdown from opening during scroll and close it when scrolling
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      isScrollingRef.current = true
      // Close dropdown if open during scroll
      if (isDropdownOpen) {
        setIsDropdownOpen(false)
      }
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        isScrollingRef.current = false
      }, 200)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('touchmove', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchmove', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [isDropdownOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const touch = e.changedTouches[0]
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
    const deltaTime = Date.now() - touchStartRef.current.time

    // If user scrolled (moved finger significantly) or scroll just happened, don't open menu
    if (isScrollingRef.current || deltaY > 15 || deltaX > 15 || deltaTime > 250) {
      touchStartRef.current = null
      e.preventDefault()
      e.stopPropagation()
      return
    }

    // Only open on tap, not scroll
    touchStartRef.current = null
  }

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='shrink-0'
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={(e) => {
              // Mark as scrolling if finger moves
              if (touchStartRef.current) {
                const touch = e.touches[0]
                const deltaY = Math.abs(touch.clientY - touchStartRef.current.y)
                if (deltaY > 5) {
                  isScrollingRef.current = true
                }
              }
            }}
            onClick={(e) => {
              // Prevent opening if we're in a scroll gesture
              if (isScrollingRef.current) {
                e.preventDefault()
                e.stopPropagation()
                setIsDropdownOpen(false)
                return
              }
            }}
          >
            <MoreVerticalIcon className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' onCloseAutoFocus={(e) => e.preventDefault()}>
          <DropdownMenuItem onClick={() => copyUrl(`${SITE_URL}/posts/${id}`)}>
            <Share2Icon className='mr-2 size-4' />
            Share
          </DropdownMenuItem>
          {user && user.id === authorId && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/editor/${id}`}>
                  <PencilIcon className='mr-2 size-4' />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setIsOpen(true)
                  setIsDropdownOpen(false)
                }}
              >
                <Trash2Icon className='mr-2 size-4' />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{postTitle}&quot; will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={action.isExecuting}
              className={buttonVariants({
                variant: 'destructive'
              })}
            >
              {action.isExecuting ? <Loader2Icon className='mr-2 size-4 animate-spin' /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default Controls
