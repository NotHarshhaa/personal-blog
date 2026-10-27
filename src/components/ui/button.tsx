import type { VariantProps } from 'cva'

import { Slot } from '@radix-ui/react-slot'
import { cva } from 'cva'

import { CornerBrackets } from '@/components/frame'
import { cn } from '@/utils'

const buttonVariants = cva({
  base: [
    'group/btn relative inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-xs font-mono font-medium tracking-wider uppercase outline-none transition-all duration-150 cursor-pointer select-none active:translate-y-[1px]',
    'focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-1 focus-visible:ring-offset-background',
    'aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive',
    'disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    "[&_svg:not([class*='size-'])]:size-3.5"
  ],
  variants: {
    variant: {
      default:
        'border border-foreground bg-foreground text-background shadow-xs hover:bg-foreground/90 hover:border-foreground/90 active:bg-foreground/80',
      destructive:
        'border border-destructive/50 bg-destructive/10 text-destructive shadow-xs hover:bg-destructive hover:text-white dark:hover:text-white active:bg-destructive/90',
      outline:
        'border border-border bg-background text-foreground shadow-xs hover:border-foreground hover:bg-muted/40 active:bg-muted/60',
      secondary:
        'border border-border/80 bg-muted/60 text-foreground shadow-xs hover:bg-muted hover:border-foreground/40 active:bg-muted/80',
      ghost:
        'border border-transparent text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground active:bg-muted/60',
      link:
        'text-foreground underline-offset-4 hover:underline normal-case tracking-normal',
      blueprint:
        'border border-foreground/80 bg-card text-foreground shadow-xs hover:bg-foreground hover:text-background tracking-widest'
    },
    size: {
      default: 'h-9 px-4 py-2 has-[>svg]:px-3',
      sm: 'h-7.5 px-3 py-1 text-[11px] gap-1.5 has-[>svg]:px-2.5',
      lg: 'h-10.5 px-6 py-2.5 text-sm gap-2.5 has-[>svg]:px-4',
      icon: 'size-9 p-0',
      'icon-sm': 'size-7.5 p-0',
      'icon-lg': 'size-10.5 p-0'
    }
  },
  defaultVariants: {
    variant: 'default',
    size: 'default'
  }
})

type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    corners?: boolean
  }

const Button = (props: ButtonProps) => {
  const {
    className,
    variant,
    size,
    type = 'button',
    asChild = false,
    corners = false,
    children,
    ...rest
  } = props

  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...rest}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      data-slot="button"
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...rest}
    >
      {corners && (
        <CornerBrackets className="size-1.5 border-foreground/60 transition-colors group-hover/btn:border-foreground" />
      )}
      {children}
    </button>
  )
}

export { Button, buttonVariants }
