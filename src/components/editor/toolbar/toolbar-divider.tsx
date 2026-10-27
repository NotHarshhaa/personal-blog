import { cn } from '@/utils'

export const ToolbarDivider = ({ className }: { className?: string }) => (
  <div role='separator' className={cn('bg-border mx-1 h-5 w-px shrink-0 self-center', className)} />
)
