'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  buttonVariants,
  Input,
  Label,
  toast
} from '@/components/ui'
import { Loader2Icon, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { useState } from 'react'

import { deleteAccountAction } from '@/actions/delete-account-action'

const Danger = () => {
  const [value, setValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const action = useAction(deleteAccountAction, {
    onSuccess: () => {
      toast.success('Your account has been deleted')
      router.push('/')
      router.refresh()
    },
    onError: ({ error }) => {
      toast.error(error.serverError)
    }
  })
  const router = useRouter()

  const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (value !== 'delete my account') {
      toast.error('Please type "delete my account" to continue')
      return
    }
    if (!checked) {
      toast.error('Please confirm the checkbox to continue')
      return
    }

    await action.executeAsync()
  }

  return (
    <div className='rounded-2xl border-2 border-red-500/60 bg-red-50/60 dark:bg-red-900/30 shadow-lg p-0 overflow-hidden'>
      <div className='flex items-center gap-4 p-6 border-b border-red-500/30 bg-red-100/60 dark:bg-red-900/40'>
        <AlertTriangle className='w-10 h-10 text-red-500 animate-pulse' />
        <div>
          <h4 className='text-xl font-bold text-red-700 dark:text-red-300 mb-1'>Danger Zone: Delete my account</h4>
          <p className='text-muted-foreground text-sm'>
            This action will <span className='font-semibold text-red-700'>permanently</span> remove all your posts, likes, and personal information. This cannot be undone.
          </p>
        </div>
      </div>
      <div className='p-6 space-y-4'>
        <div className='bg-red-100/60 dark:bg-red-900/40 rounded-lg p-4 text-sm text-red-900 dark:text-red-200'>
          <div className='font-semibold mb-2'>What will be deleted:</div>
          <ul className='list-disc list-inside space-y-1'>
            <li>Your profile and account</li>
            <li>All your posts and comments</li>
            <li>All your likes and social data</li>
            <li>All your settings and preferences</li>
          </ul>
        </div>
        <AlertDialog open={isOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant='destructive'
              size='lg'
              className='w-full font-bold text-lg py-3 mt-2 shadow-md hover:scale-105 transition-transform'
              onClick={() => {
                setIsOpen(true)
              }}
            >
              <AlertTriangle className='w-5 h-5 mr-2 animate-pulse' /> Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent asChild>
            <form onSubmit={handleDeleteAccount} className='space-y-4'>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-red-700 dark:text-red-300'>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className='flex flex-col gap-2'>
                <Label htmlFor='confirm' className='text-muted-foreground'>
                  Type <span className='text-secondary-foreground font-semibold'>delete my account</span> to continue:
                </Label>
                <Input
                  type='text'
                  id='confirm'
                  onChange={(e) => {
                    setValue(e.target.value)
                  }}
                  required
                  className='border-red-400 focus:ring-red-500'
                />
                <label className='flex items-center gap-2 mt-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={checked}
                    onChange={e => setChecked(e.target.checked)}
                    className='accent-red-500 w-4 h-4 rounded border border-red-400'
                  />
                  <span>I understand this action is irreversible</span>
                </label>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsOpen(false)
                    setValue('')
                    setChecked(false)
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className={buttonVariants({ variant: 'destructive', size: 'lg' }) + ' font-bold px-6'}
                  type='submit'
                  disabled={value !== 'delete my account' || !checked || action.isExecuting}
                >
                  {action.isExecuting ? <Loader2Icon className='mr-2 size-4 animate-spin' /> : <AlertTriangle className='w-5 h-5 mr-2 animate-pulse' />}
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export default Danger
