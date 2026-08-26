'use client'

import { Loader2Icon } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

import { Button } from '@/components/ui'

const LoginButton = () => {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const pathname = searchParams.get('redirect') ?? '/'

  return (
    <Button
      onClick={() => {
        setLoading(true)
        void signIn('google', {
          redirect: false,
          callbackUrl: pathname
        })
      }}
      variant="outline"
      size="lg"
      className="group relative flex h-12 w-full items-center justify-center gap-3 border-border/80 bg-background/60 text-sm font-medium shadow-xs backdrop-blur-xs transition-all duration-200 hover:border-foreground/30 hover:bg-accent/40 active:scale-[0.99]"
      disabled={loading}
      aria-label="Continue with Google"
    >
      {loading ? (
        <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <Image
          src="/images/google.svg"
          alt="Google"
          width={18}
          height={18}
          className="shrink-0 transition-transform duration-200 group-hover:scale-110"
        />
      )}
      <span>Continue with Google</span>
    </Button>
  )
}

export default LoginButton
