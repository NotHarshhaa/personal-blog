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
    <div className="flex w-full flex-col items-center gap-4">
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
        className="flex w-full items-center justify-center gap-3"
        disabled={loading}
        aria-label="Continue with Google"
      >
        <Image
          src="/images/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="shrink-0"
        />
        <span>Continue with Google</span>
        {loading && (
          <span className="ml-1 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
      </Button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By continuing, you agree to our{' '}
        <a
          href="/terms"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href="/privacy"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}

export default LoginButton
