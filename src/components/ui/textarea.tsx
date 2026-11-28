'use client'

import TextareaAutosize from 'react-textarea-autosize'

import { cn } from '@/utils'

type TextareaProps = React.ComponentProps<typeof TextareaAutosize>

const Textarea = (props: TextareaProps) => {
  const { className, ...rest } = props

  return (
    <TextareaAutosize
      data-slot='textarea'
      className={cn(
        'border-input bg-background text-foreground flex field-sizing-content min-h-16 w-full rounded-none border px-3 py-2 text-base shadow-2xs transition-[color,border-color,box-shadow] outline-none',
        'md:text-sm',
        'placeholder:text-muted-foreground',
        'focus-visible:border-foreground focus-visible:ring-ring/35 focus-visible:ring-2',
        'aria-invalid:ring-destructive/25 aria-invalid:border-destructive',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...rest}
    />
  )
}

export { Textarea }
