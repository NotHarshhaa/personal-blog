'use client'

import { Loader2Icon, RefreshCwIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'

import { refreshFakeEngagementAction } from '@/actions/refresh-fake-engagement-action'
import { Button, toast } from '@/components/ui'

const RefreshFakeEngagementButton = () => {
  const router = useRouter()
  const action = useAction(refreshFakeEngagementAction, {
    onSuccess: ({ data }) => {
      toast.success(`Updated fake engagement for ${data?.updatedPosts ?? 0} posts`)
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError)
    }
  })

  return (
    <Button
      variant='outline'
      onClick={() => action.execute()}
      disabled={action.isExecuting}
    >
      {action.isExecuting ? (
        <Loader2Icon className='animate-spin' />
      ) : (
        <RefreshCwIcon />
      )}
      {action.isExecuting ? 'Refreshing engagement' : 'Refresh fake engagement'}
    </Button>
  )
}

export default RefreshFakeEngagementButton
