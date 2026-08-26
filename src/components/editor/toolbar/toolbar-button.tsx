import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/utils'

export type ToolbarButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: React.Ref<HTMLButtonElement>
  isActive?: boolean
  tooltip?: string
  shortcut?: string
  icon?: React.ReactNode
}

export const ToolbarButton = (props: ToolbarButtonProps) => {
  const {
    ref,
    isActive = false,
    tooltip,
    shortcut,
    icon,
    children,
    className,
    disabled,
    ...rest
  } = props

  const button = (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-sm font-medium transition-colors select-none',
        'focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-1',
        'disabled:pointer-events-none disabled:opacity-40',
        isActive
          ? 'bg-accent text-accent-foreground shadow-xs font-semibold'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        className
      )}
      {...rest}
    >
      {icon ?? children}
    </button>
  )

  if (!tooltip) {
    return button
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={6} className="flex items-center gap-1.5 px-2 py-1 text-xs">
        <span>{tooltip}</span>
        {shortcut && (
          <kbd className="rounded border border-border/40 bg-muted/60 px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
            {shortcut}
          </kbd>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
