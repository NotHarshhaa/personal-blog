'use client'

import { Button } from '@/components/ui'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

const LoginButton = () => {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const pathname = searchParams.get('redirect') ?? '/'

  return (
    <div className='flex flex-col items-center gap-4 w-full'>
      <Button
        onClick={() => {
          setLoading(true)
          void signIn('google', {
            redirect: false,
            callbackUrl: pathname
          })
        }}
        variant='outline'
        size='lg'
        className='group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl border border-border/40 bg-white/60 dark:bg-zinc-800/60 px-6 py-3 font-semibold text-foreground shadow-md backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary hover:shadow-lg motion-safe:md:hover:scale-[1.02] motion-reduce:transform-none'
        disabled={loading}
        aria-label="Continue with Google"
      >
        <Image 
          src='/images/google.svg' 
          alt='Google' 
          width={20} 
          height={20} 
          className='transition-transform duration-300 motion-safe:group-hover:scale-110 motion-reduce:transform-none shrink-0' 
        />
        <span className='transition-colors duration-300'>Continue with Google</span>
        {loading && (
          <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
      </Button>
      
      <div className="relative flex items-center w-full my-2">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <span className="relative z-10 mx-4 rounded-full bg-background px-3 text-xs font-medium text-muted-foreground select-none border border-border/40">
          or
        </span>
      </div>

      {/* Placeholder for future providers */}
      {/* <Button ...>Continue with GitHub</Button> */}
      
      <p className='text-center text-xs text-muted-foreground leading-relaxed'>
        By continuing, you agree to our{' '}
        <a href="/terms" className="underline hover:text-primary transition-colors font-medium">Terms of Service</a>
        {' '}and{' '}
        <a href="/privacy" className="underline hover:text-primary transition-colors font-medium">Privacy Policy</a>.
      </p>
    </div>
  )
}

export default LoginButton
