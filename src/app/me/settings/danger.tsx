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

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
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
    <Frame className="border-destructive/40">
      <FrameHeader label="Danger zone" />
      <FrameBody className="space-y-4">
        <div className="flex flex-col items-start gap-4 border-b border-border pb-4 sm:flex-row sm:items-center">
          <span className="flex size-12 shrink-0 items-center justify-center border border-destructive/40 bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </span>
          <div className="flex-1">
            <h4 className="mb-1 text-lg font-semibold text-destructive">
              Delete account
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This action will{' '}
              <span className="font-semibold text-foreground">permanently</span>{' '}
              remove all your posts, likes, and personal information. This cannot
              be undone.
            </p>
          </div>
        </div>

        <div className="border border-border bg-muted/30 p-4 text-sm sm:p-5">
          <div className="mb-3 flex items-center gap-2 font-semibold">
            <AlertTriangle className="size-4" />
            What will be deleted:
          </div>
          <ul className="ml-1 list-inside list-disc space-y-1.5 text-muted-foreground">
            <li>Your profile and account</li>
            <li>All your posts and comments</li>
            <li>All your likes and social data</li>
            <li>All your settings and preferences</li>
          </ul>
        </div>

        <AlertDialog open={isOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="lg"
              className="mt-2 w-full font-semibold"
              onClick={() => {
                setIsOpen(true)
              }}
            >
              <AlertTriangle className="mr-2 size-5" />
              Delete my account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-md border-border">
            <form onSubmit={handleDeleteAccount} className="space-y-5">
              <AlertDialogHeader>
                <div className="mb-2 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center border border-destructive/40 bg-destructive/10">
                    <AlertTriangle className="size-5 text-destructive" />
                  </span>
                  <AlertDialogTitle className="text-lg text-destructive sm:text-xl">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                </div>
                <AlertDialogDescription className="text-sm leading-relaxed">
                  This action cannot be undone. This will permanently delete your
                  account and remove your data from our database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex flex-col gap-3">
                <Label htmlFor="confirm" className="text-sm font-medium">
                  Type{' '}
                  <span className="font-semibold text-destructive">
                    delete my account
                  </span>{' '}
                  to continue:
                </Label>
                <Input
                  type="text"
                  id="confirm"
                  onChange={(e) => {
                    setValue(e.target.value)
                  }}
                  required
                  className="border-destructive/50 focus-visible:ring-destructive"
                  placeholder="delete my account"
                />
                <label className="mt-1 flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    className="size-4 cursor-pointer accent-destructive"
                  />
                  <span>I understand this action is irreversible</span>
                </label>
              </div>
              <AlertDialogFooter className="gap-2 sm:gap-0">
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
                  className={cn(
                    buttonVariants({ variant: 'destructive', size: 'lg' }),
                    'px-6 font-semibold'
                  )}
                  type="submit"
                  disabled={
                    value !== 'delete my account' ||
                    !checked ||
                    action.isExecuting
                  }
                >
                  {action.isExecuting ? (
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="mr-2 size-4" />
                  )}
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      </FrameBody>
    </Frame>
  )
}

export default Danger
