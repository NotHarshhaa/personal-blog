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
    <div className="min-h-content flex w-full flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md mx-auto relative">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10 -z-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative rounded-2xl border border-border/40 bg-white/90 dark:bg-zinc-900/90 shadow-xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col items-center gap-6 backdrop-blur-md overflow-hidden">
          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

          <div className="flex flex-col items-center gap-3 mt-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-xl opacity-50" />
              <div className="relative rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-5 border border-primary/20 shadow-lg">
                <LockIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-blue-500 dark:from-primary dark:to-cyan-400 bg-clip-text text-transparent">
                Welcome back!
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base text-center max-w-sm">
                Log in to your DevOps & Cloud Space account to continue.
              </p>
            </div>
          </div>

          <div className="w-full">
            <LoginButton />
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1 pt-2 border-t border-border/20 w-full">
            <p>
              By logging in, you agree to our{' '}
              <a href="/privacy" className="underline hover:text-primary transition-colors font-medium">Privacy Policy</a>.
            </p>
            <p>
              Need help?{' '}
              <a href="mailto:harshhaa03@gmail.com" className="underline hover:text-primary transition-colors font-medium">Contact support</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
