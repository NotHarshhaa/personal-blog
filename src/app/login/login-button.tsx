'use client'

import { Button } from '@tszhong0411/ui'
import { Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

const LoginButton = () => {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const pathname = searchParams.get('redirect') ?? '/'

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto mt-12">
      <Button
        onClick={() => {
          setLoading(true)
          void signIn('google', {
            redirect: false,
            callbackUrl: pathname
          })
        }}
        variant="outline"
        className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl shadow-lg bg-white/80 dark:bg-zinc-900/80 border border-border/40 hover:bg-white/90 dark:hover:bg-zinc-900/90 transition-all duration-150 ease-in-out focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
        disabled={loading}
        aria-label="Continue with Google"
      >
        {loading ? (
          <Loader2Icon className="mr-2.5 size-5 animate-spin" />
        ) : (
          <Image src="/images/google.svg" width={22} height={22} alt="Google" className="mr-2" />
        )}
        <span className="font-semibold text-base tracking-tight">Continue with Google</span>
      </Button>
      <div className="flex items-center w-full my-6">
        <div className="flex-1 h-px bg-border/60" />
        <span className="mx-3 text-xs text-muted-foreground select-none">or</span>
        <div className="flex-1 h-px bg-border/60" />
      </div>
      {/* Placeholder for future providers */}
      {/* <Button ...>Continue with GitHub</Button> */}
    </div>
  )
}

export default LoginButton
