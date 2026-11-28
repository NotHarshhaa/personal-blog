import type { VariantProps } from 'cva'

import { Slot } from '@radix-ui/react-slot'
import { cva } from 'cva'

import { cn } from '@/utils'

const buttonVariants = cva({
  base: [
    'group/btn relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 font-mono text-xs font-medium tracking-wide whitespace-nowrap transition-[color,background-color,border-color,box-shadow,scale] duration-150 ease-out outline-none select-none enabled:active:scale-[0.96]',
    'focus-visible:ring-foreground focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
    'aria-invalid:border-destructive aria-invalid:ring-destructive aria-invalid:ring-1',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    "[&_svg:not([class*='size-'])]:size-3.5"
  ],
  variants: {
    variant: {
      default:
        'border-foreground bg-foreground text-background hover:border-foreground/90 hover:bg-foreground/90 active:bg-foreground/80 border',
      destructive:
        'border-destructive/60 bg-destructive/10 text-destructive hover:border-destructive hover:bg-destructive hover:text-destructive-foreground active:bg-destructive/90 border',
      outline:
        'border-border bg-card text-foreground hover:border-border-strong hover:bg-muted/60 active:bg-muted border',
      secondary:
        'border-border bg-muted/60 text-foreground hover:border-foreground/40 hover:bg-muted active:bg-muted/80 border',
      ghost:
        'text-muted-foreground hover:border-border/80 hover:bg-muted/40 hover:text-foreground active:bg-muted/60 border border-transparent',
      link: 'text-foreground tracking-normal normal-case underline-offset-4 hover:underline',
      blueprint:
        'border-foreground/70 bg-card text-foreground hover:border-foreground hover:bg-foreground hover:text-background border tracking-widest'
    },
    size: {
      default: 'h-9 px-4 py-2 has-[>svg]:px-3',
      sm: 'h-8 gap-1.5 px-3 py-1 text-xs has-[>svg]:px-2.5',
      lg: 'h-11 gap-2.5 px-6 py-2.5 text-sm has-[>svg]:px-4',
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
        data-slot='button'
        data-corners={corners ? '' : undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        {...rest}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      data-slot='button'
      data-corners={corners ? '' : undefined}
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...rest}
    >
      {children}
    </button>
  )
}

export { Button, buttonVariants }
