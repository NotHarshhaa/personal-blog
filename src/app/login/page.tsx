import type { Metadata } from 'next'

import { LockIcon, ShieldCheckIcon } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

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
    <div className="relative z-10 flex min-h-[calc(100vh-22rem)] w-full items-center justify-center py-8">
      {/* Background ambient accent glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 size-72 rounded-full bg-primary/5 blur-3xl"
      />

      <Frame className="w-full max-w-md shadow-sm">
        <FrameHeader label="Authentication" />
        <FrameBody className="flex flex-col items-center gap-6 px-6 py-8 text-center sm:px-8 sm:py-10">
          {/* Centered Lock Icon Badge */}
          <div className="flex size-14 items-center justify-center border border-border bg-background shadow-xs">
            <LockIcon className="size-6 text-foreground" />
          </div>

          {/* Centered Headings */}
          <div className="flex w-full flex-col items-center justify-center space-y-2 text-center">
            <h1 className="mx-auto block text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back
            </h1>
            <p className="mx-auto max-w-xs text-center text-sm text-muted-foreground text-pretty">
              Log in to DevOps, Cloud & AI Space to share insights, engage, and manage your posts.
            </p>
          </div>

          {/* Google Login Action */}
          <div className="w-full pt-1">
            <LoginButton />
          </div>

          {/* Security Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">
            <ShieldCheckIcon className="size-3.5 text-emerald-500" />
            <span>Secure & fast authentication via OAuth 2.0</span>
          </div>

          {/* Footer Legal & Support Links */}
          <div className="w-full border-t border-border/70 pt-4 text-center text-xs text-muted-foreground">
            <p>
              By continuing, you agree to our{' '}
              <Link
                href="/privacy"
                className="font-medium text-foreground underline underline-offset-3 transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p className="mt-1.5">
              Need assistance?{' '}
              <a
                href="mailto:harshhaa03@gmail.com"
                className="font-medium text-foreground underline underline-offset-3 transition-colors hover:text-primary"
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
