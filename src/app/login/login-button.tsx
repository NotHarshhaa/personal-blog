'use client'

import { Button } from '@tszhong0411/ui'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

const LoginButton = () => {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const pathname = searchParams.get('redirect') ?? '/'

  return (
    <div className='flex flex-col items-center gap-4'>
      <Button
        onClick={() => {
          setLoading(true)
          void signIn('google', {
            redirect: false,
            callbackUrl: pathname
          })
        }}
        variant='outline'
        className='group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-border/50 bg-white/50 px-4 py-2 font-medium text-foreground shadow-lg backdrop-blur-md transition-all duration-300 hover:border-border/80 hover:bg-white/80 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80 motion-safe:md:hover:scale-[1.02] motion-safe:md:hover:shadow-xl motion-reduce:transform-none'
        disabled={loading}
        aria-label="Continue with Google"
      >
        <Image src='/images/google.svg' alt='Google' width={20} height={20} className='transition-transform duration-300 motion-safe:group-hover:scale-110 motion-reduce:transform-none' />
        <span className='transition-colors duration-300'>Continue with Google</span>
      </Button>
      <div className="flex items-center w-full my-6">
        <div className="flex-1 h-px bg-border/60" />
        <span className="mx-3 text-xs text-muted-foreground select-none">or</span>
        <div className="flex-1 h-px bg-border/60" />
      </div>
      {/* Placeholder for future providers */}
      {/* <Button ...>Continue with GitHub</Button> */}
      <p className='text-center text-sm text-muted-foreground'>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}

export default LoginButton
