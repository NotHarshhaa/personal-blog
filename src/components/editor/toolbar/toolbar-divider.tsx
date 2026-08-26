import { cn } from '@/utils'

export const ToolbarDivider = ({ className }: { className?: string }) => (
  <div
    role="separator"
    className={cn('mx-1 h-5 w-px bg-border shrink-0 self-center', className)}
  />
)
