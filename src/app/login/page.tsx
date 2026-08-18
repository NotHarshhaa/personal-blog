import type { Metadata } from 'next'

import { redirect } from 'next/navigation'
import { LockIcon } from 'lucide-react'

import { getCurrentUser } from '@/lib/auth'
import { Frame, FrameBody, FrameHeader } from '@/components/frame'

import LoginButton from './login-button'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to DevOps, Cloud & AI Space'
}

const LoginPage = async () => {
  const user = await getCurrentUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center py-8">
      <Frame className="w-full max-w-md">
        <FrameHeader label="Account" />
        <FrameBody className="flex flex-col items-center gap-6">
          <span className="flex size-12 items-center justify-center border border-border bg-background">
            <LockIcon className="size-5" />
          </span>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Log in to DevOps, Cloud & AI Space to continue.
            </p>
          </div>

          <div className="w-full">
            <LoginButton />
          </div>

          <div className="w-full space-y-1 border-t border-border pt-4 text-center text-xs text-muted-foreground">
            <p>
              By logging in, you agree to our{' '}
              <a
                href="/privacy"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Privacy Policy
              </a>
              .
            </p>
            <p>
              Need help?{' '}
              <a
                href="mailto:harshhaa03@gmail.com"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Contact support
              </a>
              .
            </p>
          </div>
        </FrameBody>
      </Frame>
    </div>
  )
}

export default LoginPage
