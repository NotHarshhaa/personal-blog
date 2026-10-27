'use client'

import { CheckIcon, CopyIcon, TerminalIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CornerBrackets } from '@/components/frame'

type CurlCommandProps = {
  command: string
  hint?: string
}

const CurlCommand = ({ command, hint }: CurlCommandProps) => {
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsCopied(false), 2000)
    return () => clearTimeout(timeoutId)
  }, [isCopied])

  const handleCopy = () => {
    void navigator.clipboard.writeText(command)
    setIsCopied(true)
    toast.success('curl command copied to clipboard')
  }

  return (
    <figure className='border-border bg-muted/40 relative border'>
      <CornerBrackets className='size-2' />
      <figcaption className='border-border bg-card flex items-center justify-between gap-3 border-b px-3.5 py-2'>
        <span className='text-muted-foreground flex items-center gap-2 font-mono text-[10px] font-semibold tracking-widest uppercase'>
          <TerminalIcon className='text-foreground size-3.5' />
          Pipe it straight into your shell
        </span>
        <button
          type='button'
          onClick={handleCopy}
          className='border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground flex cursor-pointer items-center gap-1.5 border px-2 py-1 font-mono text-[10px] tracking-wider uppercase transition-colors'
          aria-label='Copy curl command to clipboard'
        >
          {isCopied ? <CheckIcon className='size-3' /> : <CopyIcon className='size-3' />}
          {isCopied ? 'Copied' : 'Copy'}
        </button>
      </figcaption>
      <div className='overflow-x-auto px-3.5 py-3'>
        <code className='text-foreground block font-mono text-xs leading-relaxed whitespace-pre sm:text-[13px]'>
          <span className='text-muted-foreground select-none'>$ </span>
          {command}
        </code>
      </div>
      {hint && (
        <p className='border-border text-muted-foreground border-t px-3.5 py-2 font-mono text-[10px]'>
          {hint}
        </p>
      )}
    </figure>
  )
}

export default CurlCommand
