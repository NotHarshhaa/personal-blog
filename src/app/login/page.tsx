import type { Metadata } from 'next'

import { redirect } from 'next/navigation'

import { getCurrentUser } from '@/lib/auth'

import LoginButton from './login-button'
import { LockIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Log in',
  description: 'Log in to DevOps/Cloud Blog Space'
}

const LoginPage = async () => {
  const user = await getCurrentUser()

  if (user) {
    redirect('/')
  }

  return (
    <div className="min-h-content flex w-full flex-col items-center justify-center p-4 from-blue-50/60 via-white/80 to-indigo-100/60 dark:from-zinc-900/80 dark:to-zinc-800/80">
      <div className="w-full max-w-md mx-auto rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 shadow-xl px-8 py-10 flex flex-col items-center gap-6 backdrop-blur-md">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-primary/10 p-4 mb-2">
            <LockIcon className="w-10 h-10 text-primary" />
          </div>
          <div className="text-3xl font-bold tracking-tight mb-1">Welcome back!</div>
          <p className="text-muted-foreground text-base text-center mb-2">
            Log in to your DevOps & Cloud Space account to continue.
          </p>
        </div>
        <LoginButton />
        <div className="text-xs text-muted-foreground text-center mt-2">
          By logging in, you agree to our{' '}
          <a href="/privacy" className="underline hover:text-primary transition">Privacy Policy</a>.
          <br />
          Need help? <a href="mailto:harshhaa03@gmail.com" className="underline hover:text-primary transition">Contact support</a>.
        </div>
      </div>
    </div>
  )
}

export default LoginPage
