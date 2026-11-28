import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'cva'

import { cn } from '@/utils'

const badgeVariants = cva({
  base: [
    'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wider whitespace-nowrap uppercase transition-[color,background-color,border-color]',
    'dark:aria-invalid:ring-destructive/40',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
    '[&>svg]:pointer-events-none [&>svg]:size-3'
  ],
  variants: {
    variant: {
      default: 'border-foreground/80 bg-foreground text-background',
      secondary: 'border-border bg-muted text-foreground',
      destructive: 'border-destructive/50 bg-destructive/12 text-destructive',
      success: 'border-success/50 bg-success/12 text-success',
      warning: 'border-warning/50 bg-warning/12 text-warning',
      outline: 'border-border bg-background text-foreground'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
})

type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
  }

const Badge = (props: BadgeProps) => {
  const { className, variant, asChild = false, ...rest } = props
  const Comp = asChild ? Slot : 'span'

  return <Comp data-slot='badge' className={cn(badgeVariants({ variant }), className)} {...rest} />
}

export { Badge, badgeVariants }
