import { cn } from '@/utils'

type InputProps = React.ComponentProps<'input'>

const Input = (props: InputProps) => {
  const { className, type, ...rest } = props

  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'border-input bg-background text-foreground flex h-9 w-full min-w-0 rounded-none border px-3 py-1 text-base shadow-2xs transition-[color,border-color,box-shadow] outline-none',
        'md:text-sm',
        'file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'placeholder:text-muted-foreground',
        'selection:bg-primary selection:text-primary-foreground',
        'focus-visible:border-foreground focus-visible:ring-ring/35 focus-visible:ring-2',
        'aria-invalid:ring-destructive/25 aria-invalid:border-destructive',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...rest}
    />
  )
}

export { Input }
