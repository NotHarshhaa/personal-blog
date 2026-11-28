import { cn } from '@/utils'

type SkeletonProps = React.ComponentProps<'div'>

const Skeleton = (props: SkeletonProps) => {
  const { className, ...rest } = props

  return (
    <div
      data-slot='skeleton'
      className={cn('bg-muted animate-pulse rounded-none', className)}
      {...rest}
    />
  )
}

export { Skeleton }
