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
import { cn } from '@/lib/utils'

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
    <div className='rounded-2xl border-2 border-red-500/40 bg-red-50/50 dark:bg-red-900/20 shadow-lg p-0 overflow-hidden relative'>
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-red-500/60 to-transparent" />

      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6 border-b border-red-500/20 bg-red-100/50 dark:bg-red-900/30'>
        <div className="flex items-center justify-center size-12 sm:size-14 rounded-full bg-red-500/10 dark:bg-red-500/20 shrink-0">
          <AlertTriangle className='w-6 h-6 sm:w-7 sm:h-7 text-red-600 dark:text-red-400' />
        </div>
        <div className="flex-1">
          <h4 className='text-lg sm:text-xl font-bold text-red-700 dark:text-red-300 mb-1.5'>Danger Zone</h4>
          <p className='text-sm text-red-800/80 dark:text-red-200/80 leading-relaxed'>
            This action will <span className='font-semibold text-red-700 dark:text-red-300'>permanently</span> remove all your posts, likes, and personal information. This cannot be undone.
          </p>
        </div>
      </div>
      <div className='p-5 sm:p-6 space-y-4'>
        <div className='bg-red-100/60 dark:bg-red-900/30 rounded-xl p-4 sm:p-5 text-sm text-red-900 dark:text-red-200 border border-red-200/50 dark:border-red-800/50'>
          <div className='font-semibold mb-3 flex items-center gap-2'>
            <AlertTriangle className='w-4 h-4' />
            What will be deleted:
          </div>
          <ul className='list-disc list-inside space-y-1.5 ml-1'>
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
              className='w-full font-bold text-base sm:text-lg py-3 mt-2 shadow-md hover:shadow-lg transition-all rounded-xl'
              onClick={() => {
                setIsOpen(true)
              }}
            >
              <AlertTriangle className='w-5 h-5 mr-2' />
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className='rounded-2xl max-w-md'>
            <form onSubmit={handleDeleteAccount} className='space-y-5'>
              <AlertDialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center size-10 rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className='w-5 h-5 text-red-600 dark:text-red-400' />
                  </div>
                  <AlertDialogTitle className='text-lg sm:text-xl text-red-700 dark:text-red-300'>Are you absolutely sure?</AlertDialogTitle>
                </div>
                <AlertDialogDescription className='text-sm leading-relaxed'>
                  This action cannot be undone. This will permanently delete your account and remove your data from our database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className='flex flex-col gap-3'>
                <Label htmlFor='confirm' className='text-sm font-medium'>
                  Type <span className='text-red-700 dark:text-red-300 font-semibold'>delete my account</span> to continue:
                </Label>
                <Input
                  type='text'
                  id='confirm'
                  onChange={(e) => {
                    setValue(e.target.value)
                  }}
                  required
                  className='rounded-xl border-red-400 focus:ring-red-500 focus:border-red-500'
                  placeholder='delete my account'
                />
                <label className='flex items-center gap-2.5 mt-1 text-sm cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={checked}
                    onChange={e => setChecked(e.target.checked)}
                    className='accent-red-500 w-4 h-4 rounded border border-red-400 cursor-pointer'
                  />
                  <span>I understand this action is irreversible</span>
                </label>
              </div>
              <AlertDialogFooter className='gap-2 sm:gap-0'>
                <AlertDialogCancel
                  onClick={() => {
                    setIsOpen(false)
                    setValue('')
                    setChecked(false)
                  }}
                  className='rounded-xl'
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className={cn(buttonVariants({ variant: 'destructive', size: 'lg' }), 'font-bold px-6 rounded-xl')}
                  type='submit'
                  disabled={value !== 'delete my account' || !checked || action.isExecuting}
                >
                  {action.isExecuting ? <Loader2Icon className='mr-2 size-4 animate-spin' /> : <AlertTriangle className='w-4 h-4 mr-2' />}
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
