'use client'

import { CheckIcon, CopyIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { cn } from '@/utils'

type CopyRawButtonProps = {
  text: string
  label?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'blueprint'
  className?: string
  successMessage?: string
}

const CopyRawButton = ({
  text,
  label = 'Copy Raw',
  variant = 'outline',
  className,
  successMessage = 'Raw snippet copied to clipboard'
}: CopyRawButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsCopied(false), 2000)
    return () => clearTimeout(timeoutId)
  }, [isCopied])

  const handleCopy = () => {
    void navigator.clipboard.writeText(text)
    setIsCopied(true)
    toast.success(successMessage)
  }

  return (
    <Button
      type='button'
      variant={isCopied ? 'blueprint' : variant}
      size='sm'
      onClick={handleCopy}
      className={className}
      aria-label={`${label} — copy snippet source to clipboard`}
    >
      {isCopied ? <CheckIcon className='size-3.5' /> : <CopyIcon className='size-3.5' />}
      <span>{isCopied ? 'Copied' : label}</span>
      <span aria-hidden className={cn('sr-only')}>
        {successMessage}
      </span>
    </Button>
  )
}

export default CopyRawButton
