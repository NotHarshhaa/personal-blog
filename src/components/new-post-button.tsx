'use client'

import { Button, toast } from '@/components/ui'
import { Loader2Icon, PenSquareIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'

import { createPostAction } from '@/actions/create-post-action'
import { cn } from '@/lib/utils'

type NewPostButtonProps = {
  className?: string
  compact?: boolean
}

const NewPostButton = ({ className, compact = false }: NewPostButtonProps) => {
  const router = useRouter()
  const action = useAction(createPostAction, {
    onSuccess: ({ data }) => {
      if (!data?.postId) {
        toast.error('Failed to create new post')
        return
      }
      router.refresh()
      router.push(`/editor/${data.postId}`)
    },
    onError: ({ error }) => {
      toast.error(error.serverError)
    }
  })

  const newPost = async () => {
    await action.executeAsync({ title: 'Untitled post' })
  }

  return (
    <Button
      variant="ghost"
      className={cn(compact ? 'size-9 px-0' : 'py-1.5', className)}
      onClick={newPost}
      disabled={action.isExecuting}
      aria-label={compact ? 'Write new post' : undefined}
    >
      {action.isExecuting ? (
        <Loader2Icon className={cn('size-4 animate-spin', !compact && 'mr-2')} />
      ) : (
        <PenSquareIcon className={cn('size-4', !compact && 'mr-2')} />
      )}
      {!compact && 'Write'}
    </Button>
  )
}

export default NewPostButton
