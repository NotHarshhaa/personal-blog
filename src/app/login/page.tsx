import type { Metadata } from 'next'

import { LockIcon, ShieldCheckIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import { Frame, FrameBody, FrameHeader } from '@/components/frame'
import { getCurrentUser } from '@/lib/auth'

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
    <div className='relative z-10 flex min-h-[calc(100vh-22rem)] w-full items-center justify-center py-8'>
      {/* Background ambient accent glow */}
      <div
        aria-hidden
        className='bg-primary/5 pointer-events-none absolute -top-12 size-72 rounded-full blur-3xl'
      />

      <Frame className='w-full max-w-md shadow-sm'>
        <FrameHeader label='Authentication' />
        <FrameBody className='flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-8 sm:py-10'>
          {/* Centered Lock Icon Badge */}
          <div className='border-border bg-background flex size-14 items-center justify-center border shadow-xs'>
            <LockIcon className='text-foreground size-6' />
          </div>

          {/* Centered Headings */}
          <div className='flex w-full flex-col items-center justify-center space-y-2 text-center'>
            <h1 className='text-foreground mx-auto block text-center text-2xl font-bold tracking-tight sm:text-3xl'>
              Welcome back
            </h1>
            <p className='text-muted-foreground mx-auto max-w-xs text-center text-sm text-pretty'>
              Log in to DevOps, Cloud & AI Space to share insights, engage, and manage your posts.
            </p>
          </div>

          {/* Google Login Action */}
          <div className='w-full pt-1'>
            <Suspense
              fallback={
                <div className='border-border bg-muted/40 h-12 w-full animate-pulse border' />
              }
            >
              <LoginButton />
            </Suspense>
          </div>

          {/* Security Badge */}
          <div className='border-border bg-muted/40 text-muted-foreground inline-flex items-center gap-1.5 border px-3 py-1 font-mono text-[11px]'>
            <ShieldCheckIcon className='text-success size-3.5' />
            <span>Secure & fast authentication via OAuth 2.0</span>
          </div>

          {/* Footer Legal & Support Links */}
          <div className='border-border/70 text-muted-foreground w-full border-t pt-4 text-center text-xs'>
            <p>
              By continuing, you agree to our{' '}
              <Link
                href='/privacy'
                className='text-foreground hover:text-primary font-medium underline underline-offset-3 transition-colors'
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p className='mt-1.5'>
              Need assistance?{' '}
              <a
                href='mailto:harshhaa03@gmail.com'
                className='text-foreground hover:text-primary font-medium underline underline-offset-3 transition-colors'
              >
                Contact support
              </a>
            </p>
          </div>
        </FrameBody>
      </Frame>
    </div>
  )
}

export default LoginPage
